import { OddType, Period, Variety } from '@shared/enum'
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript'

/**
 * 手动推荐盘口表
 */
@Table({ tableName: 'manual_promote_odd', paranoid: true })
export class ManualPromoteOdd extends Model<
    InferAttributes<ManualPromoteOdd>,
    InferCreationAttributes<ManualPromoteOdd>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 推荐记录id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare record_id: number

    /**
     * 比赛id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare match_id: number

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
     * 第一个盘口的投注方向
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: OddType

    /**
     * 第一盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL(5, 2))
    declare condition: string | number

    /**
     * 第二个盘口的投注方向
     */
    @Column(DataType.STRING)
    declare type2: CreationOptional<OddType | null>

    /**
     * 第二盘口
     */
    @Column(DataType.DECIMAL(5, 2))
    declare condition2: CreationOptional<string | number | null>

    /**
     * 生成的推荐盘口id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare promoted_odd_id: CreationOptional<number>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>

    @DeletedAt
    @Column(DataType.DATE)
    declare deleted_at: CreationOptional<Date | null>
}
