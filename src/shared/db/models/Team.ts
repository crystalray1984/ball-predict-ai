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
    @AllowNull(false)
    @Column(DataType.STRING)
    declare crown_team_id: string

    /**
     * 球探网球队id
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare titan007_team_id: CreationOptional<string>

    /**
     * 队伍名称
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare name: string

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
