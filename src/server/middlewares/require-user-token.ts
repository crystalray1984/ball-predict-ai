import { fail } from '@server/utils'
import { parseUserToken } from '@shared/utils'
import { createMiddlewareFactoryDecorator } from 'koa-decorator-helpers'
import { isEmpty } from 'lodash'

/**
 * 标记接口需要用户登录token
 */
export const RequireUserToken = createMiddlewareFactoryDecorator(() => {
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

        if (!token) {
            ctx.body = fail('登录已失效', 401)
            return
        }

        //尝试解析token
        const user = await parseUserToken(token)
        if (!user) {
            ctx.body = fail('登录已失效', 401)
            return
        }

        if (!user.status) {
            ctx.body = fail('用户已禁用', 401)
            return
        }

        ctx.state.user = user
        return next()
    }
})
