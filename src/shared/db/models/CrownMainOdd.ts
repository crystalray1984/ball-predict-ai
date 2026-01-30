import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript'
import { VMatch } from './VMatch'

/**
 * Bmiss投注用的皇冠主盘表
 */
@Table({ tableName: 'crown_main_odd', updatedAt: false })
export class CrownMainOdd extends Model<
    InferAttributes<CrownMainOdd>,
    InferCreationAttributes<CrownMainOdd>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>

    @Column(DataType.INTEGER)
    declare match_id: number

    @BelongsTo(() => VMatch, 'match_id')
    declare match: CreationOptional<VMatch>

    @Column(DataType.STRING)
    declare base: OddIdentity

    @Column(DataType.TINYINT)
    declare is_active: ToggleVal

    @Column(DataType.STRING)
    declare hash: string

    @Column(DataType.DECIMAL)
    declare condition: NumberVal

    @Column(DataType.DECIMAL)
    declare value1: NumberVal

    @Column(DataType.DECIMAL)
    declare value2: NumberVal

    @Column(DataType.DECIMAL)
    declare value0: CreationOptional<NumberVal>

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: CreationOptional<Date>

    /**
     * 自定义格式化方法
     */
    public toJSON(): object {
        const obj = this.get()
        if ('condition' in obj) {
            obj.condition = Number(obj.condition)
        }
        if ('value1' in obj) {
            obj.value1 = Number(obj.value1)
        }
        if ('value2' in obj) {
            obj.value2 = Number(obj.value2)
        }
        if ('value0' in obj) {
            obj.value0 = Number(obj.value0)
        }
        return obj
    }
}
