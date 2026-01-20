import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

/**
 * 用户客户端配置表
 */
@Table({ tableName: 'user_client_config', timestamps: false })
export class UserClientConfig extends Model<
    InferAttributes<UserClientConfig>,
    InferCreationAttributes<UserClientConfig>
> {
    /**
     * 用户id
     */
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare user_id: number

    /**
     * 滚球过滤配置
     */
    @Column(DataType.JSON)
    declare rockball_filter: CreationOptional<any>
}
