import { DatabaseManager } from "@subsquid/hydra-common";
import { HistoricalBalance, LBPPool } from "../generated/model";
import { ensure } from "./ensure";
import { blockHeight } from "./types";

export const createHistoricalBalance = async (
    store: DatabaseManager,
    pool: LBPPool,
    paraChainBlockHeight: blockHeight,
    relayChainBlockHeight: blockHeight,
    blockTimeStamp: number,
) => {
    const assetABalance = pool.assetABalance;
    const assetBBalance = pool.assetBBalance;
    const createdAt = new Date(blockTimeStamp);
    const historicalBalance = await ensure(
        store,
        HistoricalBalance,
        `${pool.id}-${paraChainBlockHeight}`,
        {
            assetABalance,
            assetBBalance,
            pool,
            relayChainBlockHeight,
            createdAt
        }
    );

    await store.save(historicalBalance);
};