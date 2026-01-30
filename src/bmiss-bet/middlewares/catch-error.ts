import { fail } from '@server/utils'
import { InnerError } from '@shared/inner-error'
import { Middleware } from 'koa'

/**
 * 异常捕获中间件
 */
export function catchError(): Middleware {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err: unknown) {
            //如果异常是个内部异常，那么返回一个正常展示的响应内容
            if (err instanceof InnerError) {
                ctx.body = fail(err.message, err.code)
                return
            }

            //记录异常日志
            console.error(ctx.method, ctx.url)
            console.error(err)
            ctx.body = {
                code: 500,
                msg: err instanceof Error ? err.message : String(err),
            }
        }
    }
}
