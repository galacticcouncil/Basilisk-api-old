import { extrinsics } from "@polkadot/types/interfaces/definitions";
import { EventContext, StoreContext, SubstrateEvent } from "@subsquid/hydra-common";
import { XYK } from "../../types";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { buyDetails } from "../../utils/types";
import { createUserActionBuy } from "../../utils/userActions";

export const getActionDetailsFromXykBuyExecutedEvent = (
    event: SubstrateEvent
): buyDetails => {
    const [address, assetOut, assetIn, outAmount, inAmount, feeAsset, feeAmount, poolId ] =
        new XYK.BuyExecutedEvent(event).params

    return {
        account: toBasiliskFormattedAddress(address),
        assetOut: assetOut.toBigInt(),
        assetIn: assetIn.toBigInt(),
        outAmount: outAmount.toBigInt(),
        inAmount: inAmount.toBigInt(),
        feeAsset: feeAsset.toBigInt(),
        feeAmount: feeAmount.toBigInt(),
        poolId:  toBasiliskFormattedAddress(poolId)
    };
};

const handleXykBuyExecuted = async ({
    event,
    extrinsic,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const buyDetails = getActionDetailsFromXykBuyExecutedEvent(event)
        
    if(!extrinsic) throw('Did not receive exrtinsic for xyk buy event')
    await createUserActionBuy(buyDetails, extrinsic!, BigInt(event.blockNumber), store);
}

export default handleXykBuyExecuted;
