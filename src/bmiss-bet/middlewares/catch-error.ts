import { Middleware } from 'koa'

/**
 * 异常捕获中间件
 */
export function catchError(): Middleware {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err: unknown) {
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
