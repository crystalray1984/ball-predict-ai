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
    Unique,
    UpdatedAt,
} from 'sequelize-typescript'

/**
 * 队伍表
 */
@Table({ tableName: 'team' })
export class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    /**
     * 球队id
     */
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    /**
     * 皇冠球队id
     */
    @Unique
    @Column(DataType.STRING)
    declare crown_team_id: string

    /**
     * 球探网球队id
     */

    @Column(DataType.STRING)
    declare titan007_team_id: CreationOptional<string>

    /**
     * 队伍名称
     */

    @Column(DataType.STRING)
    declare name: string

    /**
     * 多语言队伍名称
     */
    @Column(DataType.JSON)
    declare i18n_name: CreationOptional<Record<string, string> | null>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
