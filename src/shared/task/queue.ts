/**
 * 队列中的任务
 */
type QueuedTask = (onComplete: () => void) => void

/**
 * 按序先入先出执行任务的队列
 */
export class TaskQueue {
    /**
     * 等待执行的队列任务
     */
    protected waiting: QueuedTask[] = []
    /**
     * 执行中的队列任务
     */
    protected running: QueuedTask[] = []
    /**
     * 创建一个任务队列
     * @param concurrent 允许同时并发执行的任务数
     */
    constructor(public concurrent = 1) {}

    /**
     * 添加一个任务到队列中
     * @param task
     */
    add<T>(task: () => Promise<T> | T): Promise<T> {
        let resolver: (value: T | PromiseLike<T>) => void
        let rejecter: (err?: any) => void
        const promise = new Promise<T>((resolve, reject) => {
            resolver = resolve
            rejecter = reject
        })
        const queued: QueuedTask = async (onComplete) => {
            try {
                resolver(await task())
            } catch (err) {
                rejecter(err)
            } finally {
                onComplete()
            }
        }

        this.waiting.push(queued)
        setTimeout(() => this.next(), 0)

        return promise
    }

    /**
     * 尝试执行下一个任务
     */
    protected next() {
        if (this.running.length >= this.concurrent) return
        const task = this.waiting.shift()
        if (!task) return
        this.running.push(task)
        task(() => {
            const index = this.running.indexOf(task)
            if (index !== -1) {
                this.running.splice(index, 1)
            }
            setTimeout(() => this.next(), 0)
        })
    }
}

const _queues: Record<string | symbol, TaskQueue> = {}

/**
 * 把任务放入一个全局的按序执行队列中执行
 * @param name 队列名
 * @param task 任务执行方法
 */
export function queue<T>(name: string | symbol, task: () => Promise<T> | T): Promise<T> {
    if (!(_queues[name] instanceof TaskQueue)) {
        _queues[name] = new TaskQueue()
    }
    return _queues[name].add<T>(task)
}
