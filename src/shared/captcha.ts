import { ConfigObject, create } from 'svg-captcha'
import { md5 } from './utils'

/**
 * 创建图形验证码数据
 */
export function createCaptcha(config?: ConfigObject) {
    const captcha = create(config)
    const base64 = Buffer.from(captcha.data, 'utf-8').toString('base64')
    const key = md5(`captcha:${captcha.text.toLowerCase()}`)
    return {
        key,
        base64: `data:image/svg+xml;base64,${base64}`,
    }
}

/**
 * 校验图形验证码数据
 */
export function verifyCaptcha(key: string, code: string) {
    return md5(`captcha:${code.toLowerCase()}`) === key
}
