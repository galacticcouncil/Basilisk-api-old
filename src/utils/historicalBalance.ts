import { DatabaseManager } from "@subsquid/hydra-common";
import { BlockHeightPairing, HistoricalBalanceLBP, HistoricalBalanceXYK, LBPPool, XYKPool } from "../generated/model";
import { ensure } from "./ensure";
import { EntityConstructor } from "./types";

export const createHistoricalBalance = async (
    store: DatabaseManager,
    pool: LBPPool | XYKPool,
    entity: EntityConstructor<HistoricalBalanceLBP | HistoricalBalanceXYK>,
    blockHeightPairing: BlockHeightPairing,
    blockTimeStamp: number
) => {
    const assetABalance = pool.assetABalance;
    const assetBBalance = pool.assetBBalance;
    const createdAt = new Date(blockTimeStamp);
    const paraChainBlockHeight =
        blockHeightPairing.paraChainBlockHeight.toString();

    const historicalBalance = await ensure(
        store,
        entity,
        `${pool.id}-${paraChainBlockHeight}`,
        {
            assetABalance,
            assetBBalance,
            pool,
            blockHeight: blockHeightPairing,
            createdAt,
        }
    );

    await store.save(historicalBalance);
};
