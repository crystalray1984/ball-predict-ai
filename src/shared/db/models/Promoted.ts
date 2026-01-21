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
 * 推荐数据表
 */
@Table({ tableName: 'promoted', updatedAt: false })
export class Promoted<TAttributes extends {} = {}> extends Model<
    InferAttributes<Promoted> & TAttributes,
    InferCreationAttributes<Promoted>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 比赛id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare match_id: number

    /**
     * 来源类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare source_type: string

    /**
     * 来源id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare source_id: number

    /**
     * 推荐频道
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare channel: string

    /**
     * 是否为有效推荐
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare is_valid: ToggleVal

    /**
     * 推荐无效的原因
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare skip: CreationOptional<string>

    /**
     * 周标记
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare week_day: number

    /**
     * 周序号
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare week_id: CreationOptional<number>

    /**
     * 投注类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare variety: Variety

    /**
     * 比赛时段
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare period: Period

    /**
     * 投注方向
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: OddType

    /**
     * 投注方向类型
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare odd_type: OddIdentity

    /**
     * 盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    declare condition: NumberVal

    /**
     * 推荐水位
     */
    @Column(DataType.DECIMAL)
    declare value: CreationOptional<NumberVal | null>

    /**
     * 胜负结果
     */
    @Column(DataType.TINYINT)
    declare result: CreationOptional<-1 | 0 | 1 | null>

    /**
     * 显示用的赛果
     */
    @Column(DataType.STRING)
    declare score: CreationOptional<string | null>

    /**
     * 主队赛果
     */
    @Column(DataType.TINYINT)
    declare score1: CreationOptional<number | null>

    /**
     * 客队赛果
     */
    @Column(DataType.TINYINT)
    declare score2: CreationOptional<number | null>

    /**
     * 扩展数据
     */
    @Column(DataType.JSON)
    declare extra: CreationOptional<any>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>
}
