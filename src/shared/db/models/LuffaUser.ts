import { LuffaType } from '@shared/enum'
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
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: LuffaType

    /**
     * 是否开启推送
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare open_push: CreationOptional<0 | 1>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
