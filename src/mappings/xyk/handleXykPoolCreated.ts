import {
    EventContext,
    StoreContext,
    SubstrateEvent,
} from '@subsquid/hydra-common';
import { XYKPool } from '../../generated/model';
import { XYK } from '../../types';
import { toBasiliskFormattedAddress } from '../../utils/account';
import { getOrCreatePool } from '../../utils/poolRepository';
import { poolCreatedParameters } from '../../utils/types';

export const getXykPoolCreatedParameters = (
    event: SubstrateEvent
): poolCreatedParameters => {
    const [who, assetAId, assetBId, initialShares, shareToken, poolAddress] =
        new XYK.PoolCreatedEvent(event).params;

    return {
        poolId: toBasiliskFormattedAddress(poolAddress),
        assetAId: assetAId.toBigInt(),
        assetBId: assetBId.toBigInt(),
    };
};

const handleXykPoolCreated = async ({
    event,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const poolCreatedParameters: poolCreatedParameters =
        getXykPoolCreatedParameters(event);

    await getOrCreatePool(store, XYKPool, poolCreatedParameters);
};

export default handleXykPoolCreated;
