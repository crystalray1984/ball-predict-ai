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
 * 佣金余额变动记录表
 */
@Table({ tableName: 'user_commission_record', updatedAt: false })
export class UserCommissionRecord extends Model<
    InferAttributes<UserCommissionRecord>,
    InferCreationAttributes<UserCommissionRecord>
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
     * 佣金货币类型
     */

    @Column(DataType.STRING)
    declare currency: string

    /**
     * 变动原因
     */

    @Column(DataType.STRING)
    declare type: string

    /**
     * 变动数值
     */

    @Column(DataType.DECIMAL)
    declare amount: NumberVal

    /**
     * 变动后的数值
     */

    @Column(DataType.DECIMAL)
    declare amount_after: NumberVal

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>
}
