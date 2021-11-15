import {
    EventContext,
    StoreContext,
    SubstrateEvent,
} from "@subsquid/hydra-common";
import { RelayChainInfo } from "../../types";
import { createBlockHeightPairing } from "../../utils/createBlockHeightPairing";
import { currentBlockNumbersParameters } from "../../utils/types";

const getCurrentBlockNumbersParameters = (
    event: SubstrateEvent
): currentBlockNumbersParameters => {
    const [relayChainBlockHeight, paraChainBlockHeight] =
        new RelayChainInfo.CurrentBlockNumbersEvent(event).params;
    return {
        relayChainBlockHeight: relayChainBlockHeight.toBigInt(),
        paraChainBlockHeight: paraChainBlockHeight.toBigInt(),
    };
};

const handleCurrentBlockNumbers = async ({
    block,
    event,
    store,
}: EventContext & StoreContext): Promise<void> => {
    const currentBlockNumbersParameters: currentBlockNumbersParameters =
        getCurrentBlockNumbersParameters(event);

    await createBlockHeightPairing(
        store,
        block.hash, // id of block height pairing
        block.timestamp,
        currentBlockNumbersParameters
    );
};

export default handleCurrentBlockNumbers;
