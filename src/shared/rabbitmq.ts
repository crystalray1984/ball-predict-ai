import { config } from '@config'
import { Channel, ChannelModel, ConfirmChannel, connect, Options } from 'amqplib'
import { singleton } from './utils'

let connection = null as unknown as ChannelModel
let publishChannel = null as unknown as ConfirmChannel
const assertedQueues: string[] = []

/**
 * 准备好客户端连接
 */
async function ready() {
    if (connection) return
    return singleton('rabbitmq_connection', async () => {
        connection = await connect(config('rabbitmq')!)
        console.log('[rabbitmq]', '开启客户端连接', config('rabbitmq.hostname'))
    })
}

async function getPublishChannel() {
    if (publishChannel) {
        return publishChannel
    }
    await ready()
    return singleton('getPublishChannel', () => connection.createConfirmChannel())
}

/**
 * 关闭客户端连接
 */
export async function close() {
    assertedQueues.splice(0, assertedQueues.length)
    if (publishChannel) {
        await publishChannel.close()
        publishChannel = null as any
    }
    if (!connection) return
    await connection.close()
    console.log('[rabbitmq]', '关闭客户端连接')
    connection = null as any
}

/**
 * 发布数据到消息队列
 * @param queue
 * @param content
 * @param options
 * @param forceAssert
 */
export async function publish(
    channel: Channel,
    queue: string,
    content: string | string[],
    options?: Options.Publish,
    assertOptions?: Options.AssertQueue,
): Promise<void>
/**
 * 发布数据到消息队列
 * @param queue
 * @param content
 * @param options
 * @param forceAssert
 */
export async function publish(
    queue: string,
    content: string | string[],
    options?: Options.Publish,
    assertOptions?: Options.AssertQueue,
): Promise<void>
/**
 * 发布数据到消息队列
 * @param queue
 * @param content
 * @param options
 * @param forceAssert
 */
export async function publish(...args: any[]) {
    let channel: Channel | ConfirmChannel
    if (typeof args[0] === 'string') {
        channel = await getPublishChannel()
    } else {
        channel = args[0]
        args.shift()
    }

    const [queue, content, options, assertOptions] = args

    if (!assertedQueues.includes(queue)) {
        await channel.assertQueue(queue, assertOptions)
    }
    if (!assertedQueues.includes(queue)) {
        assertedQueues.push(queue)
    }

    if ('waitForConfirms' in channel && typeof channel.waitForConfirms === 'function') {
        if (Array.isArray(content)) {
            content.forEach((data) =>
                channel.sendToQueue(queue, Buffer.from(data, 'utf-8'), options),
            )
        } else {
            channel.sendToQueue(queue, Buffer.from(content, 'utf-8'), options)
        }
        await channel.waitForConfirms()
    } else {
        if (Array.isArray(content)) {
            content.forEach((data) => {
                channel.sendToQueue(queue, Buffer.from(data, 'utf-8'), options)
            })
        } else {
            channel.sendToQueue(queue, Buffer.from(content, 'utf-8'), options)
        }
    }
}

export interface ConsumeOptions extends Options.Consume {
    prefetchCount?: number
}

/**
 * 开启队列消费
 * @param queue
 * @param callback
 * @param options
 */
export function consume(
    queue: string,
    callback: (content: string, channel: Channel) => any,
    options: ConsumeOptions = {},
    assertOptions?: Options.AssertQueue,
): [Promise<void>, () => void] {
    const controller = new AbortController()
    const close = () => controller.abort()
    const { prefetchCount = 1, ...rest } = options

    const promise = (async () => {
        await ready()
        if (controller.signal.aborted) return
        const channel = await connection.createChannel()
        try {
            if (controller.signal.aborted) return
            await channel.prefetch(prefetchCount)
            if (controller.signal.aborted) return
            await channel.assertQueue(queue, assertOptions)
            if (controller.signal.aborted) return
            await new Promise<void>(async (resolve, reject) => {
                const { consumerTag } = await channel.consume(
                    queue,
                    async (msg) => {
                        if (!msg) {
                            reject(new Error('rabbitmq服务器已断开连接'))
                            return
                        }
                        try {
                            await callback(msg.content.toString('utf-8'), channel)
                            channel.ack(msg)
                        } catch (err) {
                            console.error(err)
                            channel.nack(msg)
                        }
                    },
                    rest,
                )
                console.log('[rabbitmq]', '开启队列监听', queue)
                if (controller.signal.aborted) {
                    await channel.cancel(consumerTag)
                    resolve()
                } else {
                    controller.signal.onabort = async () => {
                        await channel.cancel(consumerTag)
                        resolve()
                    }
                }
            })
        } finally {
            await channel.close()
        }
    })()
    return [promise, close]
}
