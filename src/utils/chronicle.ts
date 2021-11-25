import { DatabaseManager } from '@subsquid/hydra-common';
import { Chronicle } from '../generated/model';
import { getOrCreate } from './getOrCreate';

const ensureChronicle = async (store: DatabaseManager) => {
    const chronicle = await getOrCreate(store, Chronicle, 'chronicleId', {
        // just a starting value for the Chronicle
        lastProcessedBlock: BigInt(0),
    });

    await store.save(chronicle);
    return chronicle;
};
export const updateChronicle = async (
    store: DatabaseManager,
    chronicleUpdate: Partial<Chronicle>
) => {
    const chronicle = await ensureChronicle(store);
    Object.assign(chronicle, chronicleUpdate);
    await store.save(chronicle);
};
