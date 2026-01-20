import { config } from '@config'
import { db } from '@shared/db'
import { redis } from '@shared/redis'
import { createServer } from 'http'
import { createApp } from './app'
import { startSocketServer } from './socket'

/**
 * 创建HTTP服务器
 */
export function createHttpServer() {
    const app = createApp()
    const server = createServer(app.callback())

    //服务器关闭时
    server.on('close', async () => {
        //关闭数据库
        await db.close()

        //关闭redis
        await redis.close()
    })

    return {
        app,
        server,
    }
}

/**
 * 启动HTTP服务器
 */
export function runHttpServer() {
    const { server } = createHttpServer()

    startSocketServer(server)

    const port = config<number>('http.port', 3000)

    server.listen(port, '0.0.0.0', () => {
        console.log('http server runned', server.address())
    })
}

if (require.main === module) {
    runHttpServer()
}
