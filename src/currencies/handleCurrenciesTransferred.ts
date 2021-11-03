import { Transfer } from "../generated/model";
import { Currencies } from "../types/Currencies";
import { ensure } from "../utils/ensure";
import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'

const handleCurrenciesTransferred = async ({ block, event, store, extrinsic }: EventContext & StoreContext): Promise<void> => {

    const currenciesTransferredEvent = new Currencies.TransferredEvent(event)
    const [ 
        currency, 
        from, 
        to, 
        balance 
    ] = currenciesTransferredEvent.params;
    console.log(`currencies.Transferred`)
    console.log(`method ${event.extrinsic?.method}`)
    console.log(`currencies transferred of currencyId ${currency} from ${from.toString().substring(0,5)} to ${to.toString().substring(0,5)} balance ${balance.toNumber()} `);
    const blockHeight = BigInt(block.height);
    // create transfer
    //const transferId = `${currenciesTransferredEvent.ctx.blockNumber} + ${currenciesTransferredEvent.ctx.indexInBlock}`
    // const transfer = new Transfer({
    //     id: "1",
    //     currencyId: currency,
    //     from: from.toString(),
    //     to: to.toString(),
    //     balance,
    //     blockHeight
    // })
    // // save transfer
    // await store.save(transfer);
};

// const updateTransfer = async (
//     store: DatabaseManager,
//     transferId: string,
//     transfer: Transfer
// ) => {
    
   
//     await store.save(transfer);
// }

// /**
//  * Find or create a transfer based on the transferId (=blockHeight + indexInBlock)
//  */
//  const ensureTransfer = async (
//     store: DatabaseManager,
//     transferId: string,
// ): Promise<Transfer> => {
//     const account = await ensure<Transfer>(store, Transfer, transferId, {
//         transferId,
//         // if we see the transfer for the first time, we assume
//         contributions: [],
//         totalContributed: new BN(0)
//     });

//     // persist the account
//     await store.save(account);
//     return account;
// }

export default handleCurrenciesTransferred;