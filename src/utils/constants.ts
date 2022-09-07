/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5f1dddbf348ac2fbe22a163e30f99f9ece3dd50a'

export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
export const PRICING_POOL = '0x81e2f9ed2b784b978050b7085c36e662458dd225'

export const STABLE_COINS_STR = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1,0x7f5c764cbc14f9669b88837ca1490cca17c31607,0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'
export const WHITELIST_TOKENS_STR = '0x4200000000000000000000000000000000000042'
const MINIMUM_ETH_LOCKED_CONFIG = '0.5'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
