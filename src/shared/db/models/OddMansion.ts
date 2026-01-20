import { Table } from 'sequelize-typescript'
import { Odd } from './Odd'

/**
 * mansion盘口表
 */
@Table({ tableName: 'odd_mansion', timestamps: false })
export class OddMansion extends Odd {}
