/// <reference path="./extends.d.ts" />

import { type RouterContext } from '@koa/router'
import { fail, formatOffsetLimit, success } from '@server/utils'
import { Bmiss, type BmissCallbackData } from '@shared/bmiss'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@shared/constants'
import {
    BmissRecharge,
    BmissUser,
    BmissUserBalanceLog,
    BmissUserBet,
    BmissWithdrawal,
    CrownMainOdd,
    db,
    VMatch,
} from '@shared/db'
import { InnerError } from '@shared/inner-error'
import { publish } from '@shared/rabbitmq'
import { getSetting } from '@shared/settings'
import { createToken } from '@shared/token'
import Decimal from 'decimal.js'
import { Action, Controller, createRouter, FromBody, Post } from 'koa-decorator-helpers'
import { isEmpty } from 'lodash'
import { Attributes, Op, WhereOptions } from 'sequelize'
import z from 'zod'
import { RequireBmissUserToken } from './middlewares/require-bmiss-user-token'
import { ValidateBody } from './middlewares/validator'

/**
 * 接口控制器
 */
@Controller({ prefix: '/api' })
class ApiController {
    /**
     * 获取配置接口
     */
    @Action('/config')
    async config() {
        const settings = await getSetting(
            'bmiss_bet_min_bet_amount',
            'bmiss_bet_max_bet_per_match',
            'bmiss_bet_bet_multiple',
            'bmiss_bet_min_withdrawal',
            // 'bmiss_bet_max_withdrawal',
            'bmiss_bet_withdrawal_multiple',
        )

        //整理参数
        const data = Object.fromEntries(
            Object.entries(settings).map(([name, value]) => [name.substring(10), value]),
        )

        return success(data)
    }

    /**
     * 登录接口
     */
    @ValidateBody({
        openid: z.string().nonempty(),
        appid: z.string().nonempty(),
    })
    @Post('/login')
    async login(ctx: RouterContext, @FromBody params: { appid: string; openid: string }) {
        //先校验appid
        const bmiss = Bmiss.create(params.appid)
        if (!bmiss) {
            return fail(ctx.state.t('invalid_appid'))
        }

        //获取用户信息
        const ret = await bmiss.getUserInfo(params.openid)
        if (ret.code !== 200 || !ret.data) {
            return fail(ctx.state.t('login_fail'))
        }

        //查询或创建用户信息
        const [user, created] = await BmissUser.findOrCreate({
            where: {
                openid: params.openid,
                appid: params.appid,
            },
            defaults: {
                openid: params.openid,
                appid: params.appid,
                nickname: ret.data.nick_name,
                avatar: ret.data.avatar,
            },
        })

        //如果是旧用户就更新
        if (!created) {
            user.nickname = ret.data.nick_name
            user.avatar = ret.data.avatar
            if (user.changed()) {
                //资料有变更
                user.updated_at = new Date()
            }
            user.last_login_at = new Date()
            await user.save()
        }

        //返回用户信息和token
        const token = createToken({ type: 'bmiss', id: user.id })

        return success({
            token,
            user,
        })
    }

    /**
     * 获取竞猜记录接口
     */
    @RequireBmissUserToken
    @ValidateBody({
        match_id: z.optional(z.int().gte(0)),
        complete: z.optional(z.boolean()),
        page: z.optional(z.int().gt(0)),
        page_size: z.optional(z.int()),
    })
    @Post('/bet_records')
    async getBetRecords(
        ctx: RouterContext,
        @FromBody
        params: { match_id?: number; page?: number; page_size?: number; complete?: boolean },
    ) {
        //构建查询参数
        const where: WhereOptions<Attributes<BmissUserBet>> = {
            user_id: ctx.state.user.id,
        }
        if (typeof params.match_id === 'number') {
            where.match_id = params.match_id
        }
        if (typeof params.complete === 'boolean') {
            if (params.complete) {
                where.result = {
                    [Op.not]: null,
                }
            } else {
                where.result = null
            }
        }

        const { offset, limit } = (() => {
            let limit: number
            if (typeof params.page_size === 'number') {
                if (params.page_size <= 0) {
                    return {}
                }
                limit = params.page_size
            } else {
                limit = DEFAULT_PAGE_SIZE
            }
            const page =
                typeof params.page === 'number' && params.page >= 0 ? params.page : DEFAULT_PAGE
            return {
                offset: (page - 1) * limit,
                limit,
            }
        })()

        const { rows, count } = await BmissUserBet.findAndCountAll({
            where,
            include: [
                {
                    model: VMatch,
                    required: true,
                    attributes: ['id', 'match_time', 'team1_name', 'team2_name', 'tournament_name'],
                },
            ],
            order: [['id', 'desc']],
            offset,
            limit,
            attributes: [
                'id',
                'base',
                'type',
                'condition',
                'value',
                'amount',
                'created_at',
                'result',
                'result_amount',
                'result_text',
            ],
        })

        return success({
            list: rows,
            total: count,
        })
    }

    /**
     * 投注下单
     */
    @RequireBmissUserToken
    @ValidateBody({
        odd_id: z.int().gt(0),
        amount: z.int().gt(0),
        type: z.enum(['ah1', 'ah2', 'win1', 'win2', 'draw', 'over', 'under']),
    })
    @Post('/bet')
    async bet(
        ctx: RouterContext,
        @FromBody
        params: { odd_id: number; amount: number; type: OddType },
    ) {
        //读取需要的配置
        const { bmiss_bet_min_bet_amount, bmiss_bet_max_bet_per_match, bmiss_bet_bet_multiple } =
            await getSetting(
                'bmiss_bet_min_bet_amount',
                'bmiss_bet_max_bet_per_match',
                'bmiss_bet_bet_multiple',
            )

        //对参数做入参校验
        if (params.amount < bmiss_bet_min_bet_amount) {
            return fail(ctx.state.t('invalid_bet_amount'))
        }
        if (params.amount % bmiss_bet_bet_multiple !== 0) {
            return fail(ctx.state.t('invalid_bet_amount'))
        }
        if (params.amount > bmiss_bet_max_bet_per_match) {
            return fail(ctx.state.t('max_bet_reached'))
        }

        //首先读取盘口
        const odd = await CrownMainOdd.findOne({
            where: {
                id: params.odd_id,
            },
            include: [
                {
                    model: VMatch,
                    required: true,
                    attributes: ['match_time'],
                },
            ],
        })

        const now = new Date()

        if (!odd) {
            //盘口不存在
            return fail(ctx.state.t('odd_invalid'))
        }

        if (odd.match.match_time.valueOf() <= now.valueOf()) {
            //比赛已开始
            return fail(ctx.state.t('match_started'))
        }

        if (!odd.is_active) {
            //盘口已失效，这是个特殊的错误，需要额外返回正确的盘口数据
            const latest = await CrownMainOdd.findOne({
                where: {
                    match_id: odd.match_id,
                    base: odd.base,
                    is_active: 1,
                },
                attributes: ['id', 'condition', 'value1', 'value2'],
            })
            if (!latest) {
                return fail(ctx.state.t('odd_invalid'))
            }

            return fail(ctx.state.t('odd_invalid'), 202, latest)
        }

        //校验盘口与投注方向一致，并计算投注水位
        let value: NumberVal
        let condition: NumberVal
        switch (odd.base) {
            case 'ah':
                switch (params.type) {
                    case 'ah1':
                        value = odd.value1
                        condition = odd.condition
                        break
                    case 'ah2':
                        value = odd.value2
                        condition = Decimal(0).sub(odd.condition).toString()
                        break
                    default:
                        return fail(ctx.state.t('invalid_action'))
                }
                break
            case 'sum':
                condition = odd.condition
                switch (params.type) {
                    case 'under':
                        value = odd.value1
                        break
                    case 'over':
                        value = odd.value2
                        break
                    default:
                        return fail(ctx.state.t('invalid_action'))
                }
                break
            case 'win':
                condition = odd.condition
                switch (params.type) {
                    case 'win1':
                        value = odd.value1
                        break
                    case 'win2':
                        value = odd.value2
                        break
                    case 'draw':
                        value = odd.value0
                        break
                    default:
                        return fail(ctx.state.t('invalid_action'))
                }
                break
            default:
                return fail(ctx.state.t('invalid_action'))
        }

        const transaction = await db.transaction()
        try {
            //用户扣款
            const user = (await BmissUser.findByPk(ctx.state.user.id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
                attributes: ['balance'],
            }))!
            if (Decimal(user.balance).lt(params.amount)) {
                await transaction.rollback()
                return fail(ctx.state.t('insufficient_balance'), 201)
            }

            //检查用户在当前比赛的总投注额，如果超过了限制就不允许再投注
            const betSum = await BmissUserBet.sum('amount', {
                where: {
                    user_id: user.id,
                    match_id: odd.match.id,
                },
                transaction,
            })
            if (betSum + params.amount > bmiss_bet_max_bet_per_match) {
                await transaction.rollback()
                return fail(ctx.state.t('max_bet_reached'))
            }

            //修改账户余额
            user.balance = Decimal(user.balance).sub(params.amount).toString()
            await user.save({ transaction })

            //保存余额变动记录
            await BmissUserBalanceLog.create(
                {
                    user_id: user.id,
                    type: 'bet',
                    amount: 0 - params.amount,
                    balance_after: user.balance,
                    created_at: now,
                },
                { transaction },
            )

            //保存投注订单
            const bet = await BmissUserBet.create(
                {
                    user_id: ctx.state.user.id,
                    match_id: odd.match_id,
                    base: odd.base,
                    type: params.type,
                    condition,
                    value,
                    amount: params.amount,
                    created_at: now,
                },
                {
                    transaction,
                },
            )

            await transaction.commit()

            return success(bet)
        } catch (err) {
            await transaction.rollback()
            throw err
        }
    }

    /**
     * Bmiss回调
     */
    @Post('/callback')
    async callback(ctx: RouterContext, @FromBody params: BmissCallbackData) {
        //初始化bmiss服务对象
        const bmiss = Bmiss.create(params.appid)
        if (!bmiss) {
            ctx.status = 400
            ctx.body = 'invalid appid'
            return
        }

        //取出原始的请求数据
        const body = ctx.request.rawBody as string

        //校验签名
        const signature = bmiss.signature(body)
        if (signature !== ctx.request.query.signature) {
            ctx.status = 400
            ctx.body = 'invalid appid'
            return
        }

        if (params.type === 'consume') {
            //消费回调
            console.log('[消费回调]', params)

            //拆解out_order_no
            const match = /^bmiss_recharge_([0-9]+)$/.exec(params.data.out_order_no)
            if (!match) {
                console.error('[消费回调]', '订单号无效', params.data.out_order_no)
                ctx.status = 400
                ctx.body = 'invalid out_order_no'
                return
            }
            const recharge_id = parseInt(match[1])
            if (isNaN(recharge_id) || recharge_id <= 0) {
                console.error('[消费回调]', '订单号无效', params.data.out_order_no)
                ctx.body = 'invalid out_order_no'
                return
            }

            await this.checkRecharge(recharge_id)
        }

        ctx.status = 200
        ctx.body = ''
    }

    /**
     * 充值下单
     */
    @ValidateBody({
        amount: z.int().gt(0),
    })
    @RequireBmissUserToken
    @Post('/recharge')
    async recharge(ctx: RouterContext, @FromBody { amount }: { amount: number }) {
        const user = ctx.state.user as BmissUser
        //创建充值订单
        const order = await BmissRecharge.create({
            user_id: user.id,
            appid: user.appid,
            openid: user.openid,
            amount,
        })

        //返回充值需要的订单数据
        return success({
            order_id: order.id,
            payment_data: {
                out_order_no: `bmiss_recharge_${order.id}`,
                amount,
            },
        })
    }

    /**
     * 检查充值是否完成
     */
    @ValidateBody({
        order_id: z.int().gt(0),
    })
    @Post('/query_recharge')
    async queryRecharge(_: RouterContext, @FromBody { order_id }: { order_id: number }) {
        return success({
            status: await this.checkRecharge(order_id),
        })
    }

    /**
     * 检查充值订单的完成
     * @param id
     */
    async checkRecharge(id: number): Promise<number> {
        //首先通过id查询充值订单
        const recharge = await BmissRecharge.findByPk(id)
        if (!recharge) return 0
        if (recharge.status === 1) return 1

        //调用Bmiss接口获取真实订单数据
        const bmiss = Bmiss.create(recharge.appid)
        if (!bmiss) return 0

        const resp = await bmiss.queryConsume({ out_order_no: `bmiss_recharge_${recharge.id}` })
        if (resp.code !== 200 || !resp.data) return 0

        //比对订单金额和用户信息
        if (resp.data.openid !== recharge.openid) return 0
        if (!Decimal(resp.data.amount).eq(recharge.amount)) return 0

        //开启事务进行修改
        const transaction = await db.transaction()
        try {
            const now = new Date()

            //先尝试把订单改成已完成
            const [updated] = await BmissRecharge.update(
                {
                    status: 1,
                    completed_at: now,
                    bmiss_order_no: resp.data.order_no,
                    bmiss_order_info: resp.data,
                },
                {
                    where: {
                        id: recharge.id,
                        status: 0,
                    },
                    transaction,
                },
            )
            if (!updated) {
                //如果订单修改失败，那就表示这个订单在其他事务中已经被改成完成了
                await transaction.rollback()
                return 1
            }

            //给用户加钱
            await BmissUser.increment(
                {
                    balance: recharge.amount,
                },
                {
                    where: {
                        id: recharge.user_id,
                    },
                    transaction,
                },
            )

            //查询用户最新的余额
            const user = await BmissUser.findByPk(recharge.user_id, { transaction })
            const balance_after = user?.balance ?? 0

            //写入余额变动记录
            await BmissUserBalanceLog.create({
                user_id: recharge.user_id,
                type: 'recharge',
                amount: recharge.amount,
                balance_after,
                created_at: now,
            })

            //提交事务
            await transaction.commit()
        } catch (err) {
            await transaction.rollback()
            throw err
        }

        return 1
    }

    /**
     * 提现
     */
    @ValidateBody({
        amount: z.int().gt(0),
    })
    @RequireBmissUserToken
    @Post('/withdrawal')
    async withdrawal(ctx: RouterContext, @FromBody { amount }: { amount: number }) {
        //读取提现校验参数
        const { bmiss_bet_min_withdrawal, bmiss_bet_withdrawal_multiple } = await getSetting(
            'bmiss_bet_min_withdrawal',
            'bmiss_bet_withdrawal_multiple',
        )
        if (amount < bmiss_bet_min_withdrawal) {
            return ctx.state.t('invalid_withdrawal_amount')
        }
        if (amount % bmiss_bet_withdrawal_multiple !== 0) {
            return ctx.state.t('invalid_withdrawal_amount')
        }

        //创建bmiss接口调用对象
        const bmiss = Bmiss.create(ctx.state.user.appid)
        if (!bmiss) {
            throw new Error('invalid user appid')
        }

        const withdrawal = await db.transaction(async (transaction) => {
            //查询用户余额
            const user = await BmissUser.findByPk(ctx.state.user.id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            })
            if (!user) {
                //抛出一个内部异常，回滚业务
                throw new InnerError(ctx.state.t('insufficient_balance'))
            }

            if (Decimal(user.balance).lt(amount)) {
                //余额不足
                throw new InnerError(ctx.state.t('insufficient_balance'))
            }

            //修改用户余额
            user.balance = Decimal(user.balance).sub(amount).toString()
            await user.save({ transaction })

            const now = new Date()

            //写入余额变更记录
            await BmissUserBalanceLog.create(
                {
                    user_id: user.id,
                    type: 'withdrawal',
                    amount: 0 - amount,
                    balance_after: user.balance,
                },
                { transaction },
            )

            //创建提现单
            return await BmissWithdrawal.create(
                {
                    user_id: user.id,
                    appid: user.appid,
                    openid: user.appid,
                    amount,
                    created_at: now,
                },
                { transaction },
            )
        })

        //调用接口进行提现
        try {
            const resp = await bmiss.withdrawal({
                openid: withdrawal.openid,
                out_order_no: `bmiss_withdrawal_${withdrawal.id}`,
                amount: withdrawal.amount,
            })
            if (resp.code !== 200) {
                //提现接口调用失败，抛出一个异常去走catch流程
                throw new Error(JSON.stringify(resp))
            }

            //正常标记提现完成
            withdrawal.bmiss_order_no = resp.data.order_no
            withdrawal.status = 1
            withdrawal.completed_at = new Date()
            await withdrawal.save()
        } catch (err) {
            //记录提现失败的日志
            console.error(`[提现失败]`, withdrawal)
            console.error(err)
            //抛到后续的提现重试队列
            await publish(
                'bmiss-bet-withdrawal-retry',
                JSON.stringify({ id: withdrawal.id }),
                {
                    headers: { 'x-delay': 10 },
                },
                {
                    arguments: {
                        'x-delayed-type': 'direct',
                    },
                },
            )
        }

        return success()
    }

    /**
     * 获取比赛列表
     */
    @ValidateBody({
        page: z.optional(z.int().gt(0)),
        page_size: z.optional(z.int().gt(0)),
    })
    @Post('/matches')
    async matches(
        _: RouterContext,
        @FromBody
        params: {
            page?: number
            page_size?: number
        },
    ) {
        //构建查询条件
        const { rows, count } = await CrownMainOdd.findAndCountAll({
            where: {
                is_active: 1,
                base: 'ah',
            },
            attributes: ['id'],
            include: [
                {
                    model: VMatch,
                    required: true,
                    where: {
                        bmiss_bet_enable: 1,
                        match_time: {
                            [Op.lt]: db.literal("CURRENT_TIMESTAMP + interval '24 hours'"),
                        },
                    },
                    attributes: [
                        'id',
                        'match_time',
                        'team1_name',
                        'team2_name',
                        'tournament_name',
                        'has_score',
                        'score1',
                        'score2',
                    ],
                },
            ],
            order: [
                ['match', 'match_time', 'desc'],
                ['match', 'tournament_id', 'desc'],
                ['match', 'id', 'desc'],
            ],
            ...formatOffsetLimit(params.page, params.page_size),
        })

        return success({
            list: rows.map((row) => row.match),
            total: count,
        })
    }

    /**
     * 获取当前可投注的比赛列表
     */
    @Action('/betable_matches')
    async betableMatches() {
        const matches = await VMatch.findAll({
            where: {
                bmiss_bet_enable: 1,
                match_time: {
                    [Op.between]: [
                        db.literal('CURRENT_TIMESTAMP'),
                        db.literal("CURRENT_TIMESTAMP + interval '24 hours'"),
                    ],
                },
            },
            attributes: ['id', 'match_time', 'team1_name', 'team2_name', 'tournament_name'],
            order: [
                ['match_time', 'asc'],
                ['tournament_id', 'asc'],
                ['id', 'asc'],
            ],
        })

        if (matches.length > 0) {
            //查询投注盘口
            const odds = await CrownMainOdd.findAll({
                where: {
                    is_active: 1,
                    base: 'ah',
                    match_id: {
                        [Op.in]: matches.map((t) => t.id),
                    },
                },
            })

            const list: any[] = []
            matches.forEach((match) => {
                const odd = odds.find((t) => t.match_id === match.id)
                if (!odd) return

                list.push({
                    ...match.toJSON(),
                    odd: {
                        id: odd.id,
                        condition: Number(odd.condition),
                        value1: Number(odd.value1),
                        value2: Number(odd.value2),
                    },
                })
            })

            return success(list)
        }

        return success([])
    }

    /**
     * 查询用户的余额变动记录
     */
    @ValidateBody({
        type: z.optional(z.string()),
        page: z.optional(z.int().gt(0)),
        page_size: z.optional(z.int().gt(0)),
    })
    @RequireBmissUserToken
    @Post('/balance_log')
    async balanceLog(
        ctx: RouterContext,
        @FromBody params: { type?: string; page?: number; page_size?: number },
    ) {
        const where: WhereOptions<Attributes<BmissUserBalanceLog>> = {
            user_id: ctx.state.user.id,
        }
        if (!isEmpty(params.type)) {
            where.type = params.type
        }

        const { rows, count } = await BmissUserBalanceLog.findAndCountAll({
            where,
            order: [['created_at', 'desc']],
            ...formatOffsetLimit(params.page, params.page_size),
        })

        return success({
            total: count,
            list: rows,
        })
    }

    /**
     * 获取当前用户的信息
     */
    @RequireBmissUserToken
    @Action('/user_info')
    userInfo(ctx: RouterContext) {
        return success(ctx.state.user)
    }
}

/**
 * 路由组件
 */
export const router = createRouter({
    controllers: [ApiController],
})
