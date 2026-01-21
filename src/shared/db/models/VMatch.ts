import { InferAttributes } from 'sequelize'
import { Match } from './Match'
import { Column, DataType, Table } from 'sequelize-typescript'

/**
 * 比赛视图
 */
@Table({ tableName: 'v_match' })
export class VMatch extends Match<InferAttributes<VMatch>> {
    /**
     * 主队名称
     */
    @Column(DataType.STRING)
    declare team1_name: string

    /**
     * 主队球探网id
     */
    @Column(DataType.STRING)
    declare team1_titan007_id: string

    /**
     * 客队名称
     */
    @Column(DataType.STRING)
    declare team2_name: string

    /**
     * 客队球探网id
     */
    @Column(DataType.STRING)
    declare team2_titan007_id: string

    /**
     * 赛事名称
     */
    @Column(DataType.STRING)
    declare tournament_name: string

    /**
     * 赛事是否开启推荐
     */
    @Column(DataType.TINYINT)
    declare tournament_is_open: ToggleVal

    /**
     * 赛事是否开启滚球推荐
     */
    @Column(DataType.TINYINT)
    declare tournament_is_rockball_open: ToggleVal

    /**
     * 赛事标签id
     */
    @Column(DataType.INTEGER)
    declare tournament_label_id: number

    /**
     * 赛事标签名
     */
    @Column(DataType.STRING)
    declare tournament_label_title: string | null
}
