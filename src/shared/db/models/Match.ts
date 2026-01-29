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
    @Column(DataType.STRING)
    declare crown_match_id: string

    /**
     * 比赛时间
     */

    @Column(DataType.DATE)
    declare match_time: Date

    /**
     * 球探网比赛id
     */

    @Column(DataType.STRING)
    declare titan007_match_id: CreationOptional<string>

    /**
     * 球探网主客队交换
     */

    @Column(DataType.TINYINT)
    declare titan007_swap: CreationOptional<ToggleVal>

    /**
     * 赛事id
     */
    @ForeignKey(() => Tournament)
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

    @Column(DataType.STRING)
    declare status: CreationOptional<MatchStatus>

    /**
     * 是否已有完场赛果
     */

    @Column(DataType.TINYINT)
    declare has_score: CreationOptional<ToggleVal>

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

    @Column(DataType.TINYINT)
    declare has_score_period1: CreationOptional<ToggleVal>

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

    @Column(DataType.STRING)
    declare error_status: CreationOptional<MatchErrorStatus>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>

    /**
     * 允许Bmiss投注
     */

    @Column(DataType.TINYINT)
    declare bmiss_bet_enable: CreationOptional<ToggleVal>
}
