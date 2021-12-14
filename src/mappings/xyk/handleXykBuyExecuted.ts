import { extrinsics } from "@polkadot/types/interfaces/definitions";
import { EventContext, StoreContext, SubstrateEvent } from "@subsquid/hydra-common";
import { XYK } from "../../types";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { xykBuyParameters } from "../../utils/types";
import { createXykBuyUserAction } from "../../utils/userActions";

export const getXykBuyExecutedParameters = (
    event: SubstrateEvent
): xykBuyParameters => {
    const [address, assetOut, assetIn, outAmount, buyPrice, feeAsset, feeAmount, poolId ] =
        new XYK.BuyExecutedEvent(event).params

    return {
        account: address.toString(),
        assetOut: assetOut.toBigInt(),
        assetIn: assetIn.toBigInt(),
        outAmount: outAmount.toBigInt(),
        buyPrice: buyPrice.toBigInt(),
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
    const xykBuyParameters = getXykBuyExecutedParameters(event)
        
    console.log('xyk buy executed called')
    if(!extrinsic) throw('Did not receive exrtinsic for xyk buy event')
    await createXykBuyUserAction(xykBuyParameters, extrinsic!, BigInt(event.blockNumber), store);
}

export default handleXykBuyExecuted;