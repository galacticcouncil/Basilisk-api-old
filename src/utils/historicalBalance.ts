import { DatabaseManager } from "@subsquid/hydra-common";
import { HistoricalBalance, LBPPool } from "../generated/model";
import { ensure } from "./ensure";

export const createHistoricalBalance = async (
    store: DatabaseManager,
    pool: LBPPool,
    paraChainBlockHeight: bigint,
    relayChainBlockHeight: bigint
) => {
    const assetABalance = pool.assetABalance;
    const assetBBalance = pool.assetBBalance;
    const historicalBalance = await ensure(
        store,
        HistoricalBalance,
        `${paraChainBlockHeight}`,
        {
            assetABalance,
            assetBBalance,
            pool,
            relayChainBlockHeight
        }
    );

    await store.save(historicalBalance);
};