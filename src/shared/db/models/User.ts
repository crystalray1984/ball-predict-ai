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

/**
 * 用户表
 */
@Table({ tableName: 'user', paranoid: true })
export class User<TAttributes extends {} = {}> extends Model<
    InferAttributes<User> & TAttributes,
    InferCreationAttributes<User>
> {
    /**
     * 用户id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 昵称
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare nickname: CreationOptional<string>

    /**
     * 头像地址
     */
    @Column(DataType.STRING)
    declare avatar: CreationOptional<string | null>

    /**
     * 状态 1-正常 0-已禁用
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare status: CreationOptional<ToggleVal>

    /**
     * VIP到期时间
     */
    @AllowNull(false)
    @Column(DataType.DATE)
    declare expire_time: CreationOptional<Date>

    /**
     * VIP是否已到期
     */
    @Column(DataType.VIRTUAL)
    get is_expired(): CreationOptional<ToggleVal> {
        return this.expire_time.valueOf() <= Date.now() ? 1 : 0
    }

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

    /**
     * 注册来源
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare reg_source: CreationOptional<string>

    /**
     * 邀请码
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare code: CreationOptional<string>

    /**
     * 邀请人id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare invite_user_id: CreationOptional<number>

    /**
     * 邀请人
     */
    @BelongsTo(() => User, 'invite_user_id')
    declare inviter: CreationOptional<User | null>

    /**
     * 邀请关系绑定时间
     */
    @Column(DataType.DATE)
    declare invited_at: CreationOptional<Date | null>
}
