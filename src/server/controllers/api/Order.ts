import { success } from '@server/utils'
import { Controller } from 'koa-decorator-helpers'

/**
 * 订单相关接口
 */
@Controller({ prefix: '/order' })
export class OrderController {
    /**
     * 获取购买VIP的相关配置
     */
    async vipConfig() {
        return success()
    }

    /**
     * 创建VIP订单
     */
    async createOrder() {
        return success()
    }
}
