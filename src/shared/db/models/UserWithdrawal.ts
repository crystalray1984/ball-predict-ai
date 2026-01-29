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
 * 用户提现记录表
 */
@Table({ tableName: 'user_withdrawal' })
export class UserWithdrawal extends Model<
    InferAttributes<UserWithdrawal>,
    InferCreationAttributes<UserWithdrawal>
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
     * 货币类型
     */

    @Column(DataType.STRING)
    declare currency: string

    /**
     * 提现金额
     */

    @Column(DataType.DECIMAL)
    declare amount: NumberVal

    /**
     * 提现通道类型
     */

    @Column(DataType.STRING)
    declare channel_type: string

    /**
     * 提现账号
     */

    @Column(DataType.STRING)
    declare withdrawal_account: string

    /**
     * 状态
     */

    @Column(DataType.STRING)
    declare status: CreationOptional<WithdrawalStatus>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>

    /**
     * 完成时间
     */
    @Column(DataType.DATE)
    declare finished_at: CreationOptional<Date | null>
}
