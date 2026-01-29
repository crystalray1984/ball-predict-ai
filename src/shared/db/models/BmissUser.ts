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
 * Bmiss用户表
 */
@Table({ tableName: 'bmiss_user', updatedAt: false })
export class BmissUser extends Model<
    InferAttributes<BmissUser>,
    InferCreationAttributes<BmissUser>
> {
    /**
     * 用户id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 用户openid
     */

    @Column(DataType.STRING)
    declare openid: string

    /**
     * Bmiss小程序appid
     */

    @Column(DataType.STRING)
    declare appid: string

    /**
     * 昵称
     */

    @Column(DataType.STRING)
    declare nickname: string

    /**
     * 头像
     */

    @Column(DataType.STRING)
    declare avatar: CreationOptional<string>

    /**
     * 首次登录时间
     */
    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    /**
     * 资料更新时间
     */
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>

    /**
     * 最后登录时间
     */
    @Column(DataType.DATE)
    declare last_login_at: CreationOptional<Date>

    /**
     * 累计收益
     */
    @Column(DataType.INTEGER)
    declare profit: CreationOptional<number>
}
