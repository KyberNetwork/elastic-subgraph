/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '{{ factory_address }}'

export const WETH_ADDRESS = '{{ wrapped_native_address }}'
export const PRICING_POOL = '{{ pricing_pools }}'

export const STABLE_COINS_STR = '{{ stable_coins }}'
export const WHITELIST_TOKENS_STR = '{{ whitelist_tokens }}'
const MINIMUM_ETH_LOCKED_CONFIG = '{{ minimum_eth_locked }}'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
