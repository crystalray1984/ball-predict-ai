import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'

/**
 * surebet推送记录表
 */
@Table({ tableName: 'surebet_record', updatedAt: false })
export class SurebetRecord extends Model<
    InferAttributes<SurebetRecord>,
    InferCreationAttributes<SurebetRecord>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 皇冠比赛id
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare crown_match_id: string

    /**
     * 比赛时间
     */
    @AllowNull(false)
    @Column(DataType.DATE)
    declare match_time: Date

    /**
     * 主队名称
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare team1: string

    /**
     * 客队名称
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare team2: string

    /**
     * 类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare game: string

    /**
     * 类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare base: string

    /**
     * 投注类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare variety: string

    /**
     * 比赛时段
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare period: string

    /**
     * 投注方向
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: string

    /**
     * 投注方向
     */
    @Column(DataType.STRING)
    declare condition: string | null

    /**
     * 水位
     */
    @Column(DataType.DECIMAL)
    declare value: string | number

    /**
     * 数据源
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare source: string

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>
}
