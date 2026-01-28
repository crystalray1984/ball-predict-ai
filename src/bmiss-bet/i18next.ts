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
