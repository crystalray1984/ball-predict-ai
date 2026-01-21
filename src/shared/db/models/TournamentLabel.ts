import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AllowNull,
    AutoIncrement,
    Column,
    DataType,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import { Tournament } from './Tournament'

/**
 * 赛事标签表
 */
@Table({ tableName: 'tournament_label', timestamps: false })
export class TournamentLabel extends Model<
    InferAttributes<TournamentLabel>,
    InferCreationAttributes<TournamentLabel>
> {
    /**
     * 标签id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 标题
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare title: string

    /**
     * 要推送的Luffa目标id
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare luffa_uid: CreationOptional<string>

    /**
     * 要推送的Luffa目标类型
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare luffa_type: CreationOptional<LuffaType>

    @HasMany(() => Tournament)
    declare tournaments: CreationOptional<Tournament[]>
}
