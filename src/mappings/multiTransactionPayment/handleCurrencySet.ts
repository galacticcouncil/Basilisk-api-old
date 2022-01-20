import { EventContext, StoreContext, SubstrateEvent } from "@subsquid/hydra-common";
import { MultiTransactionPayment } from "../../types";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { currencySetAction } from "../../utils/types";
import { createUserCurrencySet } from "../../utils/userActions";

const getCurrencySetParameters = (event: SubstrateEvent): currencySetAction => {
    const [address, assetId] = new MultiTransactionPayment.CurrencySetEvent(event).params
    return {
        account: toBasiliskFormattedAddress(address),
        assetId: assetId.toBigInt()
    }
}

const handleXykBuyExecuted = async ({
    event,
    extrinsic,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const currencySetDetails = getCurrencySetParameters(event);
        
    if(!extrinsic) throw('Did not receive exrtinsic for xyk buy event')
    await createUserCurrencySet(currencySetDetails, extrinsic!, BigInt(event.blockNumber), store);
}

export default handleXykBuyExecuted;
