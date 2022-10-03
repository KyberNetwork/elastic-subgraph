/* eslint-disable prefer-const */
import {
  // Collect,
  AddLiquidity,
  RemoveLiquidity,
  AntiSnipAttackPositionManager,
  Transfer,
  MintPosition
} from '../types/AntiSnipAttackPositionManager/AntiSnipAttackPositionManager'
import { Position, PositionSnapshot, Pool, ContractEvent } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ZERO_BI, ONE_BI } from '../utils/constants'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { loadTransaction } from '../utils'

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

      let pool = Pool.load(poolAddress.toHexString())
      pool.positionCount = pool.positionCount.plus(ONE_BI)
      pool.save()

      position.token0 = positionResult.value1.token0.toHexString()
      position.token1 = positionResult.value1.token1.toHexString()
      position.tickLower = position.pool.concat('#').concat(BigInt.fromI32(positionResult.value0.tickLower).toString())
      position.tickUpper = position.pool.concat('#').concat(BigInt.fromI32(positionResult.value0.tickUpper).toString())
      position.liquidity = ZERO_BI
      position.transaction = loadTransaction(event).id
      position.feeGrowthInsideLast = positionResult.value0.feeGrowthInsideLast
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
  positionSnapshot.transaction = loadTransaction(event).id
  positionSnapshot.feeGrowthInsideLast = position.feeGrowthInsideLast
  positionSnapshot.save()
}

export function handleMintPosition(event: MintPosition): void {
  let position = getPosition(event, event.params.tokenId)

  if (position == null) {
    return
  }

  position.liquidity = position.liquidity.plus(event.params.liquidity)

  updateFeeVars(position!, event, event.params.tokenId)

  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "MintPosition"
  ev.transaction= event.transaction.hash.toHex()
  ev.save()
  position.save()

  savePositionSnapshot(position!, event)
}

export function handleIncreaseLiquidity(event: AddLiquidity): void {
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  position.liquidity = position.liquidity.plus(event.params.liquidity)

  updateFeeVars(position!, event, event.params.tokenId)

  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "IncreaseLiquidity"
  ev.transaction= event.transaction.hash.toHex()
  ev.save()
  position.save()

  savePositionSnapshot(position!, event)
}

export function handleDecreaseLiquidity(event: RemoveLiquidity): void {
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  position.liquidity = position.liquidity.minus(event.params.liquidity)

  let pool = Pool.load(position.pool)
  if (position.liquidity.equals(ZERO_BI)) {
    pool.closedPostionCount = pool.closedPostionCount.plus(ONE_BI)
    pool.save()
  }
  position = updateFeeVars(position!, event, event.params.tokenId)
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "DecreaseLiquidity"
  ev.transaction= event.transaction.hash.toHex()
  ev.save()
  position.save()

  savePositionSnapshot(position!, event)
}

export function handleTransfer(event: Transfer): void {
  let position = getPosition(event, event.params.tokenId)

  // position was not able to be fetched
  if (position == null) {
    return
  }

  position.owner = event.params.to
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Transfer"
  ev.transaction= event.transaction.hash.toHex()
  ev.save()
  position.save()

  savePositionSnapshot(position!, event)
}
