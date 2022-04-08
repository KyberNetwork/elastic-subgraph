/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x584bc3d0e4304e170a2b1347672911e93973d675'

export const WETH_ADDRESS = '0xc778417e063141139fce010982780140aa0cd5ab'
export const PRICING_POOL = '0x484f5242104d02e41cfacfe7d8f330e68a4a62df'

export const STABLE_COINS_STR = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735|0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b'
export const WHITELIST_TOKENS_STR = '0x01be23585060835e02b77ef475b0cc51aa1e0709|0x6f072ce36c65fd5a1f2534e5598e43b9d2fa7c77|0x07efdb214ee4260f3351e1048766fcd225e6e25e'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
