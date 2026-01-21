import { Readable } from 'node:stream'

export interface UploadForm {
    post_url: string
    fields: Record<string, string>
    file_path: string
    file_url: string
}

/**
 * 存储引擎
 */
export interface StorageEngine {
    getUploadForm(remotePath: string): UploadForm
    /**
     * 判断文件是否存在
     * @param remotePath
     */
    exists(remotePath: string): Promise<boolean>

    copyFile(from: string, to: string): Promise<void>

    deleteFile(remotePath: string): Promise<void>

    getUrl(remotePath: string): string

    getFile(remotePath: string): Promise<Readable>
    getFile(remotePath: string, localPath: string): Promise<void>

    putFile(localPath: string, remotePath: string): Promise<void>
    putFile(content: Buffer | Uint8Array | Blob | Readable, remotePath: string): Promise<void>
}
