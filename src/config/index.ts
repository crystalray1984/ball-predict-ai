import { load } from 'js-yaml'
import { get, merge } from 'lodash'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

//加载配置文件数据
const data = (() => {
    //待读取的文件名
    const files = ['config.yaml', 'config.yaml.local']

    const data: Record<string, any> = {}

    for (const file of files) {
        const filePath = resolve(__dirname, `../../${file}`)
        if (!existsSync(filePath)) continue

        const configData = load(readFileSync(filePath, 'utf-8')) ?? {}
        merge(data, configData)
    }

    return data
})()

/**
 * 读取配置文件的数据
 * @param path 配置项路径
 * @param defaultValue 配置不存在时的默认值
 */
export function config<T>(path: number | string | (string | number)[], defaultValue: T): T
/**
 * 读取配置文件的数据
 * @param path 配置项路径
 * @param defaultValue 配置不存在时的默认值
 */
export function config<T>(path: number | string | (string | number)[]): T | undefined
export function config(path: number | string | (string | number)[], defaultValue?: any): any {
    return get(data, path, defaultValue)
}
