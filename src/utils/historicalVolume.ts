import { DatabaseManager, SubstrateBlock } from '@subsquid/hydra-common';
import { initialBalance } from '../constants';
import {
    BlockHeightPairing,
    HistoricalVolumeLBP,
    HistoricalVolumeXYK,
    LBPPool,
    XYKPool,
} from '../generated/model';
import { getOrCreate } from './getOrCreate';
import { EntityConstructor, transferParameters } from './types';

export const getHistoricalVolumeEntity = (
    pool: LBPPool | XYKPool
): typeof HistoricalVolumeLBP | typeof HistoricalVolumeXYK => {
    if (pool instanceof LBPPool) {
        return HistoricalVolumeLBP;
    }
    if (pool instanceof XYKPool) {
        return HistoricalVolumeXYK;
    } else {
        throw 'didnt find';
    }
};

const getHistoricalVolumeInitValues = (
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    // init values
    const assetABalanceIn = initialBalance;
    const assetABalanceOut = initialBalance;
    const assetBBalanceIn = initialBalance;
    const assetBBalanceOut = initialBalance;

    const createdAt = new Date(blockTimeStamp);
    const init = {
        assetABalanceIn,
        assetABalanceOut,
        assetBBalanceIn,
        assetBBalanceOut,
        pool,
        blockHeight: blockHeightPairing,
        createdAt,
    };
    return init;
};

export const getOrCreateHistoricalVolume = async (
    store: DatabaseManager,
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    // prepare values to create historical volume
    const historicalVolumeEntity = getHistoricalVolumeEntity(pool);
    const paraChainBlockHeight = blockHeightPairing.paraChainBlockHeight;
    const initValues = getHistoricalVolumeInitValues(
        pool,
        blockHeightPairing,
        blockTimeStamp
    );

    const historicalVolume = await getOrCreate(
        store,
        historicalVolumeEntity,
        `${pool.id}-${paraChainBlockHeight}-volume`,
        initValues
    );
    return historicalVolume;
};

export const createHistoricalVolume = async (
    store: DatabaseManager,
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    const entityConstructor = getHistoricalVolumeEntity(pool);
    const paraChainBlockHeight = blockHeightPairing.paraChainBlockHeight!;
    const id = `${pool.id}-${paraChainBlockHeight}-volume`;
    let historicalVolumeExists = await store.get(entityConstructor, {
        where: { id },
    });
    if (historicalVolumeExists) return;
    // this is like calling ensure, but we want to avoid writing to DB if it already exists
    const historicalVolume = await getOrCreateHistoricalVolume(
        store,
        pool,
        blockHeightPairing,
        blockTimeStamp
    );
    await store.save(historicalVolume!);
};

export const addIncomingVolumeForAssetId = (
    pool: LBPPool | XYKPool,
    historicalVolume: HistoricalVolumeLBP | HistoricalVolumeXYK,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (pool.assetAId === assetId) {
        historicalVolume.assetABalanceIn += balanceToAdd;
    }
    if (pool.assetBId === assetId) {
        historicalVolume.assetBBalanceIn += balanceToAdd;
    }

    return historicalVolume;
};

export const addOutgoingVolumeForAssetId = (
    pool: LBPPool | XYKPool,
    historicalVolume: HistoricalVolumeLBP | HistoricalVolumeXYK,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (pool.assetAId === assetId) {
        historicalVolume.assetABalanceOut += balanceToAdd;
    }
    if (pool.assetBId === assetId) {
        historicalVolume.assetBBalanceOut += balanceToAdd;
    }

    return historicalVolume;
};

async function updateHistoricalVolume(
    store: DatabaseManager,
    block: SubstrateBlock,
    entity: EntityConstructor<LBPPool | XYKPool>,
    transferParameters: transferParameters
) {
    const currentBlockHeightPairing = await store.get<BlockHeightPairing>(
        BlockHeightPairing,
        {
            where: {
                id: block.hash,
            },
        }
    );
    // Increase pool's asset balance in case the pool was recipient of an asset.
    let poolToReceive = await store.get(entity, {
        where: { id: transferParameters.to },
    });
    if (poolToReceive) {
        let historicalVolume = await getOrCreateHistoricalVolume(
            store,
            poolToReceive,
            currentBlockHeightPairing!,
            block.timestamp
        );
        if (!historicalVolume)
            throw 'could not find or create historical volume';
        historicalVolume = await addIncomingVolumeForAssetId(
            poolToReceive,
            historicalVolume,
            transferParameters.balance,
            transferParameters.assetId
        );
        await store.save(historicalVolume);
    }
    // Decrease pool's asset balance in case the pool was the sender of an asset.
    let poolToSend = await store.get(entity, {
        where: { id: transferParameters.from },
    });
    if (poolToSend) {
        let historicalVolume = await getOrCreateHistoricalVolume(
            store,
            poolToSend,
            currentBlockHeightPairing!,
            block.timestamp
        );
        if (!historicalVolume)
            throw 'could not find or create historical volume';
        historicalVolume = await addOutgoingVolumeForAssetId(
            poolToSend,
            historicalVolume,
            transferParameters.balance,
            transferParameters.assetId
        );
        await store.save(historicalVolume);
    }
}

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
