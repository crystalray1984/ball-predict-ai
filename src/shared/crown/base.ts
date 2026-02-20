import type { Account } from './types'

/**
 * 准备好一个皇冠客户端模拟环境
 */
export function ready() {}

let _account: Account | (() => Account | Promise<Account>) = undefined as any

/**
 * 设置登录皇冠使用的账号或者账号获取器
 */
export function setAccount(account: Account | (() => Account | Promise<Account>)) {}

/**
 * 获取登录用的皇冠账号
 */
export async function getAccount() {
    if (typeof _account === 'function') {
        return await _account()
    }
    return _account
}
