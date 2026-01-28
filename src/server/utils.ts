import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@shared/constants'

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
