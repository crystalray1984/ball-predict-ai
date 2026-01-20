import Koa from 'koa'
import koaBody from 'koa-body'
import { createAdminRouter } from './controllers/admin'
import { createApiRouter } from './controllers/api'
import { catchError } from './middlewares/catch-error'

/**
 * 创建Koa应用实例
 */
export function createApp() {
    const app = new Koa({
        proxy: true,
    })

    //异常捕获中间件
    app.use(catchError())

    //请求体解析中间件
    app.use(
        koaBody({
            includeUnparsed: true,
        }),
    )

    //客户端路由
    const apiRouter = createApiRouter()
    app.use(apiRouter.middleware()).use(apiRouter.allowedMethods())

    //管理端路由
    const adminRouter = createAdminRouter()
    app.use(adminRouter.middleware()).use(adminRouter.allowedMethods())

    return app
}
