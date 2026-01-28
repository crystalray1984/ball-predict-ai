import { Bmiss } from '@shared/bmiss'
import { BmissUserBet, Match } from '@shared/db'
import { consume, publish } from '@shared/rabbitmq'
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
        attributes: ['has_score', 'score1', 'score2'],
    })
    if (!match) return
    if (!match.has_score) return

    //查询这场比赛所有的投注单
    const bets = await BmissUserBet.findAll({
        where: {
            match_id,
            paid: 1,
            result: null,
        },
    })

    if (bets.length === 0) return

    const score1 = match.score1!
    const score2 = match.score2!

    for (const bet of bets) {
        //结算投注单
        const result = getOddResult(bet.type, bet.condition, score1, score2)
        switch (result) {
            case 2:
                //全赢
                bet.result = 1
                bet.result_amount = Decimal(bet.amount).mul(bet.value).floor().toNumber()
                break
            case 1:
                //半赢
                bet.result = 1
                bet.result_amount = Decimal(bet.amount)
                    .mul(Decimal(bet.value).add(1))
                    .div(2)
                    .floor()
                    .toNumber()
                break
            case -1:
                //半输
                bet.result = -1
                bet.result_amount = Decimal(bet.amount).div(2).floor().toNumber()
                break
            case 2:
                //全输
                bet.result = -1
                bet.result_amount = 0
                break
            default:
                //和局
                bet.result = 0
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

        //保存数据
        await bet.save()

        //抛到队列进行奖金返还
        if (bet.result_amount > 0) {
            await publish('bmiss-bet-settlement-income', JSON.stringify({ bet_id: bet.id }))
        }
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

/**
 * 结算投注收益
 * @param bet_id
 */
async function settlmentIncome(bet_id: number) {
    //查询投注单
    const bet = await BmissUserBet.findOne({
        where: {
            id: bet_id,
        },
    })
    if (!bet) return
    if (bet.result_amount <= 0) return
    if (bet.settlement_at) return

    //调用接口
    const ret = await Bmiss.create(bet.appid).withdrawal({
        openid: bet.openid,
        amount: bet.result_amount,
        out_order_no: `bmiss_user_bet_income_${bet.id}`,
    })
    if (ret.code === 200) {
        //调用成功
        bet.settlement_at = new Date()
        bet.result_status = 'success'
        await bet.save()
    } else {
        console.error('[投注结算]', '提现失败', JSON.stringify(ret))
    }
}

/**
 * 启动结算收益队列
 */
async function startSettlementIncome() {
    while (true) {
        const [promise] = consume('bmiss-bet-settlement-income', async (content) => {
            const data = JSON.parse(content)
            await settlmentIncome(data.bet_id)
        })
        await promise
    }
}

if (require.main === module) {
    startSettlement()
    startSettlementIncome()
}
