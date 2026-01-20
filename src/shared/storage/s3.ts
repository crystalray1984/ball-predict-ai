import { S3 } from 'aws-sdk'
import { isEmpty } from 'lodash'
import { createReadStream, createWriteStream, WriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { StorageEngine, UploadForm } from './common'

interface S3EngineConfig {
    region: string
    bucket: string
    key: string
    secret: string
    url_prefix: string
}

/**
 * 基于S3的文件存储引擎
 */
export class S3Engine implements StorageEngine {
    protected client: S3

    constructor(protected readonly config: S3EngineConfig) {
        this.client = new S3({
            region: config.region,
            credentials: {
                accessKeyId: config.key,
                secretAccessKey: config.secret,
            },
        })
    }

    getUploadForm(remotePath: string): UploadForm {
        const { url, fields } = this.client.createPresignedPost({
            Bucket: this.config.bucket,
            Conditions: [['$key', 'eq', remotePath]],
            Fields: {
                key: remotePath,
            },
        })

        return {
            post_url: url,
            fields,
            file_path: remotePath,
            file_url: this.getUrl(remotePath),
        }
    }

    exists(remotePath: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.client.headObject(
                {
                    Bucket: this.config.bucket,
                    Key: remotePath,
                },
                (err) => {
                    if (err) {
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                },
            )
        })
    }

    copyFile(from: string, to: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.copyObject(
                {
                    Bucket: this.config.bucket,
                    Key: to,
                    CopySource: `${this.config.bucket}/${from}`,
                },
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                },
            )
        })
    }

    deleteFile(remotePath: string): Promise<void> {
        return new Promise((resolve) => {
            this.client.deleteObject(
                {
                    Bucket: this.config.bucket,
                    Key: remotePath,
                },
                () => resolve(),
            )
        })
    }

    getUrl(remotePath: string): string {
        return isEmpty(this.config.url_prefix)
            ? this.getRawUrl(remotePath)
            : new URL(remotePath, this.config.url_prefix).href
    }

    protected getRawUrl(remotePath: string): string {
        return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${remotePath}`
    }

    getFile(remotePath: string): Promise<Readable>
    getFile(remotePath: string, localPath: string): Promise<void>
    getFile(remotePath: string, localPath?: string): Promise<void | Readable> {
        return new Promise<void | Readable>((resolve, reject) => {
            this.client.getObject(
                {
                    Bucket: this.config.bucket,
                    Key: remotePath,
                },
                (err, data) => {
                    if (err) {
                        reject(err)
                        return
                    }

                    if (isEmpty(localPath)) {
                        //返回可读流
                        resolve(data.Body as Readable)
                        return
                    }

                    //直接下载到本地文件
                    let output: WriteStream
                    try {
                        output = createWriteStream(remotePath)
                    } catch (err) {
                        reject(err)
                        return
                    }

                    ;(data.Body as Readable)
                        .on('error', (err) => {
                            reject(err)
                            output.close()
                        })
                        .pipe(
                            output.on('error', (err) => {
                                reject(err)
                                output.close()
                            }),
                        )
                        .on('finish', () => {
                            output.close()
                            resolve()
                        })
                },
            )
        })
    }

    putFile(localPath: string, remotePath: string): Promise<void>
    putFile(content: Readable | ArrayBufferLike, remotePath: string): Promise<void>
    putFile(content: string | Readable | ArrayBufferLike, remotePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const input = typeof content === 'string' ? createReadStream(content) : content
            this.client.upload(
                {
                    Body: input,
                    Bucket: this.config.bucket,
                    Key: remotePath,
                },
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                },
            )
        })
    }
}
