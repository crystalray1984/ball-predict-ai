import { config } from '@config'
import axios, { AxiosInstance } from 'axios'
import { md5 } from './utils'

/**
 * Bmiss接口调用响应体结构
 */
export interface BmissResponse<T = any> {
    /**
     * 接口响应码，200表示调用成功
     */
    code: number
    /**
     * 接口响应消息
     */
    msg: string
    /**
     * 接口响应数据
     */
    data: T
}

/**
 * Bmiss用户信息
 */
export interface BmissUserInfo {
    openid: string
    nick_name: string
    avatar: string
}

/**
 * Bmiss回调请求数据
 */
export interface BmissCallbackData<T = any> {
    appid: string
    timestamp: number
    request_number: string
    type: string
    data: T
}

/**
 * 消费回调数据
 */
export interface BmissConsumeData {
    openid: string
    amount: NumberVal
    income_amount: NumberVal
    order_no: string
    out_order_no: string
}

/**
 * Bmiss服务端支持逻辑
 */
export class Bmiss {
    /**
     * 缓存的Bmiss实例对象
     */
    protected static instances: Record<string, Bmiss> = {}

    /**
     * 用于接口调用的axios实例
     */
    protected axios: AxiosInstance

    /**
     * 基于特定的appid获取服务端支持实例
     * @param appid
     */
    static create(appid: string): Bmiss {
        if (Bmiss.instances[appid] instanceof Bmiss) {
            return Bmiss.instances[appid]
        }

        const apps = config<BmissMiniapp[]>('bmiss', [])
        if (!Array.isArray(apps)) {
            return null as any
        }
        const app = apps.find((t) => t.appid === appid)
        if (!app) {
            return null as any
        }

        const instance = new Bmiss(app)
        Bmiss.instances[appid] = instance
        return instance
    }

    protected constructor(public readonly config: BmissMiniapp) {
        //创建用于接口调用的axios实例
        this.axios = axios.create({
            method: 'POST',
            baseURL: config.api_url,
            headers: {
                common: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            },
        })
    }

    /**
     * 调用服务端接口
     */
    async api<T>(url: string, data: Record<string, any> = {}) {
        //生成完整的请求体
        const body = {
            appid: this.config.appid,
            timestamp: Math.floor(Date.now() / 1000),
            request_number: md5((Date.now() + Math.random()).toString()),
            data,
        }

        //调用接口的原始JSON字符串
        const json = JSON.stringify(body)

        //计算签名
        const signature = this.signature(json)

        //发起请求
        const resp = await this.axios.request<BmissResponse<T>>({
            url,
            params: { signature },
            data: json,
        })

        return resp.data
    }

    /**
     * 获取用户的信息
     */
    getUserInfo(openid: string) {
        return this.api<BmissUserInfo>('/mini/user_info', { openid })
    }

    /**
     * 订单查询
     * @param params
     */
    queryConsume(data: { out_order_no: string } | { order_no: string }) {
        return this.api<BmissConsumeData>('/mini/query_consume', data)
    }

    /**
     * 计算签名
     * @param input 待签名的原始请求数据
     */
    signature(input: string) {
        return md5(md5(`${input}${this.config.app_secret}`))
    }

    /**
     * 提现
     * @param data
     */
    withdrawal(data: { openid: string; amount: number; out_order_no: string }) {
        return this.api<{
            order_no: string
        }>('/mini/withdrawal', data)
    }
}
