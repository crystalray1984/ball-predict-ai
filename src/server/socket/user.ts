import { ROOM_USER_PREFIX } from '@shared/constants'
import { parseUserToken } from '@shared/utils'
import dayjs from 'dayjs'
import { Server, Socket } from 'socket.io'

/**
 * 注册用户端连接的处理事件
 * @param io
 * @param socket
 */
export async function registerUserHandler(io: Server, socket: Socket): Promise<boolean> {
    //查询用户信息
    const user = await parseUserToken(socket.handshake.query.token)
    if (!user) return false

    //把用户加入到组中
    const rooms = [`${ROOM_USER_PREFIX}${user.id}`]
    //如果VIP还没过期就加入到VIP组
    if (dayjs(user.expire_time).valueOf() > Date.now()) {
        rooms.push('vip')
    }

    await socket.join(rooms)
    return true
}
