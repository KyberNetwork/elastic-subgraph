import { RewardContractAdded } from '../types/KyberRewardLocker/KyberRewardLocker'
import {
  AddPool,
  RenewPool,
  Join,
  Exit,
  KyberFairLaunch as KyberFairLaunchContract
} from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { KyberFairLaunch, JoinedPosition, FarmingPool, Token } from '../types/schema'
import { KyberFairLaunch as KyberFairLaunchTemplate } from '../types/templates'
import { ZERO_BI, ADDRESS_ZERO, WETH_ADDRESS, ZERO_BD } from '../utils/constants'
import { BigInt, log, Address } from '@graphprotocol/graph-ts'
import { fetchTokenSymbol, fetchTokenName, fetchTokenTotalSupply, fetchTokenDecimals } from '../utils/token'

function getToken(item: Address): string {
  if (item.toHexString() == ADDRESS_ZERO) return WETH_ADDRESS

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
  let fairLaunch = KyberFairLaunch.load(event.params.rewardContract.toHex())
  if (fairLaunch !== null) {
    return
  }

  KyberFairLaunchTemplate.create(event.params.rewardContract)
  //init reward contract
  fairLaunch = new KyberFairLaunch(event.params.rewardContract.toHex())
  fairLaunch.save()

  // get pool
  let fairLaunchContract = KyberFairLaunchContract.bind(event.params.rewardContract)
  let len = fairLaunchContract.try_poolLength()

  if (len.reverted) {
    return
  }

  for (let i: i32 = 0; i < len.value.toI32(); i++) {
    let poolInfo = fairLaunchContract.getPoolInfo(BigInt.fromI32(i))
    let farmingPool = new FarmingPool(event.params.rewardContract.toHexString() + '_' + i.toString())
    farmingPool.pid = i.toString()
    farmingPool.startTime = poolInfo.value1
    farmingPool.endTime = poolInfo.value2
    farmingPool.feeTarget = poolInfo.value5
    farmingPool.vestingDuration = poolInfo.value3
    farmingPool.pool = poolInfo.value0.toHexString()
    farmingPool.fairLaunch = event.address.toHexString()
    farmingPool.rewardTokens = poolInfo.value7.map<string>(item => {
      return getToken(item)
    })

    farmingPool.totalRewardAmounts = poolInfo.value8
    farmingPool.save()
  }
}

export function handleAddPool(event: AddPool): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let len = fairLaunchContract.poolLength()
  let pid = len.minus(BigInt.fromI32(1))
  let poolInfo = fairLaunchContract.getPoolInfo(len.minus(BigInt.fromI32(1)))
  let farmingPool = new FarmingPool(event.address.toHexString() + '_' + pid.toString())
  farmingPool.pid = pid.toString()
  farmingPool.startTime = event.params.startTime
  farmingPool.endTime = event.params.endTime
  farmingPool.feeTarget = event.params.feeTarget
  farmingPool.vestingDuration = event.params.vestingDuration
  farmingPool.pool = poolInfo.value0.toHexString()
  farmingPool.fairLaunch = event.address.toHexString()
  farmingPool.rewardTokens = poolInfo.value7.map<string>(item => getToken(item))
  farmingPool.totalRewardAmounts = poolInfo.value8
  farmingPool.save()
}

export function handleRenewPool(event: RenewPool): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let farmingPool = FarmingPool.load(event.address.toHexString() + '_' + event.params.pid.toString())

  if (farmingPool === null) {
    farmingPool = new FarmingPool(event.address.toHexString() + '_' + event.params.pid.toString())
  }
  let poolInfo = fairLaunchContract.getPoolInfo(event.params.pid)
  farmingPool.pid = event.params.pid.toString()
  farmingPool.startTime = event.params.startTime
  farmingPool.endTime = event.params.endTime
  farmingPool.feeTarget = event.params.feeTarget
  farmingPool.vestingDuration = event.params.vestingDuration
  farmingPool.pool = poolInfo.value0.toHexString()
  farmingPool.fairLaunch = event.address.toHexString()
  farmingPool.rewardTokens = poolInfo.value7.map<string>(item => getToken(item))

  farmingPool.totalRewardAmounts = poolInfo.value8
  farmingPool.save()
}

export function handleJoin(event: Join): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let poolInfo = fairLaunchContract.getPoolInfo(event.params.pId)

  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    joinedPosition = new JoinedPosition(
      event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
    )
  }

  joinedPosition.pid = event.params.pId
  joinedPosition.nftId = event.params.nftId
  joinedPosition.liquidity = event.params.liq
  joinedPosition.pool = poolInfo.value0.toHexString()
  joinedPosition.position = event.params.nftId.toString()
  joinedPosition.fairLaunch = event.address.toHexString()

  joinedPosition.save()
}

export function handleExit(event: Exit): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.pId.toString()
  )

  if (joinedPosition === null) {
    return
  }

  joinedPosition.liquidity = ZERO_BI
  joinedPosition.save()
}
