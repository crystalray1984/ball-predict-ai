import { createRouter } from 'koa-decorator-helpers'
import { Common } from './Common'

/**
 * 返回客户端接口路由
 */
export function createApiRouter() {
    const router = createRouter({
        prefix: '/api',
        controllers: [Common],
    })

    return router
}
