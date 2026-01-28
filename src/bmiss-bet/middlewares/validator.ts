import { createMiddlewareFactoryDecorator } from 'koa-decorator-helpers'
import * as z from 'zod'

/**
 * 校验请求body的中间件
 */
export const ValidateBody = createMiddlewareFactoryDecorator<
    [shape: Partial<Record<string, z.core.SomeType>>]
>((shape) => {
    const validator = z.object(shape)
    return async (ctx, next) => {
        const result = await validator.safeParseAsync(ctx.request.body ?? {})
        if (!result.success) {
            ctx.body = {
                code: 400,
                msg: result.error.message,
            }
            return
        }

        return next()
    }
}, true)

/**
 * 校验URL请求参数的中间件
 */
export const ValidateQuery = createMiddlewareFactoryDecorator<
    [shape: Partial<Record<string, z.core.SomeType>>]
>((shape) => {
    const validator = z.object(shape)
    return async (ctx, next) => {
        const result = await validator.safeParseAsync(ctx.request.query ?? {})
        if (!result.success) {
            ctx.body = {
                code: 400,
                msg: result.error.message,
            }
            return
        }

        return next()
    }
}, true)
