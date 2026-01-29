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
import { ClientVersion } from './ClientVersion'

/**
 * 客户端更新包表
 */
@Table({ tableName: 'client_version_build', paranoid: true })
export class ClientVersionBuild extends Model<
    InferAttributes<ClientVersionBuild>,
    InferCreationAttributes<ClientVersionBuild>
> {
    /**
     * id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 版本id
     */

    @Column(DataType.INTEGER)
    declare client_version_id: number

    /**
     * 版本对象
     */
    @BelongsTo(() => ClientVersion, 'client_version_id')
    declare client_version: CreationOptional<ClientVersion>

    /**
     * 编译版本号
     */

    @Column(DataType.INTEGER)
    declare build_number: CreationOptional<number>

    /**
     * 是否为底包更新
     */

    @Column(DataType.TINYINT)
    declare is_base: CreationOptional<ToggleVal>

    /**
     * 发布状态
     */

    @Column(DataType.TINYINT)
    declare status: CreationOptional<ToggleVal>

    /**
     * 完整主包信息
     */
    @Column(DataType.JSON)
    declare full_info: CreationOptional<any>

    /**
     * 热更新包信息
     */
    @Column(DataType.JSON)
    declare hot_update_info: CreationOptional<any>

    /**
     * ZIP包信息
     */
    @Column(DataType.JSON)
    declare zip_info: CreationOptional<any>

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
