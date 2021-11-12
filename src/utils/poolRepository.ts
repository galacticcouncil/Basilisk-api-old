import { DatabaseManager } from "@subsquid/hydra-common";
import { LBPPool } from "../generated/model";
import { ensure } from "./ensure";
import { poolCreatedParameters, transferParameters } from "./types";

/**
 * Find or create a pool with default values,
 * using the `poolId` as the unique ID
 */
export const ensurePool = async (
    store: DatabaseManager,
    poolCreatedParameters: poolCreatedParameters
): Promise<LBPPool> => {
    const assetAId = poolCreatedParameters.assetAId;
    const assetBId = poolCreatedParameters.assetBId;
    // ensure the pool with default parameters
    const initAssetABalance = BigInt(0);
    const initAssetBBalance = BigInt(0);

    const pool = await ensure<LBPPool>(
        store,
        LBPPool,
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

export const increasePoolBalanceForAssetId = async (
    store: DatabaseManager,
    pool: LBPPool,
    balanceToAdd: bigint,
    assetId: bigint
) => {
    if (pool.assetAId === assetId) {
        pool.assetABalance += balanceToAdd;
    }
    if (pool.assetBId === assetId) {
        pool.assetBBalance += balanceToAdd;
    }

    await store.save(pool);
};

export const decreasePoolBalanceForAssetId = async (
    store: DatabaseManager,
    pool: LBPPool,
    balanceToRemove: bigint,
    assetId: bigint
) => {
    if (pool.assetAId == assetId) {
        pool.assetABalance -= balanceToRemove;
    }
    if (pool.assetBId == assetId) {
        pool.assetBBalance -= balanceToRemove;
    }

    await store.save(pool);
};

export const savePoolUpdated = async (
    store: DatabaseManager,
    poolId: string,
    end: bigint
) => {
    const pool = await store.get(LBPPool, {
        where: { id: poolId },
    });
    if (!pool) return;
    pool.saleEndAtRelayChainBlockHeight = end;
    pool.saleEnded = false;

    await store.save(pool);
};

export const setSaleEnded = async (store: DatabaseManager, poolId: string) => {
    const pool = await store.get(LBPPool, {
        where: { id: poolId },
    });
    if (!pool) return;
    pool.saleEnded = true;
    
    await store.save(pool);
};

export const updatePoolBalance = async (
    store: DatabaseManager,
    transferParameters: transferParameters
) => {
    // Increase pool's asset balance in case the pool was recipient of an asset.
    const poolRecipient = await store.get(LBPPool, {
        where: { id: transferParameters.to },
    });
    if (poolRecipient) {
        await increasePoolBalanceForAssetId(
            store,
            poolRecipient,
            transferParameters.balance,
            transferParameters.assetId
        );
    }
    // Decrease pool's asset balance in case the pool was the sender of an asset.
    const poolSender = await store.get(LBPPool, {
        where: { id: transferParameters.from },
    });
    if (poolSender) {
        await decreasePoolBalanceForAssetId(
            store,
            poolSender,
            transferParameters.balance,
            transferParameters.assetId
        );
    }
};

export const updateSaleEnded = async (
    store: DatabaseManager,
    pool: LBPPool,
    relayChainBlockHeight: bigint
) => {
    if (!pool.saleEndAtRelayChainBlockHeight) return;
    if (pool.saleEndAtRelayChainBlockHeight <= relayChainBlockHeight)
        return setSaleEnded(store, pool.id);
};
