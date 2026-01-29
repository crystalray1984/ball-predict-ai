import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AutoIncrement,
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
 * 管理员表
 */
@Table({ tableName: 'admin', paranoid: true })
export class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
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
     * 状态 1-正常 0-禁用
     */
    @Column(DataType.TINYINT)
    declare status: CreationOptional<ToggleVal>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>

    @DeletedAt
    @Column(DataType.DATE)
    declare deleted_at: CreationOptional<Date | null>
}
