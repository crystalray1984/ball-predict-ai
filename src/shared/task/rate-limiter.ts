import { TaskQueue } from './queue'

/**
 * 限制了执行频率的队列
 */
export class RateLimiter {
    /**
     * 允许执行下一个任务的时间
     */
    protected nextRunTime = 0

    protected queue: TaskQueue

    /**
     *
     * @param interval 两次任务之间的执行间隔
     */
    constructor(protected interval: number) {
        this.queue = new TaskQueue()
    }

    /**
     * 等待下一次任务可以被执行
     */
    next() {
        //对任务进行封装
        const wrappedTask = async () => {
            const now = Date.now()
            if (now < this.nextRunTime) {
                await new Promise<void>((resolve) => setTimeout(resolve, this.nextRunTime - now))
            }
            this.nextRunTime = Date.now() + this.interval
        }

        return this.queue.add(wrappedTask)
    }
}
