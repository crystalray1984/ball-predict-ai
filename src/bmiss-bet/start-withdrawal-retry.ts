import { Bmiss } from '@shared/bmiss'
import { BmissWithdrawal } from '@shared/db'
import { consume, publish } from '@shared/rabbitmq'

/**
 * 执行提现重试
 * @param id
 */
async function processWithdrawalRetry(id: number) {
    //查询提现单
    const withdrawal = await BmissWithdrawal.findByPk(id)
    if (!withdrawal || withdrawal.status === 1) {
        //不需要处理了
        return
    }

    const bmiss = Bmiss.create(withdrawal.appid)
    if (!bmiss) {
        console.error(
            `[提现重试]`,
            '无效的appid',
            `id=${withdrawal.id}`,
            `appid=${withdrawal.appid}`,
        )
        return
    }

    //调用接口执行提现
    const ret = await bmiss.withdrawal({
        openid: withdrawal.openid,
        amount: withdrawal.amount,
        out_order_no: `bmiss_withdrawal_${withdrawal.id}`,
    })

    if (ret.code === 200 && ret.data.order_no) {
        //提现成功
        await BmissWithdrawal.update(
            {
                status: 1,
                bmiss_order_no: ret.data.order_no,
                completed_at: new Date(),
            },
            {
                where: {
                    id: withdrawal.id,
                    status: 0,
                },
            },
        )
    } else {
        //提现失败了，重入队列
        await publish(
            'bmiss-bet-withdrawal-retry',
            JSON.stringify({ id }),
            {
                headers: { 'x-delay': 10 },
            },
            {
                arguments: {
                    'x-delayed-type': 'direct',
                },
            },
        )
    }
}

/**
 * 启动提现重试队列
 */
async function startWithdrawalRetry() {
    while (true) {
        const [promise] = consume(
            'bmiss-bet-withdrawal-retry',
            async (content) => {
                const data = JSON.parse(content)
                await processWithdrawalRetry(data.id)
            },
            {},
            {
                arguments: {
                    'x-delayed-type': 'direct',
                },
            },
        )
        await promise
    }
}

if (require.main === module) {
    startWithdrawalRetry()
}
