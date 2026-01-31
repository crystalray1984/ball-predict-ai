import { Middleware } from 'koa'

export function cors(): Middleware {
    return (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', ctx.get('origin') ?? '*')
        ctx.set('Access-Control-Allow-Methods', '*')
        ctx.set('Access-Control-Allow-Headers', '*')
        ctx.set('Access-Control-Allow-Credentials', 'true')
        if (ctx.method === 'OPTIONS') {
            ctx.body = ''
            ctx.status = 200
            return
        }
        return next()
    }
}
