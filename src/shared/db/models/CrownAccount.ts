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
 * 皇冠账号表
 */
@Table({ tableName: 'crown_account' })
export class CrownAccount extends Model<
    InferAttributes<CrownAccount>,
    InferCreationAttributes<CrownAccount>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 用户名
     */

    @Column(DataType.STRING)
    declare username: string

    /**
     * 密码
     */

    @Column(DataType.STRING)
    declare password: string

    /**
     * 状态 1-正常 0-已被封禁
     */

    @Column(DataType.TINYINT)
    declare status: CreationOptional<ToggleVal>

    /**
     * 持有的设备号
     */

    @Column(DataType.STRING)
    declare use_by: CreationOptional<string>

    /**
     * 持有的有效期
     */

    @Column(DataType.DATE)
    declare use_expires: CreationOptional<Date>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
