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
 * Bmiss投注用户余额变动记录表
 */
@Table({ tableName: 'bmiss_user_balance_log', updatedAt: false })
export class BmissUserBalanceLog extends Model<
    InferAttributes<BmissUserBalanceLog>,
    InferCreationAttributes<BmissUserBalanceLog>
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
     * 变动后的余额
     */
    @Column(DataType.DECIMAL)
    declare balance_after: NumberVal

    /**
     * 变动时间
     */
    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>
}
