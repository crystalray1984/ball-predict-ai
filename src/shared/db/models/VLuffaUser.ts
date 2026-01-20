import { InferAttributes } from 'sequelize'
import { User } from './User'
import { Column, DataType, Table } from 'sequelize-typescript'

/**
 * Luffa用户表
 */
@Table({ tableName: 'v_luffa_user', paranoid: true })
export class VLuffaUser extends User<InferAttributes<VLuffaUser>> {
    /**
     * Luffa UID
     */
    @Column(DataType.STRING)
    declare uid: string
}
