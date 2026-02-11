import i18next from 'i18next'
import en from './locales/en.json'
import zh from './locales/zh.json'

/**
 * 可用的语言列表
 */
export const AVALIABLE_LANGUAGES = ['en', 'zh']

/**
 * 默认语言
 */
export const DEFAULT_LANGUAGE = 'en'

//初始化组件
i18next.init({
    resources: {
        en: {
            translations: en,
        },
        zh: {
            translations: zh,
        },
    },
    supportedLngs: AVALIABLE_LANGUAGES,
    fallbackLng: ['en', 'dev'],
    lng: DEFAULT_LANGUAGE,
})

export default i18next

/**
 * 按语言选择数据
 * @param source
 * @param lang
 */
export function pickByLocale(source: Record<string, string> | null | undefined, lang: string) {
    if (typeof source !== 'object' || !source) return
    if (typeof lang !== 'string') return
    if (typeof source[lang] === 'string') {
        return source[lang]
    } else if (lang !== DEFAULT_LANGUAGE && typeof source[DEFAULT_LANGUAGE] === 'string') {
        return source[DEFAULT_LANGUAGE]
    }
}
