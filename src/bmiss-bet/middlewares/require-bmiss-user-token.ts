import { fail } from '@server/utils'
import { BmissUser } from '@shared/db'
import { TokenPayload, verfiyToken } from '@shared/token'
import { createMiddlewareFactoryDecorator } from 'koa-decorator-helpers'
import { isEmpty } from 'lodash'

/**
 * 标记接口需要Bmiss用户登录token
 */
export const RequireBmissUserToken = createMiddlewareFactoryDecorator(() => {
    return async (ctx, next) => {
        //获取token
        const token = (() => {
            //先尝试从请求头中获取
            const headerValue = ctx.get('Authorization')
            if (typeof headerValue === 'string') {
                const match = /^Bearer (.+)$/.exec(headerValue)
                if (match) {
                    return match[1]
                }
            }

            //再尝试通过query获取
            const queryValue = ctx.request.query.token
            if (typeof queryValue === 'string' && !isEmpty(queryValue)) {
                return queryValue
            }

            //再尝试通过cookie获取
            return ctx.cookies.get('token')
        })()

        /**
         * 返回失败的信息
         */
        const checkFailed = () => {
            ctx.body = fail(ctx.state.t('not_login'), 401)
        }

        if (typeof token !== 'string' || isEmpty(token)) {
            return checkFailed()
        }

        //拆解用户信息
        let payload: TokenPayload
        try {
            payload = verfiyToken(token)
        } catch {
            return checkFailed()
        }

        if (payload.type !== 'bmiss' || !payload.id) {
            return checkFailed()
        }

        //读取用户信息
        const user = await BmissUser.findOne({
            where: {
                id: payload.id,
            },
        })

        if (!user) {
            return checkFailed()
        }

        ctx.state.user = user
        return next()
    }
})
