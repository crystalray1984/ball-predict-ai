import { type RouterContext } from '@koa/router'
import { ValidateBody } from '@server/middlewares/validator'
import { fail, success } from '@server/utils'
import { createCaptcha } from '@shared/captcha'
import { ClientVersion, ClientVersionBuild, UserConnect } from '@shared/db'
import { sendMail } from '@shared/email'
import { ClientArch, ClientPlatform, UserConnectPlatform } from '@shared/enum'
import { redis } from '@shared/redis'
import { storage } from '@shared/storage'
import { getVersionNumber } from '@shared/utils'
import dayjs from 'dayjs'
import { dump as dumpYaml } from 'js-yaml'
import { Action, Controller, FromBody, Post } from 'koa-decorator-helpers'
import { isEmpty, random } from 'lodash'
import { InferAttributes, Op, WhereOptions } from 'sequelize'
import z from 'zod'

/**
 * 客户端公共接口
 */
@Controller({ prefix: '/common' })
export class Common {
    /**
     * 获取图形验证码
     */
    @Action('/captcha')
    async captcha() {
        return success(createCaptcha())
    }

    /**
     * 发送邮件验证码
     */
    @ValidateBody({
        email: z.email(),
        check_exists: z.optional(z.boolean()),
    })
    @Post('/send_email_code')
    async sendEmailCode(
        _: RouterContext,
        @FromBody body: { email: string; check_exists?: boolean },
    ) {
        if (body.check_exists === true) {
            //校验邮箱是否已存在
            const exists = await UserConnect.findOne({
                where: {
                    platform: UserConnectPlatform.Email,
                    account: body.email,
                },
                attributes: ['id'],
            })
            if (exists) {
                return fail('此邮箱已被使用')
            }
        } else if (body.check_exists === false) {
            //校验邮箱是否不存在
            const exists = await UserConnect.findOne({
                where: {
                    platform: UserConnectPlatform.Email,
                    account: body.email,
                },
                attributes: ['id'],
            })
            if (!exists) {
                return fail('此邮箱不存在')
            }
        }

        //生成邮件验证码
        const code = random(9999).toString().padStart(4, '0')

        //写入Redis缓存
        await redis.setex(`email_code:${body.email}`, 600, code)

        //发送邮件验证码
        try {
            await sendMail({
                to: body.email,
                subject: 'Your verification code',
                text: `Your verification code is ${code}.`,
                html: `Your verification code is <b>${code}</b>.`,
            })
            return success()
        } catch (err) {
            console.error(err)
            return fail('邮件发送失败')
        }
    }

    /**
     * 检查桌面版更新
     */
    @Action('/check_desktop_update/:name?')
    async checkDesktopUpdate(ctx: RouterContext) {
        const platform = (ctx.query.platform ?? ctx.get('platform')) as ClientPlatform
        const arch = (ctx.query.arch ?? ctx.get('arch')) as ClientArch
        const version_number = getVersionNumber((ctx.query.version ?? ctx.get('version')) as string)

        const whereVersion: WhereOptions<InferAttributes<ClientVersion>> = {
            platform,
            version_number: {
                [Op.gte]: version_number,
            },
            status: 1,
            deleted_at: null,
        }
        if (!isEmpty(arch)) {
            whereVersion.arch = arch
        }

        const build = await ClientVersionBuild.findOne({
            include: {
                model: ClientVersion,
                required: true,
                where: whereVersion,
                attributes: ['id', 'version', 'version_number', 'is_mandatory'],
            },
            where: {
                status: 1,
            },
            attributes: ['hot_update_info', 'updated_at'],
        })

        if (!build) {
            //客户端调用
            return ''
        }

        //判断是否需要强制更新
        if (
            !build.client_version.is_mandatory &&
            build.client_version.version_number > version_number
        ) {
            const where: WhereOptions<InferAttributes<ClientVersion>> = {
                platform,
                version_number: {
                    [Op.gt]: version_number,
                    [Op.lt]: build.client_version.version_number,
                },
                status: 1,
                is_mandatory: 1,
            }
            if (!isEmpty(arch)) {
                where.arch = arch
            }
            const exists = await ClientVersion.findOne({
                where,
                attributes: ['id'],
            })
            if (exists) {
                //有强制更新
                build.client_version.is_mandatory = 1
            }
        }

        //生成更新内容
        const url = storage.getUrl(build.hot_update_info.path)

        const result = {
            version: build.client_version.version,
            files: [
                {
                    url,
                    sha512: build.hot_update_info.hash,
                    size: build.hot_update_info.size,
                },
            ],
            path: url,
            sha512: build.hot_update_info.hash,
            releaseDate: dayjs(build.client_version.updated_at).toISOString(),
            releaseNotes: build.client_version.is_mandatory ? '1' : null,
        }

        ctx.set('Content-Type', 'application/yaml')
        ctx.body = dumpYaml(result, {
            indent: 2,
        })
    }

    /**
     * 获取Luffa小游戏列表
     */
    @Action('/luffa_game_list')
    async luffaGameList() {}
}
