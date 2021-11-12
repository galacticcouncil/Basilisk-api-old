import { DatabaseManager } from "@subsquid/hydra-common";
import { BlockHeightPairing } from "../generated/model";
import { ensure } from "./ensure";
import { blockHeight } from "./types";

export const createBlockHeightPairing = async (
    store: DatabaseManager,
    paraChainBlockHash: string,
    blockTimeStamp: number,
    paraChainBlockHeight: blockHeight,
    relayChainBlockHeight: blockHeight
) => {
    const createdAt = new Date(blockTimeStamp);
    const blockHeightPairing = await ensure(
        store,
        BlockHeightPairing,
        paraChainBlockHash,
        {
            createdAt,
            paraChainBlockHeight,
            relayChainBlockHeight,
        }
    );

    await store.save(blockHeightPairing);
};
