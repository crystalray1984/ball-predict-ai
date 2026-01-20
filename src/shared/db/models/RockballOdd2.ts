import { Table } from 'sequelize-typescript'
import { RockballOdd } from './RockballOdd'

/**
 * 滚球2盘口表
 */
@Table({ tableName: 'rockball_odd2', timestamps: false })
export class RockballOdd2 extends RockballOdd {}
