import { io } from '@shared/socket'
import { Server } from 'http'
import { ExtendedError } from 'socket.io'
import { registerServiceHandler } from './service'
import { registerUserHandler } from './user'

/**
 * 启动Socket.IO服务器
 * @param server
 */
export function startSocketServer(server: Server) {
    //连接类型判断和处理中间件
    io.use(async (socket, next) => {
        /**
         * 是否为有效的连接
         */
        let valid = false

        //根据连接地址上的类型来判断使用用户连接还是服务连接
        const type = socket.handshake.query.type
        switch (type) {
            case 'user': //用户连接
                valid = await registerUserHandler(io, socket)
                break
            case 'service': //服务连接
                valid = await registerServiceHandler(io, socket)
                break
        }

        if (!valid) {
            const error = new Error() as ExtendedError
            error.data = { code: 400, msg: 'unknown connection' }
            next(error)
        } else {
            next()
        }
    })

    io.attach(server)
}
