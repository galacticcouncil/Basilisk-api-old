import {
    BlockContext,
    StoreContext,
    DatabaseManager,
} from "@subsquid/hydra-common";
import { Chronicle, LBPPool } from "../generated/model";
import { ensure } from "../utils/ensure";
import { createHistoricalBalance } from "../utils/historicalBalance";
import { updateSaleEnded } from "../utils/poolRepository";
import * as basiliskSDK from "../utils/basiliskSDK";

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
    const basiliskApi = await basiliskSDK.initialize();
   
    const relayChainBlockHeight =
        BigInt((await basiliskApi.basilisk.query.getBlockHeightRelayChain(
            block.hash
        ))?.toString() || 0);
    const paraChainBlockHeight = BigInt(block.height);

    await updateChronicle(store, {
        lastProcessedBlock: paraChainBlockHeight,
    });

    const pools = await store.getMany<LBPPool>(LBPPool, {
        where: { saleEnded: false },
    });

   
    const historicalBalanceQueries = pools.map((pool: LBPPool) => {
        return [
            createHistoricalBalance(
                store,
                pool,
                paraChainBlockHeight,
                relayChainBlockHeight
            ),
            updateSaleEnded(store, pool, relayChainBlockHeight),
        ];
    });

    await Promise.all(historicalBalanceQueries);
};

export default handlePostBlock;
