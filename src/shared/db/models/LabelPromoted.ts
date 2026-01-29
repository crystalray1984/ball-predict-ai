import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import { TournamentLabel } from './TournamentLabel'

/**
 * 赛事按标签推荐表
 */
@Table({ tableName: 'crown_account', timestamps: false })
export class LabelPromoted extends Model<
    InferAttributes<LabelPromoted>,
    InferCreationAttributes<LabelPromoted>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 原始推荐id
     */

    @Column(DataType.INTEGER)
    declare promote_id: number

    /**
     * 标签id
     */
    @ForeignKey(() => TournamentLabel)
    @Column(DataType.INTEGER)
    declare label_id: number

    /**
     * 赛事标签
     */
    @BelongsTo(() => TournamentLabel)
    declare tournament_label: CreationOptional<TournamentLabel>

    /**
     * 周标记
     */

    @Column(DataType.INTEGER)
    declare week_day: number

    /**
     * 周序号
     */

    @Column(DataType.INTEGER)
    declare week_id: CreationOptional<number>
}
