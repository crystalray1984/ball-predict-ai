import { TFunction } from 'i18next'
import type { DefaultContextExtends } from 'koa'

declare module 'koa' {
    interface DefaultStateExtends {
        t: TFunction
    }
}
