import { BlockContext, StoreContext } from '@subsquid/hydra-common';
import {
    BlockHeightPairing,
    HistoricalBalanceLBP,
    HistoricalBalanceXYK,
    LBPPool,
    XYKPool,
} from '../../generated/model';
import { createHistoricalBalance } from '../../utils/historicalBalance';
import { updateChronicle } from '../../utils/chronicle';
import { MoreThanOrEqual } from 'typeorm';
import { createHistoricalVolume } from '../../utils/historicalVolume';

const handlePostBlock = async ({
    block,
    store,
}: BlockContext & StoreContext) => {
    const currentBlockHeightPairing = await store.get<BlockHeightPairing>(
        BlockHeightPairing,
        {
            where: {
                id: block.hash,
            },
        }
    );
    if (!currentBlockHeightPairing)
        throw `Can't process data without block height pairing`;

    const relayChainBlockHeight =
        currentBlockHeightPairing.relayChainBlockHeight;
    const paraChainBlockHeight = currentBlockHeightPairing.paraChainBlockHeight;

    let databaseQueries = [];

    // update chronicle
    databaseQueries = [
        updateChronicle(store, {
            lastProcessedBlock: paraChainBlockHeight,
        }),
    ];

    // create historical balances for LBP
    const options = {
        saleEndAtRelayChainBlockHeight: MoreThanOrEqual(
            Number(relayChainBlockHeight)
        ),
    };
    const lbpPools = await store.getMany<LBPPool>(LBPPool, options as any);
    databaseQueries = lbpPools.map((pool: LBPPool) => {
        return [
            createHistoricalBalance(
                store,
                pool,
                HistoricalBalanceLBP,
                currentBlockHeightPairing!,
                block.timestamp
            ),
            createHistoricalVolume(
                store,
                pool,
                currentBlockHeightPairing!,
                block.timestamp
            ),
        ];
    });

    // create historical balances for XYK pools
    const xykPools = await store.getMany<XYKPool>(XYKPool, {});
    databaseQueries = xykPools.map((pool: XYKPool) => {
        return [
            createHistoricalBalance(
                store,
                pool,
                HistoricalBalanceXYK,
                currentBlockHeightPairing!,
                block.timestamp
            ),
            createHistoricalVolume(
                store,
                pool,
                currentBlockHeightPairing!,
                block.timestamp
            ),
        ];
    });

    // resolve concurrently all database queries
    await Promise.all(databaseQueries);
};

export default handlePostBlock;
