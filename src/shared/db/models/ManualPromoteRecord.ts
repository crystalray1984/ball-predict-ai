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
@Table({ tableName: 'manual_promote_record', paranoid: true })
export class ManualPromoteRecord extends Model<
    InferAttributes<ManualPromoteRecord>,
    InferCreationAttributes<ManualPromoteRecord>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 推荐类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: ManualPromoteType

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
