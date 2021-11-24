import { DatabaseManager, SubstrateBlock } from '@subsquid/hydra-common';
import { initialBalance } from '../constants';
import {
    BlockHeightPairing,
    HistoricalVolumeLBP,
    HistoricalVolumeXYK,
    LBPPool,
    XYKPool,
} from '../generated/model';
import { ensure } from './ensure';
import { EntityConstructor, transferParameters } from './types';

const getHistoricalVolumeEntity = (pool: LBPPool | XYKPool) => {
    let historicalVolumeEntity: EntityConstructor<
        HistoricalVolumeLBP | HistoricalVolumeXYK
    >;
    if (typeof pool === typeof LBPPool) {
        historicalVolumeEntity = HistoricalVolumeLBP;
        return historicalVolumeEntity;
    }
    if (typeof pool === typeof XYKPool) {
        historicalVolumeEntity = HistoricalVolumeXYK;
        return historicalVolumeEntity;
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

export const ensureHistoricalVolume = async (
    store: DatabaseManager,
    pool: LBPPool | XYKPool,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    // prepare values for ensure
    const historicalVolumeEntity = getHistoricalVolumeEntity(pool);
    const paraChainBlockHeight =
        blockHeightPairing.paraChainBlockHeight.toString();
    const initValues = getHistoricalVolumeInitValues(
        pool,
        blockHeightPairing,
        blockTimeStamp
    );

    const historicalVolume = await ensure(
        store,
        historicalVolumeEntity!,
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
    let historicalVolumeExists = await store.get(entityConstructor!, {
        where: { id },
    });
    if(historicalVolumeExists) return
    // this is like calling ensure, but we want to avoid writing to DB if it already exists
    const historicalVolume = await ensureHistoricalVolume(
        store,
        pool,
        blockHeightPairing,
        blockTimeStamp
    );
    await store.save(historicalVolume);
};

export const addIncomingVolumeForAssetId = (
    historicalVolume: HistoricalVolumeLBP | HistoricalVolumeXYK,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (historicalVolume.pool.assetAId === assetId) {
        historicalVolume.assetABalanceIn += balanceToAdd;
    }
    if (historicalVolume.pool.assetBId === assetId) {
        historicalVolume.assetBBalanceIn += balanceToAdd;
    }

    return historicalVolume;
};

export const addOutgoingVolumeForAssetId = (
    historicalVolume: HistoricalVolumeLBP | HistoricalVolumeXYK,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (historicalVolume.pool.assetAId === assetId) {
        historicalVolume.assetABalanceOut += balanceToAdd;
    }
    if (historicalVolume.pool.assetBId === assetId) {
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
        let historicalVolume = await ensureHistoricalVolume(
            store,
            poolToReceive,
            currentBlockHeightPairing!,
            block.timestamp
        );
        historicalVolume = await addIncomingVolumeForAssetId(
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
        let historicalVolume = await ensureHistoricalVolume(
            store,
            poolToSend,
            currentBlockHeightPairing!,
            block.timestamp
        );
        historicalVolume = await addOutgoingVolumeForAssetId(
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
