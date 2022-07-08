/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5f1dddbf348ac2fbe22a163e30f99f9ece3dd50a'

export const WETH_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
export const PRICING_POOL = '0xd72e3f5810bab2ffd44b0a1304711a845ce5f1e8'

export const STABLE_COINS_STR = '0xe9e7cea3dedca5984780bafc599bd69add087d56,0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d,0x55d398326f99059ff775485246999027b3197955,0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'
export const WHITELIST_TOKENS_STR = '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b,0x2170ed0880ac9a755fd29b2688956bd959f933f8'
const MINIMUM_ETH_LOCKED_CONFIG = '0'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
