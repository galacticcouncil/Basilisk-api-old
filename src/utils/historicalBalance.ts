import { DatabaseManager } from '@subsquid/hydra-common';
import {
    BlockHeightPairing,
    HistoricalBalanceLBP,
    HistoricalBalanceXYK,
    LBPPool,
    XYKPool,
} from '../generated/model';
import { ensure } from './ensure';

export const createHistoricalBalanceLBP = async (
    store: DatabaseManager,
    pool: LBPPool,
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
        HistoricalBalanceLBP,
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

export const createHistoricalBalanceXYK = async (
    store: DatabaseManager,
    pool: XYKPool,
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
        HistoricalBalanceXYK,
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
