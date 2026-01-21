import { config } from '@config'
import { createTransport, SendMailOptions } from 'nodemailer'

//创建用于发送邮件的SMTP对象
const transport = createTransport({
    host: config('smtp.host'),
    port: config('smtp.port', 25),
    secure: config('smtp.secure', config<number>('smtp.port', 25) === 465 ? true : false),
    auth: {
        user: config('smtp.user'),
        pass: config('smtp.pass'),
    },
})

/**
 * 发送邮件
 */
export function sendMail(mail: SendMailOptions) {
    if (!mail.from) {
        mail.from = config('smtp.from')
    }

    return transport.sendMail(mail)
}
