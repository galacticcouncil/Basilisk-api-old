import { assets, extrinsics } from "@polkadot/types/interfaces/definitions";
import { EventContext, StoreContext, SubstrateEvent } from "@subsquid/hydra-common";
import { LBPPool } from "../../generated/model";
import { LBP } from "../../types";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { buyDetails } from "../../utils/types";
import { createUserActionBuy } from "../../utils/userActions";

export const getXykBuyExecutedParameters = (
    event: SubstrateEvent
) => {
    const [address, assetOut, assetIn, outAmount, inAmount, feeAsset, feeAmount ] =
        new LBP.BuyExecutedEvent(event).params
        
    return {
        account: toBasiliskFormattedAddress(address),
        assetOut: assetOut.toBigInt(),
        assetIn: assetIn.toBigInt(),
        outAmount: outAmount.toBigInt(),
        inAmount: inAmount.toBigInt(),
        feeAsset: feeAsset.toBigInt(),
        feeAmount: feeAmount.toBigInt(),
    };
};

const handleLbpBuyExecuted = async ({
    event,
    extrinsic,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const lbpBuyExecutedEvent = getXykBuyExecutedParameters(event)
    const pool = await store.get(LBPPool, {
        where: {
            assetAId: lbpBuyExecutedEvent.assetOut,
            assetBId: lbpBuyExecutedEvent.assetIn
        }
    });
    if(!pool) throw(`Unable to fetch poolId for LBP buy trade`)

    const buyDetails: buyDetails = {
        ...lbpBuyExecutedEvent,
        poolId: pool.id
    }

    if(!extrinsic) throw('Did not receive exrtinsic for lbp buy event')
    await createUserActionBuy(buyDetails, extrinsic!, BigInt(event.blockNumber), store);
}

export default handleLbpBuyExecuted;