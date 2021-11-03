import { BlockContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Chronicle } from "../generated/model";
import { ensure } from "../utils/ensure";

const ensureChronicle = async (
    store: DatabaseManager,
) => {
    const chronicle = await ensure(store, Chronicle, 'chronicleId', {
        // just a starting value for the Chronicle
        lastProcessedBlock: BigInt(0)
    });

    await store.save(chronicle);
    return chronicle;
}
const updateChronicle = async (
    store: DatabaseManager,
    chronicleUpdate: Partial<Chronicle>
) => {
    const chronicle = await ensureChronicle(store);
    Object.assign(chronicle, chronicleUpdate);
    await store.save(chronicle);
}

const handlePostBlock = async ({
    store,
    block
}: BlockContext & StoreContext) => {
    const blockHeight = BigInt(block.height);
    console.log("HANDLING POST BLOCK")
    await updateChronicle(store, {
        lastProcessedBlock: blockHeight
    });
}

export default handlePostBlock;