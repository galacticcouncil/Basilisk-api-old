import { BlockContext, StoreContext } from "@subsquid/hydra-common";
import { BlockHeightPairing, LBPPool, XYKPool } from "../../generated/model";
import { createHistoricalBalanceLBP, createHistoricalBalanceXYK } from "../../utils/historicalBalance";
import { updateChronicle } from "../../utils/chronicle";
import { MoreThanOrEqual } from "typeorm";

const handlePostBlock = async ({
    block,
    store,
}: BlockContext & StoreContext) => {
    // TODO proper error handling for undefined
    const currentBlockHeightPairing = await store.get<BlockHeightPairing>(
        BlockHeightPairing,
        {
            where: {
                id: block.hash,
            },
        }
    );

    const relayChainBlockHeight =
        currentBlockHeightPairing?.relayChainBlockHeight || BigInt(0);
    const paraChainBlockHeight =
        currentBlockHeightPairing?.paraChainBlockHeight || BigInt(0);

    let databaseQueries;
    // update chronicle
    databaseQueries = [
        updateChronicle(store, {
            lastProcessedBlock: paraChainBlockHeight,
        }),
    ];

    // create historical balance
    const options = {
        saleEndAtRelayChainBlockHeight: MoreThanOrEqual(
            Number(relayChainBlockHeight)
        ),
    };
    const lbpPools = await store.getMany<LBPPool>(LBPPool, options as any);
    // TODO proper error handling for undefined
    databaseQueries = lbpPools.map((pool: LBPPool) => {
        return [
            createHistoricalBalanceLBP(
                store,
                pool,
                currentBlockHeightPairing!,
                block.timestamp
            ),
        ];
    });

    const xykPools = await store.getMany<XYKPool>(XYKPool, {});
    databaseQueries = xykPools.map((pool: XYKPool) => {
        return [
            createHistoricalBalanceXYK(
                store,
                pool,
                currentBlockHeightPairing!,
                block.timestamp
            ),
        ];
    });

    await Promise.all(databaseQueries);
};

export default handlePostBlock;
