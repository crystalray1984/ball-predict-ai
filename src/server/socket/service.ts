import { ROOM_SERVICE_PREFIX } from '@shared/constants'
import { isEmpty } from 'lodash'
import { Server, Socket } from 'socket.io'

/**
 * 注册服务连接的处理事件
 * @param io
 * @param socket
 */
export async function registerServiceHandler(io: Server, socket: Socket): Promise<boolean> {
    const service_type = socket.handshake.query.service_type

    if (typeof service_type !== 'string' || isEmpty(service_type)) {
        return false
    }

    await socket.join(`${ROOM_SERVICE_PREFIX}${service_type}`)

    return true
}
