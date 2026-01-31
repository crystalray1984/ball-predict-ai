import Koa from 'koa'
import koaBody from 'koa-body'
import { router } from './controller'
import { catchError } from './middlewares/catch-error'
import { cors } from './middlewares/cors'
import { locale } from './middlewares/locale'

/**
 * 创建Koa应用实例
 */
export function createApp() {
    const app = new Koa({
        proxy: true,
    })

    //跨域中间件
    app.use(cors())

    //异常捕获中间件
    app.use(catchError())

    //语言解析中间件
    app.use(locale())

    //请求体解析中间件
    app.use(
        koaBody({
            includeUnparsed: true,
        }),
    )

    //控制器路由
    app.use(router.middleware()).use(router.allowedMethods())

    return app
}
