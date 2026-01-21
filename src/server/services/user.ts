import { User, UserClientConfig, UserConnect } from '@shared/db'
import { getSetting } from '@shared/settings'
import { storage } from '@shared/storage'
import dayjs from 'dayjs'
import { CreationAttributes, Transaction } from 'sequelize'
import Sqids from 'sqids'

/**
 * 获取输出到前端的用户信息
 * @param user
 */
export async function getUserInfo(user: number | User) {
    if (typeof user === 'number') {
        user = (await User.findByPk(user))!
    }

    const info = user.toJSON() as any
    info.connect = await UserConnect.findAll({
        where: {
            user_id: user.id,
        },
        attributes: ['platform', 'platform_id', 'account'],
    })

    info.client_config = await UserClientConfig.findByPk(user.id)

    if (info.avatar) {
        info.avatar = storage.getUrl(info.avatar)
    }

    delete info.deleted_at

    return info
}

/**
 * 创建用户
 * @param info
 */
export async function createUser(info: CreationAttributes<User>, transaction?: Transaction) {
    //设置用户的VIP过期时间
    if (!info.expire_time) {
        const hours = await getSetting<number>('new_user_expire_hours')
        if (typeof hours === 'number') {
            info.expire_time = dayjs().add(hours, 'hour').toDate()
        }
    }

    //创建用户
    const user = await User.create(info, { transaction })

    //生成用户邀请码
    const codeNumbers = user.id
        .toString()
        .padStart(6, '0')
        .split('')
        .map((s) => parseInt(s))
    user.code = new Sqids().encode(codeNumbers)
    await user.save({ transaction })

    return user
}
