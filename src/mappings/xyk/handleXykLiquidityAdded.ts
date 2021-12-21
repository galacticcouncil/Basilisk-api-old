import { extrinsics } from '@polkadot/types/interfaces/definitions';
import {
    EventContext,
    StoreContext,
    SubstrateEvent,
} from '@subsquid/hydra-common';
import { XYKPool } from '../../generated/model';
import { XYK } from '../../types';
import { toBasiliskFormattedAddress } from '../../utils/account';
import { createUserActionLiquidityAdded } from '../../utils/userActions';

export const getLiquidityAddedEventParameters = (event: SubstrateEvent) => {
    const [address, assetA, assetB, amountA, amountB] =
        new XYK.LiquidityAddedEvent(event).params;

    return {
        account: toBasiliskFormattedAddress(address),
        assetA: assetA.toBigInt(),
        assetB: assetB.toBigInt(),
        amountA: amountA.toBigInt(),
        amountB: amountB.toBigInt(),
    };
};

const handleXykLiquidityAdded = async ({
    event,
    extrinsic,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const liquidityAddedEventParameters =
        getLiquidityAddedEventParameters(event);

    const pool = await store.get(XYKPool, {
        where: {
            assetAId: liquidityAddedEventParameters.assetA,
            assetBId: liquidityAddedEventParameters.assetB,
        },
    });
    if (!pool) throw `Unable to fetch poolId for XYK liquidity added action`;

    const liquidityAddedDetails = {
        ...liquidityAddedEventParameters,
        poolId: pool.id,
    };

    if (!extrinsic) throw 'Did not receive exrtinsic for xyk buy event';
    await createUserActionLiquidityAdded(
        liquidityAddedDetails,
        extrinsic!,
        BigInt(event.blockNumber),
        store
    );
};

export default handleXykLiquidityAdded;
