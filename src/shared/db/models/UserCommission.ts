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
 * 用户佣金记录表
 */
@Table({ tableName: 'user_commission', updatedAt: false })
export class UserCommission extends Model<
    InferAttributes<UserCommission>,
    InferCreationAttributes<UserCommission>
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
     * 获得的佣金
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare commission: string | number

    /**
     * 佣金货币类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare currency: string

    /**
     * 产生佣金的订单id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare order_id: number

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    /**
     * 佣金结算时间
     */
    @Column(DataType.DATE)
    declare settled_at: CreationOptional<Date | null>
}
