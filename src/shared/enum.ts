/**
 * Luffa用户类型
 */
export const enum LuffaType {
    /**
     * Luffa用户
     */
    user = 0,
    /**
     * Luffa群
     */
    group = 1,
}

/**
 * 用户登录的平台类型
 */
export const enum UserConnectPlatform {
    /**
     * 邮箱登录
     */
    email = 'email',
    /**
     * Luffa的UID登录
     */
    luffa = 'luffa',
}

/**
 * 客户端平台
 */
export const enum ClientPlatform {
    win32 = 'win32',
    darwin = 'darwin',
    ios = 'ios',
    android = 'android',
}

/**
 * 客户端架构
 */
export const enum ClientArch {
    x86 = 'x86',
    x64 = 'x64',
    arm = 'arm',
}

/**
 * 投注类别
 */
export const enum Variety {
    /**
     * 进球
     */
    goal = 'goal',
    /**
     * 角球
     */
    corner = 'corner',
}

/**
 * 比赛时段
 */
export const enum Period {
    /**
     * 全场
     */
    regularTime = 'regularTime',
    /**
     * 上半场
     */
    period1 = 'period1',
}

/**
 * 投注标识
 */
export const enum OddIdentity {
    /**
     * 让球盘
     */
    ah = 'ah',
    /**
     * 大小球盘
     */
    sum = 'sum',
}

/**
 * 投注类型
 */
export const enum OddType {
    ah1 = 'ah1',
    ah2 = 'ah2',
    under = 'under',
    over = 'over',
    draw = 'draw',
}

/**
 * 手动推荐类型
 */
export const enum ManualPromoteType {
    /**
     * 单场推荐
     */
    single = 'single',
    /**
     * 串场推荐
     */
    chain = 'chain',
}

/**
 * 盘口状态
 */
export const enum OddStatus {
    /**
     * 一次对比未通过
     */
    first_check_failed = '',
    /**
     * 一次对比成功
     */
    ready = 'ready',
}

/**
 * surebet盘口的来源类型
 */
export const enum OddNext {
    ready_check_after = 'ready_check_after',
}

/**
 * 订单类型
 */
export const enum OrderType {
    vip = 'vip',
}

/**
 * 订单状态
 */
export const enum OrderStatus {
    wait_pay = 'wait_pay',
    paid = 'paid',
}

/**
 * 滚球盘口状态
 */
export const enum RockballOddStatus {
    //正常状态
    normal = '',
    //已产生推荐
    promoted = 'promoted',
}

/**
 * 提现状态
 */
export const enum WithdrawalStatus {
    /**
     * 待处理
     */
    waiting = '',
}
