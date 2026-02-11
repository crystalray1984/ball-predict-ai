import { BmissUser, BmissUserBalanceLog, BmissUserBet, db, Match } from '@shared/db'
import { consume } from '@shared/rabbitmq'
import { getOddResult } from '@shared/utils'
import Decimal from 'decimal.js'

/**
 * 结算比赛
 * @param match_id 比赛id
 */
async function settlement(match_id: number) {
    //查询比赛数据
    const match = await Match.findOne({
        where: {
            id: match_id,
        },
        attributes: ['error_status', 'has_score', 'score1', 'score2'],
    })
    if (!match) return

    if (match.error_status === 'cancelled' || match.error_status === 'interrupted') {
        //比赛中断，走全部退回的逻辑
        await cancelBets(match_id, match.error_status)
    }

    if (!match.has_score) return

    //查询这场比赛所有的投注单
    const bets = await BmissUserBet.findAll({
        where: {
            match_id,
            result: null,
        },
    })

    if (bets.length === 0) return

    const score1 = match.score1!
    const score2 = match.score2!

    for (const bet of bets) {
        //结算投注单
        bet.result = getOddResult(bet.type, bet.condition, score1, score2)
        switch (bet.result) {
            case 2:
                //全赢
                bet.result_amount = Decimal(bet.amount).mul(bet.value).floor().toNumber()
                break
            case 1:
                //半赢
                bet.result_amount = Decimal(bet.amount)
                    .mul(Decimal(bet.value).add(1))
                    .div(2)
                    .floor()
                    .toNumber()
                break
            case -1:
                //半输
                bet.result_amount = Decimal(bet.amount).div(2).floor().toNumber()
                break
            case -2:
                //全输
                bet.result_amount = 0
                break
            default:
                //和局
                bet.result_amount = bet.amount
                break
        }

        //写入展示
        switch (bet.base) {
            case 'sum':
                bet.result_text = (score1 + score2).toString()
                break
            default:
                bet.result_text = `${score1}:${score2}`
                break
        }

        bet.settlement_at = new Date()
        //计算用户收益
        const profit = Decimal(bet.result_amount).sub(bet.amount)

        await db.transaction(async (transaction) => {
            //保存数据
            await bet.save({ transaction })

            //读取用户信息
            const user = await BmissUser.findByPk(bet.user_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            })
            if (user) {
                //增加余额
                if (Decimal(bet.result_amount).gt(0)) {
                    user.balance = Decimal(user.balance).add(bet.result_amount).toString()
                    //插入余额变动记录表
                    await BmissUserBalanceLog.create(
                        {
                            user_id: bet.user_id,
                            type: 'bet_result',
                            amount: bet.result_amount,
                            balance_after: user.balance,
                            created_at: bet.settlement_at!,
                        },
                        { transaction },
                    )
                }

                //累加收益
                if (!profit.eq(0)) {
                    user.profit = Decimal(user.profit).add(profit).toString()
                }

                await user.save({ transaction })
            }
        })
    }
}

/**
 * 取消所有的注单（由于比赛取消、中断或者延期过长）
 * @param match_id
 */
async function cancelBets(match_id: number, error_status: string) {
    //查询这场比赛所有的投注单
    const bets = await BmissUserBet.findAll({
        where: {
            match_id,
            result: null,
        },
    })

    if (bets.length === 0) return

    for (const bet of bets) {
        //结算投注单
        bet.result = 99
        bet.result_text = error_status
        bet.result_amount = bet.amount
        bet.settlement_at = new Date()

        await db.transaction(async (transaction) => {
            //保存数据
            await bet.save({ transaction })

            //读取用户信息
            const user = await BmissUser.findByPk(bet.user_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            })
            if (user) {
                //增加余额
                user.balance = Decimal(user.balance).add(bet.result_amount).toString()
                //插入余额变动记录表
                await BmissUserBalanceLog.create(
                    {
                        user_id: bet.user_id,
                        type: 'bet_result',
                        amount: bet.result_amount,
                        balance_after: user.balance,
                        created_at: bet.settlement_at!,
                    },
                    { transaction },
                )

                await user.save({ transaction })
            }
        })
    }
}

/**
 * 启动结算队列
 */
async function startSettlement() {
    while (true) {
        const [promise] = consume('bmiss-bet-settlement', async (content) => {
            const data = JSON.parse(content)
            await settlement(data.match_id)
        })
        await promise
    }
}

if (require.main === module) {
    startSettlement()
}
