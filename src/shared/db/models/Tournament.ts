import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    Unique,
    UpdatedAt,
} from 'sequelize-typescript'
import { TournamentLabel } from './TournamentLabel'

/**
 * 赛事表
 */
@Table({ tableName: 'tournament' })
export class Tournament extends Model<
    InferAttributes<Tournament>,
    InferCreationAttributes<Tournament>
> {
    /**
     * 联赛id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 皇冠赛事id
     */
    @Unique
    @Column(DataType.STRING)
    declare crown_tournament_id: string

    /**
     * 赛事名称
     */

    @Column(DataType.STRING)
    declare name: string

    /**
     * 是否开启推荐
     */

    @Column(DataType.TINYINT)
    declare is_open: CreationOptional<number>

    /**
     * 是否开启滚球推荐
     */

    @Column(DataType.TINYINT)
    declare is_rockball_open: CreationOptional<number>

    /**
     * 赛事标签id
     */
    @ForeignKey(() => TournamentLabel)
    @Column(DataType.INTEGER)
    declare label_id: CreationOptional<number>

    /**
     * 赛事
     */
    @BelongsTo(() => TournamentLabel)
    declare label: CreationOptional<TournamentLabel | undefined>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
