import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { create } from "../types/_registry";
import { toBasiliskFormattedAddress } from "../utils/account";
import { savePoolUpdated } from "../utils/poolRepository";
import { poolUpdatedParams1, poolUpdatedParameters } from "../utils/types";

const handlePoolUpdated = async ({
    event,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const poolUpdatedParameters: poolUpdatedParameters = (() => {
        const poolAddress = create("AccountId32", event.params[0].value);
        const params1 = event.params[1].value as unknown as poolUpdatedParams1;
        const end = create("u32", params1.end);
        return {
            poolId: toBasiliskFormattedAddress(poolAddress),
            end: end.toBigInt(),
        };
    })();

    await savePoolUpdated(store, poolUpdatedParameters.poolId, poolUpdatedParameters.end);
};

export default handlePoolUpdated;
