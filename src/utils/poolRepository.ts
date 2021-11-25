import { DatabaseManager } from "@subsquid/hydra-common";
import { initialBalance } from "../constants";
import { LBPPool, XYKPool } from "../generated/model";
import { getOrCreate } from "./getOrCreate";
import {
    EntityConstructor,
    poolCreatedParameters,
    transferParameters,
} from "./types";

/**
 * Find or create a pool with default values,
 * using the `poolId` as the unique ID
 */
export const getOrCreatePool = async (
    store: DatabaseManager,
    entityConstructor: EntityConstructor<LBPPool | XYKPool>,
    poolCreatedParameters: poolCreatedParameters
): Promise<LBPPool | XYKPool> => {
    const assetAId = poolCreatedParameters.assetAId;
    const assetBId = poolCreatedParameters.assetBId;
    // ensure the pool with default parameters
    const initAssetABalance = initialBalance;
    const initAssetBBalance = initialBalance;

    const pool = await getOrCreate<LBPPool | XYKPool>(
        store,
        entityConstructor,
        poolCreatedParameters.poolId,
        {
            assetAId,
            assetBId,
            assetABalance: initAssetABalance,
            assetBBalance: initAssetBBalance,
        }
    );

    await store.save(pool);
    return pool;
};

export const increasePoolBalanceForAssetId = (
    pool: LBPPool | XYKPool,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (pool.assetAId === assetId) {
        pool.assetABalance += balanceToAdd;
    }
    if (pool.assetBId === assetId) {
        pool.assetBBalance += balanceToAdd;
    }

    return pool;
};

export const decreasePoolBalanceForAssetId = (
    pool: LBPPool | XYKPool,
    balanceToRemove: bigint,
    assetId: bigint
) => {
    // it is not possible to create a pool where both asset ids are the same
    if (pool.assetAId === assetId) {
        pool.assetABalance -= balanceToRemove;
    }
    if (pool.assetBId === assetId) {
        pool.assetBBalance -= balanceToRemove;
    }

    return pool;
};

export const saveLbpPoolSaleEnd = async (
    store: DatabaseManager,
    poolId: string,
    end: bigint
) => {
    const pool = await store.get(LBPPool, {
        where: { id: poolId },
    });
    if (!pool) return;
    pool.saleEndAtRelayChainBlockHeight = Number(end);

    await store.save(pool);
};

export const updateMultiplePoolBalances = async (
    store: DatabaseManager,
    transferParameters: transferParameters
) => {
    const databaseQueriesLBP = updatePoolBalance(store, LBPPool, transferParameters);
    const databaseQueriesXYK = updatePoolBalance(store, XYKPool, transferParameters);

    const databaseQueries = [databaseQueriesLBP, databaseQueriesXYK];
    await Promise.all(databaseQueries);
};

async function updatePoolBalance(
    store: DatabaseManager,
    entity: EntityConstructor<LBPPool | XYKPool>,
    transferParameters: transferParameters
) {
    // Increase pool's asset balance in case the pool was recipient of an asset.
    let poolToReceive = await store.get(entity, {
        where: { id: transferParameters.to },
    });
    if (poolToReceive) {
        const pool = increasePoolBalanceForAssetId(
            poolToReceive,
            transferParameters.balance,
            transferParameters.assetId
        );
        await store.save(pool);
    }
    // Decrease pool's asset balance in case the pool was the sender of an asset.
    let poolToSend = await store.get(entity, {
        where: { id: transferParameters.from },
    });
    if (poolToSend) {
        const pool = decreasePoolBalanceForAssetId(
            poolToSend,
            transferParameters.balance,
            transferParameters.assetId
        );
        await store.save(pool);
    }
}
