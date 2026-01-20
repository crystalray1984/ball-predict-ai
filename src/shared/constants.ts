/**
 * 用户信息在redis的缓存前缀
 */
export const CACHE_USER_KEY = 'user:'

/**
 * 用户信息缓存的过期时间
 */
export const CACHE_USER_EXPIRES = 3600

/**
 * 系统配置的Redis缓存键名
 */
export const CACHE_SETTING_KEY = 'settings'

/**
 * 用户基于自己的id进入的socket.io房间名前缀
 */
export const ROOM_USER_PREFIX = 'user:'

/**
 * 服务进程基于类型进入的socket.io房间名前缀
 */
export const ROOM_SERVICE_PREFIX = 'service:'
