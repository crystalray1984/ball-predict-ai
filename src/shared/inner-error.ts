/**
 * 一个内部异常，用于标识这个异常是正常的业务判断抛出的
 */
export class InnerError extends Error {
    public readonly code: number

    constructor(message: string, code = 400) {
        super(message)
        this.code = code
    }
}
