import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { AllowNull, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

/**
 * 用户账户表
 */
@Table({ tableName: 'user_account', timestamps: false })
export class UserAccount extends Model<
    InferAttributes<UserAccount>,
    InferCreationAttributes<UserAccount>
> {
    /**
     * 用户id
     */
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare user_id: number

    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare usdt: CreationOptional<string | number>

    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare usdt_trx: CreationOptional<string | number>

    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare usdt_bsc: CreationOptional<string | number>

    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare usdt_endless: CreationOptional<string | number>

    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare eds: CreationOptional<string | number>
}
