import { config } from '@config'
import { StorageEngine } from './common'
import { S3Engine } from './s3'

const type = config<string>('storage.type', 's3')

export const storage: StorageEngine = (() => {
    switch (type) {
        case 's3':
            return new S3Engine(config('storage.s3')!)
        default:
            throw new Error(`未定义的存储类型 ${type}`)
    }
})()
