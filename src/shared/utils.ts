import Decimal from 'decimal.js'
import { isEmpty } from 'lodash'
import { BinaryLike, createHash } from 'node:crypto'
import { Op } from 'sequelize'
import { CACHE_USER_EXPIRES, CACHE_USER_KEY } from './constants'
import { User } from './db'
import { redis } from './redis'
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
export async function getUser(id: number, allowCache = true): Promise<User | null> {
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
): Promise<Record<number, User | null>> {
    if (idList.length === 0) {
        return {}
    }

    const result: Record<number, User> = {}
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

/**
 * 校验输入值是否为有效的数值
 * @param input
 */
export function isDecimal(input: any): input is string | number {
    try {
        return !Decimal(input).isNaN()
    } catch {
        return false
    }
}

const _singletons: Record<string | symbol, () => any> = {}

/**
 * 执行一项单例任务
 * @param name 任务标识
 * @param task 任务
 */
export function singleton<T>(name: string | symbol, task: () => T): T {
    if (typeof _singletons[name] === 'function') {
        return _singletons[name]()
    }

    const result = task()
    if (result instanceof Promise) {
        _singletons[name] = () => result
        result.finally(() => {
            delete _singletons[name]
        })
    }
    return result
}

/**
 * 进行比分对比
 * @param score1
 * @param score2
 */
export function compareScore(score1: Decimal.Value, score2: Decimal.Value): -2 | -1 | 0 | 1 | 2 {
    //给作为比对的结果加上盘口
    const delta = Decimal(score1).sub(score2)
    if (delta.eq('0')) return 0
    if (delta.gte('0.5')) {
        return 2
    }
    if (delta.gte('0.25')) {
        return 1
    }
    if (delta.lte('-0.5')) {
        return -2
    }
    if (delta.lte('-0.25')) {
        return -1
    }
    return 0
}

/**
 * 计算盘口的输赢
 * @param type
 * @param condition
 * @param score1
 * @param score2
 */
export function getOddResult(
    type: OddType,
    condition: NumberVal,
    score1: number,
    score2: number,
): -2 | -1 | 0 | 1 | 2 {
    if (type === 'ah1') {
        //让球，主队
        return compareScore(Decimal(score1).add(condition), score2)
    } else if (type === 'ah2') {
        //让球，客队
        return compareScore(Decimal(score2).add(condition), score1)
    } else if (type === 'win1') {
        //主队独赢
        return score1 > score2 ? 2 : -2
    } else if (type === 'win2') {
        //客队独赢
        return score2 > score1 ? 2 : -2
    } else if (type === 'draw') {
        //平局
        return score1 === score2 ? 2 : -2
    } else if (type === 'under') {
        //小球
        return compareScore(condition, score1 + score2)
    } else if (type === 'over') {
        //大球
        return compareScore(score1 + score2, condition)
    } else {
        return 0
    }
}
