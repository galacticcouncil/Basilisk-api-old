import { u32 } from "@polkadot/types";
import {
    EventContext,
    StoreContext,
    SubstrateEvent,
} from "@subsquid/hydra-common";
import { create } from "../../types/_registry";
import { toBasiliskFormattedAddress } from "../../utils/account";
import { ensurePool } from "../../utils/poolRepository";
import { poolCreatedParameters, poolCreatedParams1 } from "../../utils/types";

const getPoolCreatedParameters = (
    event: SubstrateEvent
): poolCreatedParameters => {
    const poolAddress = create("AccountId32", event.params[0].value);
    const params1 = event.params[1].value as unknown as poolCreatedParams1;
    const assetAId: u32 = create("u32", params1.assets[0]);
    const assetBId: u32 = create("u32", params1.assets[1]);

    return {
        poolId: toBasiliskFormattedAddress(poolAddress),
        assetAId: assetAId.toBigInt(),
        assetBId: assetBId.toBigInt(),
    };
};

const handlePoolCreated = async ({
    event,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const poolCreatedParameters: poolCreatedParameters =
        getPoolCreatedParameters(event);

    // create a new pool
    await ensurePool(store, poolCreatedParameters);
};

export default handlePoolCreated;
