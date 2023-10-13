import { Deposit, ProposalEvent, SequencerEvent, Settlement, Stake, Unstake } from "../generated/Bridge/Bridge"
import { DepositSource, ProposalDestination, Pool, PoolDayData, ProposalDestinationGeneric } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

let POLYGON = BigInt.fromI32(1)
let BSC = BigInt.fromI32(2)
let AVALANCE = BigInt.fromI32(3)
let FANTOM = BigInt.fromI32(4)
let ARBITRUM = BigInt.fromI32(5)
let OPTIMISM = BigInt.fromI32(6)
let ETHEREUM = BigInt.fromI32(7)

let sourceChainId = POLYGON
const genericResourceID = "0x1111111111111111111111111111111111111111111111111111111111111111"
const sequencedResourceID = "0x2222222222222222222222222222222222222222222222222222222222222222";

export function handleDepositSource(event: Deposit): void {
    let uniqueId = sourceChainId.toString() + '-' + event.params.destinationChainID.toString() + '-' + event.params.depositNonce.toString()
    let depositSource = new DepositSource(uniqueId)
    depositSource.createdAt = event.block.timestamp
    depositSource.creationBlock = event.block.number
    depositSource.transactionHash = event.transaction.hash
    depositSource.sourceChainId = sourceChainId
    depositSource.destinationChainId = BigInt.fromI32(event.params.destinationChainID)
    depositSource.resourceId = event.params.resourceID.toHexString()
    depositSource.depositNonce = event.params.depositNonce
    depositSource.userAddress = event.transaction.from.toHexString()
    depositSource.widgetId = event.params.widgetID

    let implementationContract = event.transaction.to;
    if (implementationContract) {
        depositSource.implementationContract = implementationContract.toHexString()
    }
    if (event.params.resourceID.toHexString() == genericResourceID) {
        depositSource.isGeneric = true
    } else {
        depositSource.isGeneric = false
    }
    if (event.params.resourceID.toHexString() == sequencedResourceID) {
        depositSource.isSequenced = true;
    } else {
        depositSource.isSequenced = false;
    }
    depositSource.save()
}


export function handleSettelementDestination(event: Settlement): void {
    let uniqueId = event.params.originChainID.toString() + '-' + sourceChainId.toString() + '-' + event.params.depositNonce.toString()
    let proposalDestination = new ProposalDestination(uniqueId)
    proposalDestination.createdAt = event.block.timestamp
    proposalDestination.creationBlock = event.block.number
    proposalDestination.transactionHash = event.transaction.hash
    proposalDestination.sourceChainId = BigInt.fromI32(event.params.originChainID)
    proposalDestination.destinationChainId = sourceChainId
    proposalDestination.settlementToken = event.params.settlementToken.toHexString()
    proposalDestination.settlementAmount = event.params.settlementAmount
    proposalDestination.depositNonce = event.params.depositNonce
    proposalDestination.save()
}

export function handleProposalDestination(event: ProposalEvent): void {
    if (event.params.status === 3) {
        let uniqueId = event.params.originChainID.toString() + '-' + sourceChainId.toString() + '-' + event.params.depositNonce.toString()
        let proposalDestinationGeneric = new ProposalDestinationGeneric(uniqueId)
        proposalDestinationGeneric.createdAt = event.block.timestamp
        proposalDestinationGeneric.creationBlock = event.block.number
        proposalDestinationGeneric.transactionHash = event.transaction.hash
        proposalDestinationGeneric.sourceChainId = BigInt.fromI32(event.params.originChainID)
        proposalDestinationGeneric.destinationChainId = sourceChainId
        proposalDestinationGeneric.depositNonce = event.params.depositNonce
        proposalDestinationGeneric.save()
    }
}

export function handleSequencerDestination(event: SequencerEvent): void {
    if (event.params.status === 3) {
        let uniqueId = event.params.originChainID.toString() + '-' + sourceChainId.toString() + '-' + event.params.depositNonce.toString()
        let proposalDestinationGeneric = new ProposalDestinationGeneric(uniqueId)
        proposalDestinationGeneric.createdAt = event.block.timestamp
        proposalDestinationGeneric.creationBlock = event.block.number
        proposalDestinationGeneric.transactionHash = event.transaction.hash
        proposalDestinationGeneric.sourceChainId = BigInt.fromI32(event.params.originChainID)
        proposalDestinationGeneric.destinationChainId = sourceChainId
        proposalDestinationGeneric.depositNonce = event.params.depositNonce
        proposalDestinationGeneric.save()
    }
}

export function handleStake(event: Stake): void {
    let pool = Pool.load(event.params.pool.toHexString())
    if (pool === null) {
        pool = new Pool(event.params.pool.toHexString())
        pool.tvl = BigInt.fromI32(0)
    }
    pool.tvl = pool.tvl.plus(event.params.amount)
    pool.userAddress = event.params.staker.toHexString()
    pool.save()

    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let poolDayData = PoolDayData.load(dayID.toString())
    if (poolDayData === null) {
        poolDayData = new PoolDayData(dayID.toString())
    }
    poolDayData.date = dayStartTimestamp
    poolDayData.dayValueLocked = pool.tvl
    poolDayData.save()
}

export function handleUnstake(event: Unstake): void {
    let pool = Pool.load(event.params.pool.toHexString())
    if (pool === null) {
        pool = new Pool(event.params.pool.toHexString())
        pool.tvl = BigInt.fromI32(0)
    }
    pool.tvl = pool.tvl.minus(event.params.amount)
    pool.userAddress = event.params.unstaker.toHexString()
    pool.save()

    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let poolDayData = PoolDayData.load(dayID.toString())
    if (poolDayData === null) {
        poolDayData = new PoolDayData(dayID.toString())
    }
    poolDayData.date = dayStartTimestamp
    poolDayData.dayValueLocked = pool.tvl
    poolDayData.save()
}
