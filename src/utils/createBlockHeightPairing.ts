import { DatabaseManager } from '@subsquid/hydra-common';
import { BlockHeightPairing } from '../generated/model';
import { getOrCreate } from './getOrCreate';
import { currentBlockNumbersParameters } from './types';

/**
 * Creates a block height pairing between the
 * block heights of the relay- and para-chain.
 */
export const createBlockHeightPairing = async (
    store: DatabaseManager,
    paraChainBlockHash: string,
    blockTimeStamp: number,
    currentBlockNumbersParameters: currentBlockNumbersParameters
) => {
    const createdAt = new Date(blockTimeStamp);
    const paraChainBlockHeight =
        currentBlockNumbersParameters.paraChainBlockHeight;
    const relayChainBlockHeight =
        currentBlockNumbersParameters.relayChainBlockHeight;

    const blockHeightPairing = await getOrCreate(
        store,
        BlockHeightPairing,
        paraChainBlockHash,
        {
            createdAt,
            paraChainBlockHeight,
            relayChainBlockHeight,
        }
    );

    await store.save(blockHeightPairing);
};
