import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'

/**
 * Bmiss投注用户充值记录表
 */
@Table({ tableName: 'bmiss_recharge', updatedAt: false })
export class BmissRecharge extends Model<
    InferAttributes<BmissRecharge>,
    InferCreationAttributes<BmissRecharge>
> {
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
     * Bmiss轻应用appid
     */
    @Column(DataType.STRING)
    declare appid: string

    /**
     * Bmiss用户openid
     */
    @Column(DataType.STRING)
    declare openid: string

    /**
     * 充值金额
     */
    @Column(DataType.INTEGER)
    declare amount: number

    /**
     * 状态 0-充值未完成 1-充值已完成
     */
    @Column(DataType.TINYINT)
    declare status: CreationOptional<ToggleVal>

    /**
     * 订单创建时间
     */
    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    /**
     * Bmiss充值单号
     */
    @Column(DataType.STRING)
    declare bmiss_order_no: CreationOptional<string>

    /**
     * 充值完成时间
     */
    @Column(DataType.DATE)
    declare completed_at: CreationOptional<Date | null>

    /**
     * Bmiss充值附加数据
     */
    @Column(DataType.JSON)
    declare bmiss_order_info: CreationOptional<any>
}
