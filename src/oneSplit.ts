import { Swap } from "../generated/OneSplit/OneSplit"
import { SameChainDeposit } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

let POLYGON = BigInt.fromI32(1);
let BSC = BigInt.fromI32(2);
let AVALANCE = BigInt.fromI32(3);
let FANTOM = BigInt.fromI32(4);
let ARBITRUM = BigInt.fromI32(5);
let OPTIMISM = BigInt.fromI32(6);
let ETHEREUM = BigInt.fromI32(7);
let HARMONY = BigInt.fromI32(8);
let AURORA = BigInt.fromI32(9);
let CRONOS = BigInt.fromI32(10);

const chainId = POLYGON;
const functionName = "0x0737df351723af410dd2b5309f41696eed0601b4c8006ec537e28323963ea9cc"; // keccak256(swapInSameChain)

export function handleSwap(event: Swap): void {
    let entity = SameChainDeposit.load(event.transaction.from.toHex());

    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if (!entity) {
      entity = new SameChainDeposit(event.transaction.from.toHex())
    }
  
    if (event.params.funcName.toHexString().toLowerCase() != functionName) {
      return;
    }
    
    entity.id = event.transaction.hash.toHexString();
    entity.createdAt = event.block.timestamp;
    entity.creationBlock = event.block.number;
    entity.chainId = chainId;
    entity.depositorAddress = event.params.sender.toHexString();
    entity.recipientAddress = event.params.receiver.toHexString();
    entity.depositedAmount = event.params.amount.toString();
    entity.receivedAmount = event.params.finalAmt.toString();
    entity.widgetId = event.params.widgetID;
    const tokenPathLength = event.params.tokenPath.length;
    entity.depositedTokenAddress = event.params.tokenPath[0].toHexString();
    entity.receivedTokenAddress = event.params.tokenPath[tokenPathLength-1].toHexString();
    entity.save();
}
  