import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript'
import { User } from './User'

/**
 * 用户登录信息表
 */
@Table({ tableName: 'user_connect', paranoid: true })
export class UserConnect extends Model<
    InferAttributes<UserConnect>,
    InferCreationAttributes<UserConnect>
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

    @BelongsTo(() => User, 'user_id')
    declare user: CreationOptional<User>

    /**
     * 平台类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare platform: UserConnectPlatform

    /**
     * 平台id
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare platform_id: CreationOptional<string>

    /**
     * 平台账号
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare account: string

    /**
     * 密码
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare password: CreationOptional<string>

    /**
     * 账号扩展属性
     */
    @Column(DataType.JSON)
    declare extra: CreationOptional<any>

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
