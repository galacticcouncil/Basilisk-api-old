import { EventContext, StoreContext, SubstrateEvent } from "@subsquid/hydra-common";
import { XYK } from "../../types";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { sellDetails } from "../../utils/types";
import { createUserActionSell } from "../../utils/userActions";

export const getActionDetailsFromXykSellExecutedEvent = (
    event: SubstrateEvent
): sellDetails => {
    const [address, assetIn, assetOut, inAmount, outAmount, feeAsset, feeAmount, poolId ] =
        new XYK.SellExecutedEvent(event).params

    return {
        account: toBasiliskFormattedAddress(address),
        assetIn: assetIn.toBigInt(),
        assetOut: assetOut.toBigInt(),
        inAmount: inAmount.toBigInt(),
        outAmount: outAmount.toBigInt(),
        feeAsset: feeAsset.toBigInt(),
        feeAmount: feeAmount.toBigInt(),
        poolId:  toBasiliskFormattedAddress(poolId)
    };
};

const handleXykSellExecuted = async ({
    event,
    extrinsic,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const sellDetails = getActionDetailsFromXykSellExecutedEvent(event)
        
    if(!extrinsic) throw('Did not receive exrtinsic for xyk buy event')
    await createUserActionSell(sellDetails, extrinsic!, BigInt(event.blockNumber), store);
}

export default handleXykSellExecuted;