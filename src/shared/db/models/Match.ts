import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    HasOne,
    Model,
    PrimaryKey,
    Table,
    Unique,
    UpdatedAt,
} from 'sequelize-typescript'
import { Team } from './Team'
import { Tournament } from './Tournament'

/**
 * 比赛表
 */
@Table({ tableName: 'match' })
export class Match<TAttributes extends {} = {}> extends Model<
    InferAttributes<Match> & TAttributes,
    InferCreationAttributes<Match>
> {
    /**
     * 比赛id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 皇冠比赛id
     */
    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(50))
    declare crown_match_id: string

    /**
     * 球探网比赛id
     */
    @AllowNull(false)
    @Column(DataType.STRING(50))
    declare titan007_match_id: CreationOptional<string>

    /**
     * 球探网主客队交换
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare titan007_swap: CreationOptional<0 | 1>

    /**
     * 赛事id
     */
    @ForeignKey(() => Tournament)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare tournament_id: number

    /**
     * 赛事
     */
    @BelongsTo(() => Tournament)
    declare tournament: CreationOptional<Tournament>

    /**
     * 主队id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare team1_id: number

    /**
     * 主队
     */
    @HasOne(() => Team, 'team1_id')
    declare team1: CreationOptional<Team>

    /**
     * 客队id
     */
    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare team2_id: number

    /**
     * 客队
     */
    @HasOne(() => Team, 'team2_id')
    declare team2: CreationOptional<Team>

    /**
     * 比赛状态
     */
    @AllowNull(false)
    @Column(DataType.STRING(50))
    declare status: CreationOptional<MatchStatus>

    /**
     * 是否已有完场赛果
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare has_score: CreationOptional<0 | 1>

    /**
     * 主队全场得分
     */
    @Column(DataType.TINYINT)
    declare score1: CreationOptional<number | null>

    /**
     * 客队全场得分
     */
    @Column(DataType.TINYINT)
    declare score2: CreationOptional<number | null>

    /**
     * 主队全场角球
     */
    @Column(DataType.TINYINT)
    declare corner1: CreationOptional<number | null>

    /**
     * 客队全场角球
     */
    @Column(DataType.TINYINT)
    declare corner2: CreationOptional<number | null>

    /**
     * 是否已有上半场赛果
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare has_score_period1: CreationOptional<0 | 1>

    /**
     * 主队上半场得分
     */
    @Column(DataType.TINYINT)
    declare score1_period1: CreationOptional<number | null>

    /**
     * 客队上半场得分
     */
    @Column(DataType.TINYINT)
    declare score2_period1: CreationOptional<number | null>

    /**
     * 主队上半场角球
     */
    @Column(DataType.TINYINT)
    declare corner1_period1: CreationOptional<number | null>

    /**
     * 客队上半场角球
     */
    @Column(DataType.TINYINT)
    declare corner2_period1: CreationOptional<number | null>

    /**
     * 比赛异常状态
     */
    @AllowNull(false)
    @Column(DataType.STRING(50))
    declare error_status: CreationOptional<MatchErrorStatus>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
