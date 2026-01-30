import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import { VMatch } from './VMatch'

/**
 * Bmiss竞猜投注记录表
 */
@Table({ tableName: 'bmiss_user_bet', updatedAt: false })
export class BmissUserBet extends Model<
    InferAttributes<BmissUserBet>,
    InferCreationAttributes<BmissUserBet>
> {
    /**
     * id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 用户id
     */

    @Column(DataType.INTEGER)
    declare user_id: number

    /**
     * 比赛id
     */

    @Column(DataType.INTEGER)
    declare match_id: number

    /**
     * 比赛数据
     */
    @BelongsTo(() => VMatch, 'match_id')
    declare match: CreationOptional<VMatch>

    /**
     * 下注类型
     */

    @Column(DataType.STRING)
    declare base: OddIdentity

    /**
     * 下注方向
     */

    @Column(DataType.STRING)
    declare type: OddType

    /**
     * 盘口
     */

    @Column(DataType.DECIMAL)
    declare condition: NumberVal

    /**
     * 水位
     */

    @Column(DataType.DECIMAL)
    declare value: NumberVal

    /**
     * 下注金额（钻石）
     */

    @Column(DataType.INTEGER)
    declare amount: number

    /**
     * 下注时间
     */
    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    /**
     * 结算结果
     */
    @Column(DataType.TINYINT)
    declare result: CreationOptional<-2 | -1 | 0 | 1 | 2 | null>

    /**
     * 结算收益
     */

    @Column(DataType.INTEGER)
    declare result_amount: CreationOptional<NumberVal>

    /**
     * 结算状态
     */

    @Column(DataType.STRING)
    declare result_status: CreationOptional<string>

    /**
     * 展示用的结算文字
     */

    @Column(DataType.STRING)
    declare result_text: CreationOptional<string>

    /**
     * 结算完成时间
     */
    @Column(DataType.DATE)
    declare settlement_at: CreationOptional<Date | null>

    public toJSON(): object {
        const obj = this.get()
        if ('condition' in obj) {
            obj.condition = Number(obj.condition)
        }
        if ('value' in obj) {
            obj.value = Number(obj.value)
        }
        if ('result_amount' in obj) {
            obj.result_amount = Number(obj.result_amount)
        }

        return obj
    }
}
