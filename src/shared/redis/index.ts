import { config } from '@config'
import { omit } from 'lodash'
import { Pool } from './pool'

/**
 * Redis连接池
 */
export const redis = new Pool(omit(config('redis'), 'pool'), config('redis.pool'))
