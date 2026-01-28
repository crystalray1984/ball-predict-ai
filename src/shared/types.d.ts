/**
 * 比赛状态
 */
declare type MatchStatus = '' | 'final'

/**
 * 比赛异常状态
 */
declare type MatchErrorStatus = '' | 'delayed'

/**
 * Luffa用户类型 0-用户 1-群组
 */
declare type LuffaType = 0 | 1

/**
 * 用户登录的平台类型
 */
declare type UserConnectPlatform = 'email' | 'luffa'

/**
 * 客户端平台类型
 */
declare type ClientPlatform = 'win32' | 'darwin' | 'ios' | 'android'

/**
 * 客户端架构
 */
declare type ClientArch = 'x64' | 'x86' | 'arm'

/**
 * 标识
 */
declare type Key = string | number

/**
 * 可以作为数值的值
 */
declare type NumberVal = string | number

/**
 * 作为开关的值
 */
declare type ToggleVal = 0 | 1

/**
 * 手动推荐类型
 */
declare type ManualPromoteType = 'single' | 'chain'

/**
 * 订单类型
 */
declare type OrderType = 'vip'

/**
 * 订单状态
 */
declare type OrderStatus = 'wait_pay' | 'paid'

/**
 * 盘口状态
 */
declare type OddStatus = '' | 'ready'

/**
 * 投注目标
 */
declare type Variety = 'corner' | 'goal'

/**
 * 比赛时段
 */
declare type Period = 'regularTime' | 'period1'

/**
 * 投注方向
 */
declare type OddType = 'ah1' | 'ah2' | 'over' | 'under' | 'draw' | 'win1' | 'win2'

/**
 * 投注方向类型
 */
declare type OddIdentity = 'ah' | 'sum' | 'win'

/**
 * 盘口的基本信息
 */
declare interface OddInfo {
    /**
     * 目标
     */
    variety: Variety
    /**
     * 时段
     */
    period: Period
    /**
     * 投注方向
     */
    type: OddType
    /**
     * 盘口
     */
    condition: NumberVal
}

/**
 * 滚球盘口配置
 */
declare interface RockballOddInfo extends OddInfo {
    id: Key
    /**
     * 水位条件
     */
    value: NumberVal
    /**
     * 是否禁用该盘口
     */
    disabled?: boolean
}

/**
 * 滚球配置项
 */
declare interface RockballConfig extends OddInfo {
    /**
     * 盘口上限
     */
    condition2?: NumberVal

    /**
     * 水位条件
     */
    value: NumberVal

    /**
     * 需要监听的滚球盘口
     */
    odds: RockballOddInfo[]
}

/**
 * 滚球盘口状态
 */
declare type RockballOddStatus = '' | 'promoted'

/**
 * 提现状态
 */
declare type WithdrawalStatus = '' | 'success' | 'fail'

/**
 * Bmiss小程序参数定义
 */
declare interface BmissMiniapp {
    appid: string
    app_secret: string
    api_url: string
}
