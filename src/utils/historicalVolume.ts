import { DatabaseManager, SubstrateBlock } from '@subsquid/hydra-common';
import {
    errorInvalidCurrentBlockHeightPairing,
    initialBalance,
} from '../constants';
import {
    BlockHeightPairing,
    HistoricalVolumeLBP,
    HistoricalVolumeXYK,
    LBPPool,
    XYKPool,
} from '../generated/model';
import { getOrCreate } from './getOrCreate';
import { EntityConstructor, transferParameters } from './types';

// updates historical volumes for LBP and XYK pools
export const updateMultipleHistoricalVolumes = async (
    store: DatabaseManager,
    block: SubstrateBlock,
    transferParameters: transferParameters
) => {
    const databaseQueriesLBP = updateHistoricalVolume(
        store,
        block,
        LBPPool,
        transferParameters
    );
    const databaseQueriesXYK = updateHistoricalVolume(
        store,
        block,
        XYKPool,
        transferParameters
    );

    const databaseQueries = [databaseQueriesLBP, databaseQueriesXYK];
    await Promise.all(databaseQueries);
};

/**
 * When called within a block for the first time, it creates a new
 * historical volume entry for LBP or XYK pool entities.
 * Otherwise it adds to an existing historical volume entry according
 * to incoming or outgoing transfer.
 */
async function updateHistoricalVolume(
    store: DatabaseManager,
    block: SubstrateBlock,
    entity: EntityConstructor<LBPPool | XYKPool>,
    transferParameters: transferParameters
) {
    const currentBlockHeightPairing = await getCurrentBlockHeightPairing(
        block,
        store
    );

    // check whether the pool is receiving a transfer
    let poolToReceiveTransfer = await store.get(entity, {
        where: { id: transferParameters.to },
    });
    if (poolToReceiveTransfer) {
        let historicalVolume = await getOrCreateHistoricalVolume(
            store,
            poolToReceiveTransfer,
            currentBlockHeightPairing,
            block.timestamp
        );
        if (!historicalVolume)
            throw 'could not find or create historical volume';
        historicalVolume = await addIncomingVolumeForAssetId(
            poolToReceiveTransfer,
            historicalVolume,
            transferParameters.balance,
            transferParameters.assetId
        );
        await store.save(historicalVolume);
    }
    // check whether the pool is sending a transfer
    let poolToSendTransfer = await store.get(entity, {
        where: { id: transferParameters.from },
    });
    if (poolToSendTransfer) {
        let historicalVolume = await getOrCreateHistoricalVolume(
            store,
            poolToSendTransfer,
            currentBlockHeightPairing,
            block.timestamp
        );
        if (!historicalVolume) throw 'can not find or create historical volume';
        historicalVolume = await addOutgoingVolumeForAssetId(
            poolToSendTransfer,
            historicalVolume,
            transferParameters.balance,
            transferParameters.assetId
        );
        await store.save(historicalVolume);
    }
}

export const getOrCreateHistoricalVolume = async (
    store: DatabaseManager,
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    // prepare values to create a historical volume entry
    const HistoricalVolumeEntity = getHistoricalVolumeEntity(pool);
    const initValues = getHistoricalVolumeInitValues(
        pool,
        blockHeightPairing,
        blockTimeStamp
    );

    const historicalVolumeId = getHistoricalVolumeId(pool, blockHeightPairing);
    const historicalVolume = await getOrCreate(
        store,
        HistoricalVolumeEntity,
        historicalVolumeId,
        initValues
    );
    return historicalVolume;
};

// adds incoming transfer to the historical volume entry
export const addIncomingVolumeForAssetId = (
    pool: LBPPool | XYKPool,
    historicalVolume: HistoricalVolumeLBP | HistoricalVolumeXYK,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (pool.assetAId === assetId) {
        historicalVolume.assetAAmountIn += balanceToAdd;
    }
    if (pool.assetBId === assetId) {
        historicalVolume.assetBAmountIn += balanceToAdd;
    }

    return historicalVolume;
};

/**
 * Adds outgoing transfer to historical volume entry.
 * Volume is tracked in absolute numbers that's why outgoing transfers
 * are not subtracted.
 */
export const addOutgoingVolumeForAssetId = (
    pool: LBPPool | XYKPool,
    historicalVolume: HistoricalVolumeLBP | HistoricalVolumeXYK,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (pool.assetAId === assetId) {
        historicalVolume.assetAAmountOut += balanceToAdd;
    }
    if (pool.assetBId === assetId) {
        historicalVolume.assetBAmountOut += balanceToAdd;
    }

    return historicalVolume;
};

/**
 * Creates a new historical volume entry with initial values.
 * Skips if a historical volume already exists for the given
 * pool and block height.
 */
export const createHistoricalVolume = async (
    store: DatabaseManager,
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    // get historical volume for given block height
    const HistoricalVolumeEntity = getHistoricalVolumeEntity(pool);
    const historicalVolumeId = getHistoricalVolumeId(pool, blockHeightPairing);
    // retrieve from database
    let historicalVolumeExists = await store.get(HistoricalVolumeEntity, {
        where: { id: historicalVolumeId },
    });
    // skip if entry exists
    if (historicalVolumeExists) return;

    // create historical volume entry with initial values
    const initValues = getHistoricalVolumeInitValues(
        pool,
        blockHeightPairing,
        blockTimeStamp
    );
    const historicalVolume = new HistoricalVolumeEntity();
    historicalVolume.id = historicalVolumeId;
    Object.assign(historicalVolume, initValues);

    await store.save(historicalVolume);
};

// Returns the matching historical volume class for a given LBP or XYK pool.
export const getHistoricalVolumeEntity = (
    pool: LBPPool | XYKPool
): typeof HistoricalVolumeLBP | typeof HistoricalVolumeXYK => {
    if (pool instanceof LBPPool) {
        return HistoricalVolumeLBP;
    }
    if (pool instanceof XYKPool) {
        return HistoricalVolumeXYK;
    } else {
        throw "Can't create Historical Volume entity";
    }
};

const getHistoricalVolumeInitValues = (
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    // initial values
    const assetAAmountIn = initialBalance;
    const assetAAmountOut = initialBalance;
    const assetBAmountIn = initialBalance;
    const assetBAmountOut = initialBalance;

    const createdAt = new Date(blockTimeStamp);
    const initValuesHistoricalVolume = {
        assetAAmountIn,
        assetAAmountOut,
        assetBAmountIn,
        assetBAmountOut,
        pool,
        blockHeight: blockHeightPairing,
        createdAt,
    };
    return initValuesHistoricalVolume;
};

const getHistoricalVolumeId = (
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing
) => {
    return `${pool.id}-${blockHeightPairing.parachainBlockHeight}-volume`;
};

async function getCurrentBlockHeightPairing(
    block: SubstrateBlock,
    store: DatabaseManager
): Promise<BlockHeightPairing> {
    const currentHeightSearchOption = {
        where: {
            id: block.hash,
        },
    };
    const currentBlockHeightPairing = await store.get<BlockHeightPairing>(
        BlockHeightPairing,
        currentHeightSearchOption
    );
    if (!currentBlockHeightPairing) throw errorInvalidCurrentBlockHeightPairing;

    return currentBlockHeightPairing;
}
