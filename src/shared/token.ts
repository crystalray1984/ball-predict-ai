import { config } from '@config'
import { decode, JwtPayload, sign, SignOptions, verify } from 'jsonwebtoken'
import { merge } from 'lodash'

export interface TokenPayload {
    type: string
    id: number
}

/**
 * 创建JWT token
 * @param payload
 * @param options
 * @returns
 */
export function createToken(payload: TokenPayload, options?: SignOptions) {
    return sign(
        payload,
        config('jwt.key', ''),
        merge(
            {},
            {
                expiresIn: config('jwt.expire'),
            },
            options,
        ),
    )
}

/**
 * 仅解开JWT但不校验
 * @param token
 */
export function decodeToken(token: string) {
    return decode(token) as TokenPayload | null
}

/**
 * 校验JWT token
 * @param token
 */
export function verfiyToken(token: string) {
    return verify(token, config('jwt.key', ''), { complete: false }) as JwtPayload & TokenPayload
}
