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
    UpdatedAt,
} from 'sequelize-typescript'

/**
 * 滚球盘口表
 */
@Table({ tableName: 'rockball_odd', timestamps: false })
export class RockballOdd extends Model<
    InferAttributes<RockballOdd>,
    InferCreationAttributes<RockballOdd>
> {
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
     * 触发的投注类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare source_variety: Variety

    /**
     * 触发的比赛时段
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare source_period: Period

    /**
     * 触发的投注方向
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare source_type: OddType

    /**
     * 触发的盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare source_condition: NumberVal

    /**
     * 触发的水位
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare source_value: NumberVal

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
     * 盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare condition: NumberVal

    /**
     * 水位条件
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare value: NumberVal

    /**
     * 盘口状态
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare status: CreationOptional<RockballOddStatus>

    /**
     * 是否开启推荐
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare is_open: CreationOptional<ToggleVal>

    /**
     * 来源推荐通道
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare source_channel: CreationOptional<string>

    /**
     * 来源推荐id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare source_id: CreationOptional<number>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
