import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript'

/**
 * Luffa用户表
 */
@Table({ tableName: 'luffa_user' })
export class LuffaUser extends Model<
    InferAttributes<LuffaUser>,
    InferCreationAttributes<LuffaUser>
> {
    /**
     * uid
     */
    @PrimaryKey
    @Column(DataType.STRING)
    declare uid: string

    /**
     * 用户类型
     */

    @Column(DataType.TINYINT)
    declare type: LuffaType

    /**
     * 是否开启推送
     */

    @Column(DataType.TINYINT)
    declare open_push: CreationOptional<ToggleVal>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
