import { assets, extrinsics } from "@polkadot/types/interfaces/definitions";
import { EventContext, StoreContext, SubstrateEvent } from "@subsquid/hydra-common";
import { LBPPool } from "../../generated/model";
import { LBP } from "../../types";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { buyDetails, sellDetails } from "../../utils/types";
import { createUserActionSell } from "../../utils/userActions";

export const getXykBuyExecutedParameters = (
    event: SubstrateEvent
) => {
    const [address, assetIn, assetOut, inAmount, outAmount, feeAsset, feeAmount ] =
        new LBP.SellExecutedEvent(event).params
        
    return {
        account: toBasiliskFormattedAddress(address),
        assetIn: assetIn.toBigInt(),
        assetOut: assetOut.toBigInt(),
        inAmount: inAmount.toBigInt(),
        outAmount: outAmount.toBigInt(),
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

    const sellDetails: sellDetails = {
        ...lbpBuyExecutedEvent,
        poolId: pool.id
    }

    if(!extrinsic) throw('Did not receive exrtinsic for lbp buy event')
    await createUserActionSell(sellDetails, extrinsic!, BigInt(event.blockNumber), store);
}

export default handleLbpBuyExecuted;