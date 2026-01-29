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
 * 支付订单表
 */
@Table({ tableName: 'order' })
export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 订单日期
     */

    @Column(DataType.INTEGER)
    declare order_date: number

    /**
     * 订单号
     */

    @Column(DataType.STRING)
    declare order_number: CreationOptional<string>

    /**
     * 用户id
     */

    @Column(DataType.INTEGER)
    declare user_id: number

    /**
     * 订单类型
     */

    @Column(DataType.STRING)
    declare type: OrderType

    /**
     * 订单金额
     */

    @Column(DataType.DECIMAL)
    declare amount: NumberVal

    /**
     * 货币类型
     */

    @Column(DataType.STRING)
    declare currency: string

    /**
     * 订单状态
     */

    @Column(DataType.STRING)
    declare status: CreationOptional<OrderStatus>

    /**
     * 订单业务数据
     */
    @Column(DataType.JSON)
    declare extra: CreationOptional<any>

    /**
     * 收款商户类型
     */

    @Column(DataType.STRING)
    declare channel_type: string

    /**
     * 收款商户号
     */

    @Column(DataType.STRING)
    declare channel_id: CreationOptional<string>

    /**
     * 外部收款订单号
     */

    @Column(DataType.STRING)
    declare channel_order_no: CreationOptional<string>

    /**
     * 外部订单数据
     */
    @Column(DataType.JSON)
    declare channel_order_info: CreationOptional<any>

    /**
     * 支付完成时间
     */
    @Column(DataType.DATE)
    declare paid_at: CreationOptional<Date | null>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
