import { CrownMainOdd, db, VMatch } from '@shared/db'
import { consume } from '@shared/rabbitmq'
import { io } from '@shared/socket'
import { Op } from 'sequelize'

/**
 * 提示比赛的盘口有变动
 * @param match_id 比赛id
 */
async function processOddUpdate(match_id: number) {
    const odd = await CrownMainOdd.findOne({
        where: {
            match_id,
            is_active: 1,
            base: 'ah',
        },
        include: [
            {
                model: VMatch,
                required: true,
                where: {
                    bmiss_bet_enable: 1,
                },
                attributes: ['id', 'match_time', 'team1_name', 'team2_name', 'tournament_name'],
            },
        ],
        attributes: ['id', 'condition', 'value1', 'value2'],
    })
    if (!odd) return
    if (odd.match.match_time.valueOf() <= Date.now()) return

    io.to('bmiss-bet').emit('odd-update', {
        ...odd.match.toJSON(),
        odd: {
            id: odd.id,
            condition: Number(odd.condition),
            value1: Number(odd.value1),
            value2: Number(odd.value2),
        },
    })
}

/**
 * 启动盘口变化时的更新通知队列
 */
async function startOddUpdate() {
    while (true) {
        const [promise] = consume('bmiss-bet-odd-update', async (content) => {
            const data = JSON.parse(content)
            await processOddUpdate(data.id)
        })
        await promise
    }
}

/**
 * 检查是否有比赛从可投注转入不可投注
 */
function checkBetableMatches() {
    let matches: number[] = []

    const check = async () => {
        const betable = await CrownMainOdd.findAll({
            where: {
                is_active: 1,
                base: 'ah',
            },
            include: [
                {
                    model: VMatch,
                    required: true,
                    attributes: ['id'],
                    where: {
                        bmiss_bet_enable: 1,
                        match_time: {
                            [Op.gt]: db.literal('CURRENT_TIMESTAMP'),
                        },
                    },
                },
            ],
            attributes: ['match_id'],
        })

        const betableMatches = betable.map((t) => t.match_id)
        const closed = matches.filter((id) => !betableMatches.includes(id))
        if (closed.length > 0) {
            //通知前端
            io.to('bmiss-bet').emit('match-closed', closed)
        }
        matches = betableMatches
        setTimeout(check, 5000)
    }

    check()
}

if (require.main === module) {
    startOddUpdate()
    checkBetableMatches()
}
