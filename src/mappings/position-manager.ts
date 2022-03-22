/* eslint-disable prefer-const */
import {
  // Collect,
  AddLiquidity,
  RemoveLiquidity,
  AntiSnipAttackPositionManager,
  Transfer
} from '../types/AntiSnipAttackPositionManager/AntiSnipAttackPositionManager'
import { Bundle, Position, PositionSnapshot, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ZERO_BD, ZERO_BI } from '../utils/constants'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal, loadTransaction } from '../utils'

function getPosition(event: ethereum.Event, tokenId: BigInt): Position | null {
  let position = Position.load(tokenId.toString())
  if (position === null) {
    let contract = AntiSnipAttackPositionManager.bind(event.address)
    let positionCall = contract.try_positions(tokenId)

    // the following call reverts in situations where the position is minted
    // and deleted in the same block - from my investigation this happens
    // in calls from  BancorSwap
    // (e.g. 0xf7867fa19aa65298fadb8d4f72d0daed5e836f3ba01f0b9b9631cdc6c36bed40)
    if (!positionCall.reverted) {
      let positionResult = positionCall.value
      let poolAddress = factoryContract.getPool(
        positionResult.value1.token0,
        positionResult.value1.token1,
        positionResult.value1.fee
      )

      position = new Position(tokenId.toString())
      // The owner gets correctly updated in the Transfer handler
      position.owner = Address.fromString(ADDRESS_ZERO)
      position.pool = poolAddress.toHexString()
      position.token0 = positionResult.value1.token0.toHexString()
      position.token1 = positionResult.value1.token1.toHexString()
      position.tickLower = position.pool.concat('#').concat(BigInt.fromI32(positionResult.value0.tickLower).toString())
      position.tickUpper = position.pool.concat('#').concat(BigInt.fromI32(positionResult.value0.tickUpper).toString())
      position.liquidity = ZERO_BI
      position.depositedToken0 = ZERO_BD
      position.depositedToken1 = ZERO_BD
      position.withdrawnToken0 = ZERO_BD
      position.withdrawnToken1 = ZERO_BD
      position.collectedFeesToken0 = ZERO_BD
      position.collectedFeesToken1 = ZERO_BD
      position.transaction = loadTransaction(event).id
      position.feeGrowthInsideLast = positionResult.value0.feeGrowthInsideLast

      position.amountDepositedUSD = ZERO_BD
      position.amountWithdrawnUSD = ZERO_BD
      position.amountCollectedUSD = ZERO_BD
    }
  }

  return position
}

function updateFeeVars(position: Position, event: ethereum.Event, tokenId: BigInt): Position {
  let positionManagerContract = AntiSnipAttackPositionManager.bind(event.address)
  let positionResult = positionManagerContract.try_positions(tokenId)
  if (!positionResult.reverted) {
    position.feeGrowthInsideLast = positionResult.value.value0.feeGrowthInsideLast
  }
  return position
}

function savePositionSnapshot(position: Position, event: ethereum.Event): void {
  let positionSnapshot = new PositionSnapshot(position.id.concat('#').concat(event.block.number.toString()))
  positionSnapshot.owner = position.owner
  positionSnapshot.pool = position.pool
  positionSnapshot.position = position.id
  positionSnapshot.blockNumber = event.block.number
  positionSnapshot.timestamp = event.block.timestamp
  positionSnapshot.liquidity = position.liquidity
  positionSnapshot.depositedToken0 = position.depositedToken0
  positionSnapshot.depositedToken1 = position.depositedToken1
  positionSnapshot.withdrawnToken0 = position.withdrawnToken0
  positionSnapshot.withdrawnToken1 = position.withdrawnToken1
  positionSnapshot.collectedFeesToken0 = position.collectedFeesToken0
  positionSnapshot.collectedFeesToken1 = position.collectedFeesToken1
  positionSnapshot.transaction = loadTransaction(event).id
  positionSnapshot.feeGrowthInsideLast = position.feeGrowthInsideLast
  positionSnapshot.save()
}

export function handleIncreaseLiquidity(event: AddLiquidity): void {
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  // temp fix
  if (Address.fromString(position.pool).equals(Address.fromHexString('0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248'))) {
    return
  }
  let bundle = Bundle.load('1')

  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

  position.liquidity = position.liquidity.plus(event.params.liquidity)
  position.depositedToken0 = position.depositedToken0.plus(amount0)
  position.depositedToken1 = position.depositedToken1.plus(amount1)

  let newDepositUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)))
  position.amountDepositedUSD = position.amountDepositedUSD.plus(newDepositUSD)

  updateFeeVars(position!, event, event.params.tokenId)

  position.save()

  savePositionSnapshot(position!, event)
}

export function handleDecreaseLiquidity(event: RemoveLiquidity): void {
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  // temp fix
  if (Address.fromString(position.pool).equals(Address.fromHexString('0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248'))) {
    return
  }

  let bundle = Bundle.load('1')
  let token0 = Token.load(position.token0)
  let token1 = Token.load(position.token1)
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

  position.liquidity = position.liquidity.minus(event.params.liquidity)
  position.withdrawnToken0 = position.withdrawnToken0.plus(amount0)
  position.withdrawnToken1 = position.withdrawnToken1.plus(amount1)

  let newWithdrawUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)))
  position.amountWithdrawnUSD = position.amountWithdrawnUSD.plus(newWithdrawUSD)

  position = updateFeeVars(position!, event, event.params.tokenId)
  position.save()
  savePositionSnapshot(position!, event)
}

// export function handleCollect(event: Collect): void {
//   let position = getPosition(event, event.params.tokenId)
//   // position was not able to be fetched
//   if (position == null) {
//     return
//   }
//   if (Address.fromString(position.pool).equals(Address.fromHexString('0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248'))) {
//     return
//   }

//   let bundle = Bundle.load('1')
//   let token0 = Token.load(position.token0)
//   let token1 = Token.load(position.token1)
//   let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
//   let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)
//   position.collectedToken0 = position.collectedToken0.plus(amount0)
//   position.collectedToken1 = position.collectedToken1.plus(amount1)

//   position.collectedFeesToken0 = position.collectedToken0.minus(position.withdrawnToken0)
//   position.collectedFeesToken1 = position.collectedToken1.minus(position.withdrawnToken1)

//   let newCollectUSD = amount0
//     .times(token0.derivedETH.times(bundle.ethPriceUSD))
//     .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)))
//   position.amountCollectedUSD = position.amountCollectedUSD.plus(newCollectUSD)

//   position = updateFeeVars(position!, event, event.params.tokenId)
//   position.save()
//   savePositionSnapshot(position!, event)
// }

export function handleTransfer(event: Transfer): void {
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  position.owner = event.params.to
  position.save()

  savePositionSnapshot(position!, event)
}
