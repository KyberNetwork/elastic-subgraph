/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5f1dddbf348ac2fbe22a163e30f99f9ece3dd50a'

export const WETH_ADDRESS = '0xc579d1f3cf86749e05cd06f7ade17856c2ce3126'
export const PRICING_POOL = '0xfd60d3cf6863633d960cc919a19063965733f005'

export const STABLE_COINS_STR = '0xe2c120f188ebd5389f71cf4d9c16d05b62a58993,0x01445c31581c354b7338ac35693ab2001b50b9ae,0xc111c29a988ae0c0087d97b33c6e6766808a3bd3'
export const WHITELIST_TOKENS_STR = '0x85219708c49aa701871ad330a94ea0f41dff24ca'
const MINIMUM_ETH_LOCKED_CONFIG = '0'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
