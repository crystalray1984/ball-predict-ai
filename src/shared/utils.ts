import { BinaryLike, createHash } from 'node:crypto'
import { InferAttributes, Op } from 'sequelize'
import { CACHE_USER_EXPIRES, CACHE_USER_KEY } from './constants'
import { User } from './db'
import { redis } from './redis'
import { isEmpty } from 'lodash'
import { TokenPayload, verfiyToken } from './token'

/**
 * 计算输入值的md5
 * @param input 要计算md5的字符串
 */
export function md5(input: BinaryLike): string {
    return createHash('md5').update(input).digest('hex').toLowerCase()
}

/**
 * 转换xx.xx.xx的版本号到数值
 * @param version
 */
export function getVersionNumber(version: string) {
    const match = /^(\d+)\.(\d+)(\.\d+)?$/.exec(version)
    if (!match) return 0
    let value = parseInt(match[1]) * 1000000 + parseInt(match[2]) * 1000
    if (match[3]) {
        value += parseInt(match[3].substring(1))
    }
    return value
}

/**
 * 通过缓存查询用户信息
 * @param id
 */
export async function getUser(
    id: number,
    allowCache = true,
): Promise<InferAttributes<User> | null> {
    if (allowCache) {
        const cache = await redis.get(`${CACHE_USER_KEY}${id}`)
        if (cache) {
            await redis.expire(`${CACHE_USER_KEY}${id}`, CACHE_USER_EXPIRES)
            return User.build(JSON.parse(cache), { isNewRecord: false })
        }
    }

    const user = await User.findOne({ where: { id } })
    if (user) {
        redis.setex(`${CACHE_USER_KEY}${id}`, CACHE_USER_EXPIRES, JSON.stringify(user.toJSON()))
    }

    return user
}

/**
 * 通过缓存批量查询用户信息
 * @param idList
 * @param allowCache
 * @returns
 */
export async function getUsers(
    idList: number[],
    allowCache = true,
): Promise<Record<number, InferAttributes<User>>> {
    if (idList.length === 0) {
        return {}
    }

    const result: Record<number, InferAttributes<User>> = {}
    let emptyIds: number[] = []
    if (allowCache) {
        const keys = idList.map((id) => `${CACHE_USER_KEY}${id}`)
        const validKeys: string[] = []
        const cacheList = await redis.mget(keys)
        idList.forEach((id, index) => {
            const cache = cacheList[index]
            if (cache) {
                validKeys.push(keys[index])
                result[id] = User.build(JSON.parse(cache), { isNewRecord: false })
            } else {
                emptyIds.push(id)
            }
        })
        if (validKeys.length > 0) {
            const multi = await redis.multi()
            validKeys.forEach((key) => {
                multi.expire(key, CACHE_USER_EXPIRES)
            })
            await multi.exec()
        }
    } else {
        emptyIds = idList
    }

    if (emptyIds.length === 0) {
        return result
    }

    //查询缓存中没有的用户数据
    const users = await User.findAll({
        where: {
            id: {
                [Op.in]: emptyIds,
            },
        },
    })

    if (users.length > 0) {
        //写入缓存
        const multi = await redis.multi()
        users.forEach((user) => {
            multi.setex(
                `${CACHE_USER_KEY}${user.id}`,
                CACHE_USER_EXPIRES,
                JSON.stringify(user.toJSON()),
            )
            result[user.id] = user
        })
        await multi.exec()
    }

    return result
}

/**
 * 解析用户token，返回用户数据
 * @param token
 */
export async function parseUserToken(token: any) {
    if (typeof token !== 'string' || isEmpty(token)) return null

    //拆解用户信息
    let payload: TokenPayload
    try {
        payload = verfiyToken(token)
    } catch {
        return null
    }

    if (payload.type !== 'user' || !payload.id) return null

    //查询用户信息
    return getUser(payload.id)
}
