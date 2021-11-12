import {
    BlockContext,
    StoreContext,
    DatabaseManager,
} from "@subsquid/hydra-common";
import { Chronicle, LBPPool } from "../../generated/model";
import { ensure } from "../../utils/ensure";
import { createHistoricalBalance } from "../../utils/historicalBalance";
import { Basilisk } from "../../utils/basiliskApi";
import { BasiliskSDK } from "../../utils/basiliskSDK";
import { createBlockHeightPairing } from "../../utils/createBlockHeightPairing";

const ensureChronicle = async (store: DatabaseManager) => {
    const chronicle = await ensure(store, Chronicle, "chronicleId", {
        // just a starting value for the Chronicle
        lastProcessedBlock: BigInt(0),
    });

    await store.save(chronicle);
    return chronicle;
};
const updateChronicle = async (
    store: DatabaseManager,
    chronicleUpdate: Partial<Chronicle>
) => {
    const chronicle = await ensureChronicle(store);
    Object.assign(chronicle, chronicleUpdate);
    await store.save(chronicle);
};

const handlePostBlock = async ({
    store,
    block,
}: BlockContext & StoreContext) => {
    const basiliskAPI = await Basilisk.getInstance();

    // TODO wait for SDK update to have proper error handling here; BigInt(0) is wrong
    const relayBlockHeight = await basiliskAPI!.basilisk.query.getBlockHeightRelayChain(block.hash) || BigInt(0);
    const relayChainBlockHeight = BigInt(relayBlockHeight.toString());
    const paraChainBlockHeight = BigInt(block.height.toString());
    
    let dataBaseQueries;

    dataBaseQueries = [updateChronicle(store, {
        lastProcessedBlock: paraChainBlockHeight,
    })];

    const pools = await store.getMany<LBPPool>(LBPPool, {
        where: { saleEnded: false },
    });
    dataBaseQueries = pools.map((pool: LBPPool) => {
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
    dataBaseQueries = [blockHeightQuery, ...dataBaseQueries];

    await Promise.all(dataBaseQueries);
};

export default handlePostBlock;
