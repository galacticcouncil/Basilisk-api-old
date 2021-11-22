import {
    EventContext,
    StoreContext,
    SubstrateEvent,
} from '@subsquid/hydra-common';
import { Balances } from '../../types';
import { toBasiliskFormattedAddress } from '../../utils/account';
import { nativeAssetId } from '../../constants';
import { updateMultiplePoolBalances } from '../../utils/poolRepository';
import { transferParameters } from '../../utils/types';

export const getBalanceTransferParameters = (
    event: SubstrateEvent
): transferParameters => {
    const [from, to, balance] = new Balances.TransferEvent(event).params;
    return {
        assetId: nativeAssetId,
        from: toBasiliskFormattedAddress(from),
        to: toBasiliskFormattedAddress(to),
        balance: balance.toBigInt(),
    };
};

const handleBalancesTransfer = async ({
    event,
    store,
}: EventContext & StoreContext) => {
    const transferParameters: transferParameters =
        getBalanceTransferParameters(event);

    await updateMultiplePoolBalances(store, transferParameters);
};

export default handleBalancesTransfer;
