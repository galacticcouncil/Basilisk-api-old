import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Balances } from "../types";
import { toBasiliskFormattedAddress } from "../utils/account";
import { nativeAssetId } from "../constants";
import { updatePoolBalance } from "../utils/poolRepository";
import { transferParameters } from "../utils/types";

const handleBalancesTransfer = async ({
    event,
    store,
}: EventContext & StoreContext) => {
    const transferParameters: transferParameters = (() => {
        const [from, to, balance] = new Balances.TransferEvent(event).params;
        return {
            assetId: nativeAssetId,
            from: toBasiliskFormattedAddress(from),
            to: toBasiliskFormattedAddress(to),
            balance: balance.toBigInt(),
        };
    })();

    await updatePoolBalance(store, transferParameters);
};

export default handleBalancesTransfer;
