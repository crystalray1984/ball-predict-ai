import { Middleware } from 'koa'
import i18next, { AVALIABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../i18next'

/**
 * 返回多语言支持中间件
 */
export function locale(): Middleware {
    return (ctx, next) => {
        //基于请求头上的lang参数确定使用哪个语言
        const headerValue = ctx.get('lang')
        if (headerValue) {
            const lang = normalizeLanguage(headerValue)
            if (AVALIABLE_LANGUAGES.includes(lang)) {
                ctx.state.t = i18next.getFixedT(lang)
                ctx.state.lang = lang
                return next()
            }
        }

        //基于Cookie里的lang数据
        const cookieValue = ctx.cookies.get('lang')
        if (cookieValue) {
            const lang = normalizeLanguage(cookieValue)
            if (AVALIABLE_LANGUAGES.includes(lang)) {
                ctx.state.t = i18next.getFixedT(lang)
                ctx.state.lang = lang
                return next()
            }
        }

        //基于浏览器上的语言字段确定使用哪种语言
        const acceptLanguage = ctx.get('accept-language')
        if (acceptLanguage) {
            const parts = acceptLanguage.split(',')
            for (const part of parts) {
                const lang = normalizeLanguage(part.split(';')[0].trim())
                if (AVALIABLE_LANGUAGES.includes(lang)) {
                    ctx.state.t = i18next.getFixedT(lang)
                    ctx.state.lang = lang
                    return next()
                }
            }
        }

        //无法解析就返回默认的数据
        ctx.state.t = i18next.getFixedT(DEFAULT_LANGUAGE)
        ctx.state.lang = DEFAULT_LANGUAGE
        return next()
    }
}

/**
 * 标准化语言标识
 */
function normalizeLanguage(input: string) {
    return input.split(/[_\-]/)[0].toLowerCase()
}
