import { RewardContractAdded } from '../types/KyberRewardLocker/KyberRewardLocker'
import {
  AddPool,
  RenewPool,
  Join,
  Exit,
  KyberFairLaunch as KyberFairLaunchContract,
  SyncLiq,
  Withdraw,
  EmergencyWithdraw,
  Deposit
} from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { Farm, JoinedPosition, FarmingPool, Token, DepositedPosition, RewardToken,ContractEvent } from '../types/schema'
import { KyberFairLaunch as KyberFairLaunchTemplate } from '../types/templates'
import { ZERO_BI, ADDRESS_ZERO, WETH_ADDRESS, ZERO_BD } from '../utils/constants'
import { BigInt, log, Address, store } from '@graphprotocol/graph-ts'
import { fetchTokenSymbol, fetchTokenName, fetchTokenTotalSupply, fetchTokenDecimals } from '../utils/token'

function getToken(item: Address): string {
  if (item.toHexString() === ADDRESS_ZERO) return WETH_ADDRESS

  let token = Token.load(item.toHexString())
  if (token === null) {
    token = new Token(item.toHexString())
    token.symbol = fetchTokenSymbol(item)
    token.name = fetchTokenName(item)
    token.totalSupply = fetchTokenTotalSupply(item)
    let decimals = fetchTokenDecimals(item)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return item.toHexString()
    }

    token.decimals = decimals
    token.derivedETH = ZERO_BD
    token.volume = ZERO_BD
    token.volumeUSD = ZERO_BD
    token.feesUSD = ZERO_BD
    token.untrackedVolumeUSD = ZERO_BD
    token.totalValueLocked = ZERO_BD
    token.totalValueLockedUSD = ZERO_BD
    token.totalValueLockedUSDUntracked = ZERO_BD
    token.txCount = ZERO_BI
    token.poolCount = ZERO_BI
    token.whitelistPools = []
    token.save()
  }
  return token.id
}
export function handleRewardContractAdded(event: RewardContractAdded): void {
  let fairLaunch = Farm.load(event.params.rewardContract.toHex())
  if (fairLaunch !== null) {
    return
  }

  KyberFairLaunchTemplate.create(event.params.rewardContract)
  //init reward contract
  fairLaunch = new Farm(event.params.rewardContract.toHex())
  log.debug('locker: {}', [event.address.toHexString()])
  fairLaunch.rewardLocker = event.address.toHexString()
  fairLaunch.save()

  // get pool
  let fairLaunchContract = KyberFairLaunchContract.bind(event.params.rewardContract)
  let len = fairLaunchContract.try_poolLength()

  if (len.reverted) {
    return
  }

  // look back to get current farm
  for (let i: i32 = 0; i < len.value.toI32(); i++) {
    let poolInfo = fairLaunchContract.getPoolInfo(BigInt.fromI32(i))
    let farmingPool = new FarmingPool(event.params.rewardContract.toHexString() + '_' + i.toString())
    farmingPool.pid = BigInt.fromI32(i)
    farmingPool.startTime = poolInfo.value1
    farmingPool.endTime = poolInfo.value2
    farmingPool.feeTarget = poolInfo.value5
    farmingPool.vestingDuration = poolInfo.value3
    farmingPool.pool = poolInfo.value0.toHexString()
    farmingPool.farm = fairLaunch.id
    for (let i = 0; i < poolInfo.value7.length; i++) {
      let token = getToken(poolInfo.value7[i])
      let amount = poolInfo.value8[i]
      let rewardToken = new RewardToken(event.params.rewardContract.toHexString() + '_' + i.toString())
      rewardToken.token = token
      rewardToken.amount = amount
      rewardToken.farmingPool = farmingPool.id
      rewardToken.save()
    }
    let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
    ev.logIndex = event.logIndex
    ev.name = "RewardContractAdded"
    ev.transaction= event.transaction.hash.toHex()
    ev.address = event.address.toHexString()
    ev.extra = "{" + `"poolLength": ` + len.value.toString() + "," + `"farm":` +  event.params.rewardContract.toHex() + "}"
    ev.save()
    farmingPool.save()
  }
}

export function handleAddPool(event: AddPool): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let len = fairLaunchContract.poolLength()
  let pid = len.minus(BigInt.fromI32(1))
  let poolInfo = fairLaunchContract.getPoolInfo(len.minus(BigInt.fromI32(1)))
  let farmingPool = new FarmingPool(event.address.toHexString() + '_' + pid.toString())
  farmingPool.pid = pid
  farmingPool.startTime = event.params.startTime
  farmingPool.endTime = event.params.endTime
  farmingPool.feeTarget = event.params.feeTarget
  farmingPool.vestingDuration = event.params.vestingDuration
  farmingPool.pool = poolInfo.value0.toHexString()
  farmingPool.farm = event.address.toHexString()
  for (let i = 0; i < poolInfo.value7.length; i++) {
    let token = getToken(poolInfo.value7[i])
    let amount = poolInfo.value8[i]
    let rewardToken = new RewardToken(event.address.toHexString() + '_' + pid.toString())
    rewardToken.token = token
    rewardToken.amount = amount
    rewardToken.farmingPool = farmingPool.id
    rewardToken.save()
  }
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "AddPool"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" + `"pid": ` + pid.toString() + "}"
  ev.save()
  farmingPool.save()
}

export function handleRenewPool(event: RenewPool): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let farmingPool = FarmingPool.load(event.address.toHexString() + '_' + event.params.pid.toString())

  if (farmingPool === null) {
    farmingPool = new FarmingPool(event.address.toHexString() + '_' + event.params.pid.toString())
  }
  let poolInfo = fairLaunchContract.getPoolInfo(event.params.pid)
  farmingPool.pid = event.params.pid
  farmingPool.startTime = event.params.startTime
  farmingPool.endTime = event.params.endTime
  farmingPool.feeTarget = event.params.feeTarget
  farmingPool.vestingDuration = event.params.vestingDuration
  farmingPool.pool = poolInfo.value0.toHexString()
  farmingPool.farm = event.address.toHexString()

  for (let i = 0; i < poolInfo.value7.length; i++) {
    let token = getToken(poolInfo.value7[i])
    let amount = poolInfo.value8[i]
    let rewardToken = new RewardToken('reward' + '_' + event.address.toHexString() + '_' + event.params.pid.toString())
    rewardToken.token = token
    rewardToken.amount = amount
    rewardToken.farmingPool = farmingPool.id
    rewardToken.save()
  }
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "RenewPool"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" + `"pid": `+ farmingPool.pid.toString() + "}"
  ev.save()
  farmingPool.save()
}

export function handleJoin(event: Join): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    joinedPosition = new JoinedPosition(
      event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
    )
  }

  joinedPosition.user = event.transaction.from
  joinedPosition.pid = event.params.pId
  joinedPosition.liquidity = event.params.liq
  joinedPosition.farmingPool = event.address.toHexString() + '_' + event.params.pId.toString()
  joinedPosition.position = event.params.nftId.toString()

  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Join"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"pid":`+ event.params.pId.toString() + "," +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
  joinedPosition.save()
}

export function handleSync(event: SyncLiq): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    joinedPosition = new JoinedPosition(
      event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
    )
    joinedPosition.liquidity = ZERO_BI
  }

  joinedPosition.pid = event.params.pId
  joinedPosition.liquidity = event.params.liq.plus(joinedPosition.liquidity)
  joinedPosition.farmingPool = event.address.toHexString() + '_' + event.params.pId.toString()
  joinedPosition.position = event.params.nftId.toString()

  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Sync"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"pid":`+ event.params.pId.toString() + "," +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
  joinedPosition.save()
}

export function handleExit(event: Exit): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    return
  }


  let newLiq = joinedPosition.liquidity.minus(event.params.liq)
  if (newLiq.equals(ZERO_BI)) {
    store.remove('JoinedPosition', joinedPosition.id)
  } else {
    joinedPosition.liquidity = newLiq
    joinedPosition.save()
  }
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Exit"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"pid": `+ event.params.pId.toString() + "," +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
}

export function handleDeposit(event: Deposit): void {
  let depostedPosition = new DepositedPosition(event.params.nftId.toString())
  depostedPosition.user = event.params.sender
  depostedPosition.farm = event.address.toHexString()
  depostedPosition.position = event.params.nftId.toString()
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Deposit"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
  depostedPosition.save()
}

export function handleWithdraw(event: Withdraw): void {
  let depostedPosition = DepositedPosition.load(event.params.nftId.toString())
  if (depostedPosition) {
    store.remove('DepositedPosition', depostedPosition.id)
  }
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Withdraw"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  handleWithdraw(event as Withdraw)

  // TODO: remove joinedPositions when EmergencyWithdraw
  // let farm = Farm.load(event.address.toHexString())
  // farm.farmingPools.forEach(pool => {
  //   let joinedPositions = JoinedPosition.load(pool.toString() + '_' + event.params.nftId.toString())
  //   if (joinedPositions) {
  //     store.remove('JoinedPosition', pool.toString() + '_' + event.params.nftId.toString())
  //   }
  // })
}
