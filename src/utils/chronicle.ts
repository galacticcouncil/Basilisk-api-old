import { DatabaseManager } from '@subsquid/hydra-common';
import { Chronicle } from '../generated/model';
import { getOrCreate } from './getOrCreate';

const getOrCreateChronicle = async (store: DatabaseManager) => {
    const chronicle = await getOrCreate(store, Chronicle, 'chronicleId', {
        // just a starting value for the Chronicle
        lastProcessedBlock: BigInt(0),
    });

    await store.save(chronicle);
    return chronicle;
};

/**
 * Updates the continuos chronicle variable that keeps track of the
 * last block height the processor finished processing.
 */
export const updateChronicle = async (
    store: DatabaseManager,
    chronicleUpdate: Partial<Chronicle>
) => {
    const chronicle = await getOrCreateChronicle(store);
    Object.assign(chronicle, chronicleUpdate);
    await store.save(chronicle);
};
