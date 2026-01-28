import { Bmiss } from '@shared/bmiss'
import { BmissUserBet, db } from '@shared/db'
import { consume } from '@shared/rabbitmq'

/**
 * 消费退回
 */
function consumeRollback(bet_id: number) {
    return db.transaction(async (transaction) => {
        //查询订单记录
        const bet = await BmissUserBet.findOne({
            where: {
                id: bet_id,
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        })
        if (!bet || bet.paid !== 2) return

        //先更新记录
        bet.paid = 3
        await bet.save({ transaction })

        //然后调用提现接口回滚消费
        const bmiss = Bmiss.create(bet.appid)
        if (!bmiss) {
            console.error('[消费回滚]', '无效的appid', bet.toJSON())
            return
        }

        //调用接口
        const ret = await bmiss.withdrawal({
            openid: bet.openid,
            amount: bet.amount,
            out_order_no: `bmiss_user_bet_rollback_${bet.id}`,
        })
        if (ret.code !== 200) {
            //抛出异常
            throw new Error(`[消费回滚] 回滚失败 ${JSON.stringify(ret)}`)
        }
    })
}

/**
 * 启动消费退回队列
 */
async function startConsumeRollback() {
    while (true) {
        const [promise] = consume('bmiss-bet-consume-rollback', async (content) => {
            const data = JSON.parse(content)
            await consumeRollback(data.bet_id)
        })
        await promise
    }
}

if (require.main === module) {
    startConsumeRollback()
}
