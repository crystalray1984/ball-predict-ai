/// <reference path="./extends.d.ts" />

import { config } from '@config'
import { type RouterContext } from '@koa/router'
import { fail, formatOffsetLimit, success } from '@server/utils'
import { Bmiss, type BmissCallbackData } from '@shared/bmiss'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@shared/constants'
import { BmissUser, BmissUserBet, CrownMainOdd, db, Match, VMatch } from '@shared/db'
import { publish } from '@shared/rabbitmq'
import { createToken } from '@shared/token'
import { Action, Controller, createRouter, FromBody, Post } from 'koa-decorator-helpers'
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
            paid: 1,
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

        //整理输出的数据
        const list = rows.map((row) => {
            const obj = row.toJSON() as any
            obj.condition = parseFloat(obj.condition)
            obj.value = parseFloat(obj.value)
            return obj
        })

        return success({
            list,
            total: count,
        })
    }

    /**
     * 投注下单
     */
    @RequireBmissUserToken
    @ValidateBody({
        odd_id: z.int().gt(0),
        amount: z
            .int()
            .gte(config('bmiss-bet.bet_min', 100))
            .lte(config('bmiss-bet.bet_max', 5000))
            .multipleOf(config('bmiss-bet.bet_multiple', 100)),
        type: z.enum(['ah1', 'ah2', 'win1', 'win2', 'draw', 'over', 'under']),
    })
    @Post('/bet')
    async bet(
        ctx: RouterContext,
        @FromBody
        params: { odd_id: number; amount: number; type: OddType },
    ) {
        //首先读取盘口
        const odd = await CrownMainOdd.findOne({
            where: {
                id: params.odd_id,
            },
            include: [
                {
                    model: Match,
                    required: true,
                    attributes: ['match_time'],
                },
            ],
        })
        if (!odd || !odd.is_active) {
            //盘口已失效
            return fail(ctx.state.t('odd_invalid'))
        }

        if (odd.match.match_time.valueOf() <= Date.now()) {
            //比赛已开始
            return fail(ctx.state.t('match_started'))
        }

        //校验盘口与投注方向一致，并计算投注水位
        let value: NumberVal
        switch (odd.base) {
            case 'ah':
                switch (params.type) {
                    case 'ah1':
                        value = odd.value1
                        break
                    case 'ah2':
                        value = odd.value2
                        break
                    default:
                        return fail(ctx.state.t('invalid_action'))
                }
                break
            case 'sum':
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

        //创建投注订单
        const bet = await BmissUserBet.create(
            {
                user_id: ctx.state.user.id,
                openid: ctx.state.user.openid,
                appid: ctx.state.user.appid,
                match_id: odd.match_id,
                base: odd.base,
                type: params.type,
                condition: odd.condition,
                value,
                amount: params.amount,
            },
            {
                returning: ['id'],
            },
        )

        //返回前端需要的投注数据
        return success({
            bet_id: bet.id,
            payment_data: {
                out_order_no: `bmiss_user_bet_${bet.id}`,
                amount: params.amount,
            },
        })
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

        switch (params.type) {
            case 'consume':
                //消费回调
                console.log('[消费回调]', params)
                //拆解out_order_no
                const match = /^bmiss_user_bet_([0-9]+)$/.exec(params.data.out_order_no)
                if (!match) {
                    console.error('[消费回调]', '订单号无效', params.data.out_order_no)
                    ctx.status = 400
                    ctx.body = 'invalid out_order_no'
                    return
                }
                this.checkBet(parseInt(match[1]))
                break
        }

        ctx.status = 200
        ctx.body = ''
    }

    /**
     * 检查单个投注订单是否投注成功
     */
    @ValidateBody({
        bet_id: z.int().gt(0),
    })
    @Post('/query_bet')
    async queryBet(_: RouterContext, @FromBody params: { bet_id: number }) {
        const bet = await this.checkBet(params.bet_id)
        return success(bet)
    }

    /**
     * 消费确认
     */
    async checkBet(bet_id: number) {
        //查询订单
        const bet = await BmissUserBet.findOne({
            where: {
                id: bet_id,
            },
        })
        if (!bet) {
            console.error('[消费查询]', '订单不存在', bet_id)
            return null
        }
        if (bet.paid !== 0) {
            //订单状态不是等待校验
            return bet
        }

        //调用接口检查订单数据
        const bmiss = Bmiss.create(bet.appid)
        const retConsume = await bmiss.queryConsume({ out_order_no: `bmiss_user_bet_${bet.id}` })
        if (retConsume.code !== 200) {
            //消费未成功
            return bet
        }

        //事务处理
        const result = await db.transaction(async (transaction) => {
            const now = new Date()

            //先尝试修改订单状态
            const [updated] = await BmissUserBet.update(
                {
                    paid: 1,
                    created_at: now,
                },
                {
                    where: {
                        id: bet.id,
                        paid: 0,
                    },
                    transaction,
                },
            )
            if (!updated) {
                //没有修改到，表示这个订单在其他的进程被改了状态
                return false
            }

            //二次判断，这个订单是否已经超期
            if (
                now.valueOf() - bet.created_at.valueOf() >=
                config('bmiss-bet.bet_expires', 60) * 1000
            ) {
                //订单已超期，不允许写入
                await BmissUserBet.update(
                    {
                        paid: 2,
                    },
                    {
                        where: {
                            id: bet.id,
                        },
                        transaction,
                    },
                )
                return 2
            }

            //正常情况返回1
            return 1
        })

        if (result === 2) {
            //状态为2表示订单超期需要退款，抛到一个退款队列
            await publish('bmiss-bet-consume-rollback', JSON.stringify({ id: bet.id }))
        }

        //返回更新过信息的订单
        return bet.reload()
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
}

/**
 * 路由组件
 */
export const router = createRouter({
    controllers: [ApiController],
})
