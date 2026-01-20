import { config } from '@config'
import { createAdapter } from '@socket.io/redis-adapter'
import Redis from 'ioredis'
import { omit } from 'lodash'
import { Server } from 'socket.io'

const pubClient = new Redis(omit(config('redis'), 'pool'))
const subClient = pubClient.duplicate()

/**
 * Socket.IO服务器
 */
export const io = new Server({
    adapter: createAdapter(pubClient, subClient),
})
