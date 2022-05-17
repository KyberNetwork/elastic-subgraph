/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x48f6d7dae56623dde5a0d56b283165cae1753d70'

export const WETH_ADDRESS = '0xc778417e063141139fce010982780140aa0cd5ab'
export const PRICING_POOL = '0x50669f3a2419368d6616579c11ecc9699399ced1'

export const STABLE_COINS_STR = '0xad6d458402f60fd3bd25163575031acdce07538d|0x068b43f7f2f2c6a662c36e201144ae45f7a1c040|0x65bd1f48f1dd07bb285a3715c588f75684128ace'
export const WHITELIST_TOKENS_STR = '0x8b4ddf9f13f382aff76d262f6c8c50e6d7961b94|0xcc2ba341cb4459b64c0a284abd7cd0d1fee4ee70|0x2c059ab112eb6d4bdb6105742d560876a9fe0f54|0x13c8f670d3bbd4456870a2c49bb927f166a977bd'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
