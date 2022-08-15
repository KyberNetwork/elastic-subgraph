/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x5f1dddbf348ac2fbe22a163e30f99f9ece3dd50a'

export const WETH_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
export const PRICING_POOL = '0x835044e5b9e54c7756f07c6607c86c4697fc9ba4'

export const STABLE_COINS_STR = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063,0x2791bca1f2de4661ed88a30c99a7a9449aa84174,0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
export const WHITELIST_TOKENS_STR = '0x1c954e8fe737f99f68fa1ccda3e51ebdb291948c,0x7ceb23fd6bc0add59e62ac25578270cff1b9f619,0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b'
const MINIMUM_ETH_LOCKED_CONFIG = '500'

export let MINIMUM_ETH_LOCKED = BigDecimal.fromString(MINIMUM_ETH_LOCKED_CONFIG)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
