/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5f1dddbf348ac2fbe22a163e30f99f9ece3dd50a'

export const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
export const PRICING_POOL = '0xc7ff48e5a7e6a14bc4d7dca1c3e4b38321121d0b'

export const STABLE_COINS_STR = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1,0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
export const WHITELIST_TOKENS_STR = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const MINIMUM_ETH_LOCKED_CONFIG = '0.5'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
