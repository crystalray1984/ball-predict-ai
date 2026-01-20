import { InferAttributes } from 'sequelize'
import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

/**
 * 用户标记的推荐数据表
 */
@Table({ tableName: 'user_marked', timestamps: false })
export class UserMarked extends Model<InferAttributes<UserMarked>> {
    /**
     * 用户id
     */
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare user_id: number

    /**
     * 推荐id
     */
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare promote_id: number
}
