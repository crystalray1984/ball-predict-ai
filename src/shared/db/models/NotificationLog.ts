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
 * 通知记录表
 */
@Table({ tableName: 'notification_log', updatedAt: false })
export class NotificationLog extends Model<
    InferAttributes<NotificationLog>,
    InferCreationAttributes<NotificationLog>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 通知标识
     */

    @Column(DataType.STRING)
    declare keyword: string

    /**
     * 通知类型
     */

    @Column(DataType.STRING)
    declare category: string

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>
}
