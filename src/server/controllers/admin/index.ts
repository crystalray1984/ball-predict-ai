import { createRouter } from 'koa-decorator-helpers'

/**
 * 返回管理端接口路由
 */
export function createAdminRouter() {
    const router = createRouter({
        prefix: '/admin',
        controllers: [],
    })

    return router
}
