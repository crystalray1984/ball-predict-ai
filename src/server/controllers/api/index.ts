import { createRouter } from 'koa-decorator-helpers'
import { CommonController } from './Common'
import { UserController } from './User'

/**
 * 返回客户端接口路由
 */
export function createApiRouter() {
    const router = createRouter({
        prefix: '/api',
        controllers: [CommonController, UserController],
    })

    return router
}
