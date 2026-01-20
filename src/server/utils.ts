/**
 * 返回成功的响应体
 */
export function success(data?: any) {
    return {
        code: 0,
        msg: 'success',
        data,
    }
}

/**
 * 返回失败的响应体
 * @param code
 * @param msg
 */
export function fail(msg: string, code: number = 400) {
    return {
        code,
        msg,
    }
}
