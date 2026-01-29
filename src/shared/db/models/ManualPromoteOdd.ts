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

    @Column(DataType.INTEGER)
    declare record_id: number

    /**
     * 比赛id
     */

    @Column(DataType.INTEGER)
    declare match_id: number

    /**
     * 投注类型
     */

    @Column(DataType.STRING)
    declare variety: Variety

    /**
     * 比赛时段
     */

    @Column(DataType.STRING)
    declare period: Period

    /**
     * 第一个盘口的投注方向
     */

    @Column(DataType.STRING)
    declare type: OddType

    /**
     * 第一盘口
     */

    @Column(DataType.DECIMAL)
    declare condition: NumberVal

    /**
     * 第二个盘口的投注方向
     */
    @Column(DataType.STRING)
    declare type2: CreationOptional<OddType | null>

    /**
     * 第二盘口
     */
    @Column(DataType.DECIMAL)
    declare condition2: CreationOptional<NumberVal | null>

    /**
     * 生成的推荐盘口id
     */

    @Column(DataType.INTEGER)
    declare promoted_odd_id: CreationOptional<number>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>

    @DeletedAt
    @Column(DataType.DATE)
    declare deleted_at: CreationOptional<Date | null>
}
