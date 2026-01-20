import { OddIdentity, OddNext, OddStatus, OddType, Period, Variety } from '@shared/enum'
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'

/**
 * 盘口表
 */
@Table({ tableName: 'odd', timestamps: false })
export class Odd extends Model<InferAttributes<Odd>, InferCreationAttributes<Odd>> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 比赛id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare match_id: number

    /**
     * 皇冠比赛id
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare crown_match_id: string

    /**
     * 投注类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare variety: Variety

    /**
     * 比赛时段
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare period: Period

    /**
     * 投注方向
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: OddType

    /**
     * 投注方向类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare odd_type: OddIdentity

    /**
     * 盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL(5, 2))
    declare condition: string | number

    /**
     * 状态
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare status: CreationOptional<OddStatus>

    /**
     * surebet采集水位
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL(12, 6))
    declare surebet_value: string | number

    /**
     * 一次对比的皇冠水位
     */
    @Column(DataType.DECIMAL(12, 6))
    declare crown_value: CreationOptional<string | number | null>

    /**
     * 二次对比的皇冠水位
     */
    @Column(DataType.DECIMAL(12, 6))
    declare crown_value2: CreationOptional<string | number | null>

    /**
     * 二次对比的皇冠盘口
     */
    @Column(DataType.DECIMAL(5, 2))
    declare crown_condition2: CreationOptional<string | number | null>

    /**
     * 首次对比完成时间
     */
    @Column(DataType.DATE)
    declare ready_at: CreationOptional<Date | null>

    /**
     * 二次对比完成时间
     */
    @Column(DataType.DATE)
    declare final_at: CreationOptional<Date | null>

    /**
     * 二次对比完成的规则
     */
    @Column(DataType.STRING)
    declare final_rule: CreationOptional<string>

    /**
     * surebet最后推送时间
     */
    @AllowNull(false)
    @Column(DataType.DATE)
    declare surebet_updated_at: CreationOptional<Date>

    /**
     * 此盘口是否允许推荐
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare is_open: CreationOptional<0 | 1>
}
