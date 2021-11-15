import {
    BlockContext,
    StoreContext,
} from "@subsquid/hydra-common";
import { LBPPool } from "../../generated/model";
import { createHistoricalBalance } from "../../utils/historicalBalance";
import { Basilisk } from "../../utils/basiliskApi";
import { createBlockHeightPairing } from "../../utils/createBlockHeightPairing";
import { updateChronicle } from "../../utils/chronicle";
import { MoreThanOrEqual, Not, MoreThan } from "typeorm";

const handlePostBlock = async ({
    store,
    block,
}: BlockContext & StoreContext) => {
    const basiliskAPI = await Basilisk.getInstance();

    // TODO wait for SDK update to have proper error handling here; BigInt(0) is wrong
    const relayBlockHeight = await basiliskAPI!.basilisk.query.getBlockHeightRelayChain(block.hash) || BigInt(0);
    const relayChainBlockHeight = BigInt(relayBlockHeight.toString());
    const paraChainBlockHeight = BigInt(block.height.toString());
    
    let databaseQueries;

    databaseQueries = [updateChronicle(store, {
        lastProcessedBlock: paraChainBlockHeight,
    })];

    const options = {
        saleEndAtRelayChainBlockHeight: MoreThanOrEqual(Number(relayChainBlockHeight))
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
            )
        ];
    });

    const blockHeightQuery = [
        createBlockHeightPairing(
            store,
            block.hash,
            block.timestamp,
            paraChainBlockHeight,
            relayChainBlockHeight
        ),
    ];
    databaseQueries = [blockHeightQuery, ...databaseQueries];

    await Promise.all(databaseQueries);
};

export default handlePostBlock;
