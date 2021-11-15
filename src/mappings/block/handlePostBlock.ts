import { BlockContext, StoreContext } from "@subsquid/hydra-common";
import { BlockHeightPairing, LBPPool } from "../../generated/model";
import { createHistoricalBalance } from "../../utils/historicalBalance";
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
    const pools = await store.getMany<LBPPool>(LBPPool, options as any);
    databaseQueries = pools.map((pool: LBPPool) => {
        return [
            createHistoricalBalance(
                store,
                pool,
                paraChainBlockHeight,
                relayChainBlockHeight,
                block.timestamp
            ),
        ];
    });

    await Promise.all(databaseQueries);
};

export default handlePostBlock;
