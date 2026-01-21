import { type RouterContext } from '@koa/router'
import { RequireUserToken } from '@server/middlewares/require-user-token'
import { ValidateBody } from '@server/middlewares/validator'
import { createUser, getUserInfo } from '@server/services/user'
import { fail, success } from '@server/utils'
import { verifyCaptcha } from '@shared/captcha'
import {
    CACHE_EMAIL_CODE_PREFIX,
    CACHE_USER_KEY,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from '@shared/constants'
import { db, Order, User, UserClientConfig, UserConnect, UserMarked } from '@shared/db'
import { redis } from '@shared/redis'
import { getSetting } from '@shared/settings'
import { storage } from '@shared/storage'
import { createToken } from '@shared/token'
import { getUser, md5 } from '@shared/utils'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { Action, Controller, FromBody, Post } from 'koa-decorator-helpers'
import { isEmpty } from 'lodash'
import { Attributes, LOCK, WhereOptions } from 'sequelize'
import z from 'zod'

/**
 * 通过邮箱注册的参数
 */
interface EmailRegisterParams {
    /**
     * 用户名（邮箱）
     */
    username: string
    /**
     * 密码（经过一次MD5加密）
     */
    password: string
    /**
     * 邮箱验证码
     */
    code: string
}

/**
 * 邮箱+密码登录的参数
 */
interface EmailLoginParams {
    /**
     * 用户名（邮箱）
     */
    username: string
    /**
     * 密码（经过一次MD5加密）
     */
    password: string
    /**
     * 图片验证码内容
     */
    code: string
    /**
     * 图片验证码标识
     */
    code_key: string
}

interface LuffaLoginParams {
    network?: 'eds' | 'endless'
    info: {
        uid: string
        nickname: string
        address: string
        avatar?: string
        [name: string]: any
    }
}

/**
 * 用户控制器
 */
@Controller({ prefix: '/user' })
export class UserController {
    /**
     * 通过邮箱注册新用户
     */
    @ValidateBody({
        username: z.email(),
        password: z.string().nonempty(),
        code: z.string().nonempty(),
    })
    @Post('/email_register')
    async emailRegister(_: RouterContext, @FromBody params: EmailRegisterParams) {
        //检查验证码
        const code = await redis.get(`${CACHE_EMAIL_CODE_PREFIX}:${params.username}`)
        if (isEmpty(code) || params.code !== code) {
            return fail('验证码错误')
        }

        //检查邮箱是否已存在
        const exists = await UserConnect.findOne({
            where: {
                platform: 'email',
                account: params.username,
            },
            attributes: ['id'],
        })
        if (exists) {
            return fail('此邮箱已被使用')
        }

        const user = await db.transaction(async (transaction) => {
            //创建用户
            const user = await createUser(
                {
                    reg_source: 'email',
                    nickname: params.username.substring(0, params.username.indexOf('@')),
                },
                transaction,
            )

            //创建用户登录信息
            await UserConnect.create(
                {
                    user_id: user.id,
                    platform: 'email',
                    account: params.username,
                    password: md5(params.password),
                },
                { transaction },
            )

            return user
        })

        return success({
            token: createToken({ type: 'user', id: user.id }),
            user: await getUserInfo(user),
        })
    }

    /**
     * 邮箱+密码登录
     */
    @ValidateBody({
        username: z.string().nonempty(),
        password: z.string().nonempty(),
        code: z.string().nonempty(),
        code_key: z.string().nonempty(),
    })
    @Post('/login')
    async emailLogin(_: RouterContext, @FromBody params: EmailLoginParams) {
        //校验验证码
        if (!verifyCaptcha(params.code_key, params.code)) {
            return fail('验证码错误')
        }

        const connect = await UserConnect.findOne({
            where: {
                platform: 'email',
                account: params.username,
            },
            attributes: ['user_id', 'password'],
        })

        if (!connect) {
            return fail('用户不存在')
        }

        if (connect.password !== md5(params.password)) {
            return fail('账号或密码错误')
        }

        const user = await getUser(connect.user_id)
        if (!user) {
            return fail('用户不存在')
        }

        if (!user.status) {
            return fail('用户已被禁用')
        }

        return success({
            token: createToken({ type: 'user', id: user.id }),
            user: await getUserInfo(user),
        })
    }

    /**
     * Luffa小程序登录
     */
    @ValidateBody({
        network: z.optional(z.enum(['eds', 'endless'])),
        info: z.object({
            uid: z.string().nonempty(),
        }),
    })
    @Post('/luffa_login')
    async luffaLogin(_: RouterContext, @FromBody params: LuffaLoginParams) {
        //取出参数里的头像
        let avatar = params.info.avatar

        //清理不需要的参数
        delete params.info.avatar
        delete params.info._originalLuffaData

        //先尝试查询uid对应的用户是否存在
        const connect = await UserConnect.findOne({
            where: {
                platform: 'luffa',
                account: params.info.uid,
            },
            attributes: ['user_id'],
        })

        let user: User
        if (connect) {
            //用户存在
            user = (await User.findByPk(connect.user_id))!
        } else {
            //用户不存在，创建用户
            user = await db.transaction(async (transaction) => {
                const user = await createUser(
                    {
                        reg_source: 'luffa',
                        nickname: params.info.nickname,
                    },
                    transaction,
                )

                await UserConnect.create({
                    user_id: user.id,
                    platform: 'luffa',
                    account: params.info.uid,
                    extra: params.info,
                })

                return user
            })
        }

        //更新昵称和头像
        user.nickname = params.info.nickname
        if (avatar) {
            /**
             * 是否需要更新头像
             */
            let update = true

            //拆解头像中实际的字节部分
            const headerMatch = /^data:image\/.+?;base64,/.exec(avatar)
            if (headerMatch) {
                avatar = avatar.substring(headerMatch[0].length)
            }
            const buffer = Buffer.from(avatar, 'base64')

            const avatarHash = md5(buffer)

            if (user.avatar) {
                //如果用户有头像，那么判断一下头像是否需要更新
                const match = /.+\/([^.]+)\./.exec(user.avatar)
                const base = match ? match[1] : ''
                if (base === avatarHash) {
                    //不需要更新
                    update = false
                }
            }

            if (update) {
                //需要更新头像
                const avatarUrl = `user_avatar/${user.id}/${avatarHash}.png`
                await storage.putFile(buffer, avatarUrl)
                user.avatar = avatarUrl
            }
        }
        if (user.changed()) {
            await user.save()
        }

        return success({
            token: createToken({ type: 'user', id: user.id }),
            user: await getUserInfo(user),
        })
    }

    /**
     * 回显当前登录用户的信息
     */
    @RequireUserToken
    @Action('/info')
    async info(ctx: RouterContext) {
        const user = ctx.state.user as User
        return success(await getUserInfo(user))
    }

    /**
     * 获取用户的VIP购买记录
     */
    @ValidateBody({
        page: z.optional(z.int().gt(0)),
        page_size: z.optional(z.int().gt(0)),
    })
    @RequireUserToken
    @Post('/vip_records')
    async vipRecords(ctx: RouterContext, @FromBody params: { page?: number; page_size?: number }) {
        const page = params.page ?? DEFAULT_PAGE
        const page_size = params.page_size ?? DEFAULT_PAGE_SIZE

        const where: WhereOptions<Attributes<Order>> = {
            user_id: ctx.state.user.id,
            status: 'paid',
            type: 'vip',
        }

        const total = await Order.count({ where })
        const orders = await Order.findAll({
            where,
            order: [['id', 'desc']],
            offset: (page - 1) * page_size,
            limit: page_size,
            attributes: ['id', 'type', 'amount', 'channel_type', 'paid_at', 'extra', 'currency'],
        })

        //数据整理
        const list = orders.map((order) => {
            const row = order.toJSON() as any
            row.channel = order.channel_type
            row.payment_at = order.paid_at
            row.amount = Decimal(order.amount).toString()
            delete row.channel_type
            delete row.paid_at
            return row
        })

        return success({
            total,
            list,
        })
    }

    /**
     * 绑定邀请关系
     */
    @ValidateBody({
        code: z.string().nonempty(),
    })
    @RequireUserToken
    @Post('/bind_inviter')
    async bindInviter(ctx: RouterContext, @FromBody { code }: { code: string }) {
        const user = ctx.state.user as User
        if (user.invite_user_id) {
            return fail('您已绑定邀请用户')
        }

        //根据邀请码查询用户
        const inviter = await User.findOne({
            where: {
                code,
            },
            attributes: ['id'],
        })
        if (!inviter) {
            return fail('无效的邀请码')
        }

        if (inviter.id === user.id) {
            return fail('不可绑定自己')
        }

        //读取创建邀请关系时需要增加多少小时的VIP有效期
        const hours = (await getSetting<number>('new_user_expire_hours')) ?? 24

        //写入邀请关系
        await db.transaction(async (transaction) => {
            //读取用户原始数据
            const userUpdated = (await User.findByPk(user.id, {
                transaction,
                lock: LOCK.UPDATE,
            }))!

            //写入数据
            userUpdated.invite_user_id = inviter.id
            userUpdated.invited_at = new Date()
            userUpdated.expire_time = dayjs(
                Math.max(userUpdated.expire_time.valueOf(), userUpdated.invited_at.valueOf()),
            )
                .add(hours, 'hour')
                .toDate()
            await userUpdated.save({ transaction })
        })

        //清空用户的缓存
        await redis.del(`${CACHE_USER_KEY}${user.id}`)

        return success()
    }

    /**
     * 通过邮箱+验证码，重设用户密码并登录
     */
    @ValidateBody({
        username: z.email(),
        password: z.string().nonempty(),
        code: z.string().nonempty(),
    })
    @Post('/reset_password')
    async resetPassword(_: RouterContext, @FromBody params: EmailRegisterParams) {
        //检查验证码
        const code = await redis.get(`${CACHE_EMAIL_CODE_PREFIX}:${params.username}`)
        if (isEmpty(code) || params.code !== code) {
            return fail('验证码错误')
        }

        //检查邮箱是否已存在
        const connect = await UserConnect.findOne({
            where: {
                platform: 'email',
                account: params.username,
            },
        })
        if (!connect) {
            return fail('用户不存在')
        }

        //修改用户密码
        connect.password = md5(params.password)
        await connect.save()

        return success({
            token: createToken({ type: 'user', id: connect.user_id }),
            user: await getUserInfo(connect.user_id),
        })
    }

    /**
     * 标记推荐的盘口
     */
    @ValidateBody({
        id: z.int().gt(0),
        marked: z.boolean(),
    })
    @RequireUserToken
    @Post('/mark')
    async mark(ctx: RouterContext, @FromBody params: { id: number; marked: boolean }) {
        if (params.marked) {
            //添加标记
            await UserMarked.create(
                {
                    user_id: ctx.state.user.id,
                    promote_id: params.id,
                },
                {
                    returning: false,
                    ignoreDuplicates: true,
                },
            )
        } else {
            //删除标记
            await UserMarked.destroy({
                where: {
                    user_id: ctx.state.user.id,
                    promote_id: params.id,
                },
            })
        }

        return success()
    }

    /**
     * 保存客户端设置
     */
    @ValidateBody({
        rockball_filter: z.optional(z.array(z.object())),
    })
    @RequireUserToken
    @Post('/set_client_config')
    async setClientConfig(
        ctx: RouterContext,
        @FromBody params: Partial<Attributes<UserClientConfig>>,
    ) {
        //先尝试读取数据
        const [config] = await UserClientConfig.findOrCreate({
            where: {
                user_id: ctx.state.user.id,
            },
            defaults: {
                user_id: ctx.state.user.id,
            },
        })

        //写入值
        if (!isEmpty(params.rockball_filter)) {
            config.rockball_filter = params.rockball_filter
        }
        await config.save()

        return success()
    }
}
