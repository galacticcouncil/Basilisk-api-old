import { expect } from "chai";
import { currentBlockNumbersParameters } from "../../utils/types";
import { getCurrentBlockNumbersParameters } from "./handleCurrentBlockNumbers";

const substrateEventStub = {
    params: [
        { name: "param0", type: "u32", value: 1 },
        { name: "param1", type: "u32", value: 12 },
    ],
};

const expectedBlockNumbersParameters: currentBlockNumbersParameters = {
    paraChainBlockHeight: BigInt(1),
    relayChainBlockHeight: BigInt(12),
};

describe("mappings/relayChainInfo/handleCurrentBlocksNumber", () => {
    it("should get the current block number event parameters", () => {
        const extractedBlockNumbersParameters = getCurrentBlockNumbersParameters(
            substrateEventStub as any
        );

        expect(extractedBlockNumbersParameters).to.deep.equal(
            expectedBlockNumbersParameters
        );
    });
});
