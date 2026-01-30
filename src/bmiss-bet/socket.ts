import { BmissUser } from '@shared/db'
import { io } from '@shared/socket'
import { TokenPayload, verfiyToken } from '@shared/token'
import { Server } from 'node:http'
import { ExtendedError } from 'socket.io'

/**
 * 启动SocketIO服务器
 * @param server
 */
export function startSocketServer(server: Server) {
    //连接类型判断和处理中间件
    io.use(async (socket, next) => {
        //校验token
        const token = socket.handshake.query.token

        const onFailed = () => {
            const error = new Error() as ExtendedError
            error.data = { code: 400, msg: 'unknown connection' }
            next(error)
        }

        if (typeof token !== 'string' || token === '') {
            return onFailed()
        }

        //拆解用户信息
        let payload: TokenPayload
        try {
            payload = verfiyToken(token)
        } catch {
            return onFailed()
        }

        if (payload.type !== 'bmiss' || !payload.id) {
            return onFailed()
        }

        //读取用户信息
        const user = await BmissUser.findOne({
            where: {
                id: payload.id,
            },
        })

        if (!user) {
            return onFailed()
        }

        await socket.join(['bmiss-bet', `bmiss-bet-${user.id}`])
        next()
    })

    io.attach(server)
}
