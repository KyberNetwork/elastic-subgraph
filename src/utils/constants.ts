/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5f1dddbf348ac2fbe22a163e30f99f9ece3dd50a'

export const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const PRICING_POOL = '0x7d697d789ee19bc376474e0167bade9535a28cf4'

export const STABLE_COINS_STR = '0x6b175474e89094c44da98b954eedeac495271d0f,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,0xdac17f958d2ee523a2206206994597c13d831ec7'
export const WHITELIST_TOKENS_STR = '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202,0x5a98fcbea516cf06857215779fd812ca3bef1b32,0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0,0x514910771af9ca656af840dff83e8264ecf986ca'
const MINIMUM_ETH_LOCKED_CONFIG = '0.5'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
