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
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare user_id: number

    /**
     * 用户openid
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare openid: string

    /**
     * Bmiss小程序appid
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare appid: string

    /**
     * 比赛id
     */
    @AllowNull(false)
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
    @AllowNull(false)
    @Column(DataType.STRING)
    declare base: OddIdentity

    /**
     * 下注方向
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: OddType

    /**
     * 盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare condition: NumberVal

    /**
     * 水位
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare value: NumberVal

    /**
     * 下注金额（钻石）
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare amount: number

    /**
     * 下注时间
     */
    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    /**
     * 是否下注成功
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare paid: CreationOptional<number>

    /**
     * 结算结果
     */
    @Column(DataType.TINYINT)
    declare result: CreationOptional<-1 | 0 | 1 | null>

    /**
     * 结算收益
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare result_amount: CreationOptional<number>

    /**
     * 结算状态
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare result_status: CreationOptional<string>

    /**
     * 展示用的结算文字
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare result_text: CreationOptional<string>

    /**
     * 结算完成时间
     */
    @Column(DataType.DATE)
    declare settlement_at: CreationOptional<Date | null>
}
