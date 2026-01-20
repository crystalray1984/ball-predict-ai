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
 * 小游戏列表
 */
@Table({ tableName: 'luffa_game' })
export class LuffaGame extends Model<
    InferAttributes<LuffaGame>,
    InferCreationAttributes<LuffaGame>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 游戏标识
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare app_id: string

    /**
     * 游戏入口
     */
    @Column(DataType.STRING)
    declare app_entry: CreationOptional<string | null>

    /**
     * 图片地址
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare img_path: string

    /**
     * 名称
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare name: string

    /**
     * 是否可见
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare is_visible: CreationOptional<0 | 1>

    /**
     * 排序权重
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare sort: CreationOptional<number>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
