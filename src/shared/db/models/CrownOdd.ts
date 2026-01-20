import { OddIdentity, Period, Variety } from '@shared/enum'
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
 * 皇冠盘口追踪表
 */
@Table({ tableName: 'crown_account' })
export class CrownOdd extends Model<InferAttributes<CrownOdd>, InferCreationAttributes<CrownOdd>> {
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
     * 皇冠比赛id
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare crown_match_id: string

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
     * 投注标识
     */
    @AllowNull(false)
    @Column(DataType.STRING)
    declare type: OddIdentity

    /**
     * 盘口
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL(5, 2))
    declare condition: string | number

    /**
     * 上盘水位
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL(12, 6))
    declare value1: string | number

    /**
     * 下盘水位
     */
    @AllowNull(false)
    @Column(DataType.DECIMAL(12, 6))
    declare value2: string | number

    /**
     * 是否可以被忽略的数据
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare is_ignored: CreationOptional<0 | 1>

    /**
     * 作为推荐依据的数据标记 0-不参与推荐 1-推荐上盘 2-推荐下盘
     */
    @AllowNull(false)
    @Column(DataType.TINYINT)
    declare promote_flag: CreationOptional<0 | 1 | 2>

    @CreatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    @UpdatedAt
    @AllowNull(false)
    @Column(DataType.DATE)
    declare updated_at: CreationOptional<Date>
}
