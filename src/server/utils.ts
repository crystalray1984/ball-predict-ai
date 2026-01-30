import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@shared/constants'

/**
 * 返回响应体数据
 */
export function response(code: number, msg: string): ApiResp<void>
export function response<T>(code: number, msg: string, data: T): ApiResp<T>
export function response<T>(code: number, msg: string, data?: T) {
    return {
        code,
        msg,
        data,
    }
}

/**
 * 返回成功的响应体
 */
export function success(): ApiResp<void>
export function success<T>(data: T): ApiResp<T>
export function success(data?: any) {
    return response(0, 'success', data)
}

/**
 * 返回失败的响应体
 * @param code
 * @param msg
 */
export function fail(msg: string): ApiResp<void>
export function fail(msg: string, code: number): ApiResp<void>
export function fail<T>(msg: string, code: number, data: T): ApiResp<T>
export function fail(msg: string, code: number = 400, data?: any) {
    return response(code, msg, data)
}

export function formatOffsetLimit(page?: number, page_size?: number) {
    const limit =
        typeof page_size === 'number' &&
        Number.isSafeInteger(page_size) &&
        !isNaN(page_size) &&
        page_size > 0
            ? page_size
            : DEFAULT_PAGE_SIZE
    const offset =
        ((typeof page === 'number' && Number.isSafeInteger(page) && !isNaN(page) && page > 0
            ? page
            : DEFAULT_PAGE) -
            1) *
        limit

    return {
        offset,
        limit,
    }
}
