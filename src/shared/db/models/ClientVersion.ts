import { ClientArch, ClientPlatform } from '@shared/enum'
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
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
 * 客户端版本表
 */
@Table({ tableName: 'client_version', paranoid: true })
export class ClientVersion extends Model<
    InferAttributes<ClientVersion>,
    InferCreationAttributes<ClientVersion>
> {
    /**
     * id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 平台
     */
    @AllowNull(false)
    @Column(DataType.STRING(20))
    declare platform: ClientPlatform

    /**
     * 架构
     */
    @AllowNull(false)
    @Column(DataType.STRING(20))
    declare arch: CreationOptional<ClientArch | ''>

    /**
     * 版本号
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare version: string

    /**
     * 版本号数值
     */
    @AllowNull(false)
    @Column(DataType.BIGINT)
    declare version_number: number

    /**
     * 是否强制更新
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare is_mandatory: CreationOptional<0 | 1>

    /**
     * 发布状态
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare status: CreationOptional<0 | 1>

    /**
     * 更新说明
     */
    @Column(DataType.TEXT)
    declare note: CreationOptional<string | null>

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
