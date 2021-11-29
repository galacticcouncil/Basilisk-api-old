import { expect } from "chai";
import { transferParameters } from "../../utils/types";
import { getTokensTransferParameters } from "./handleTokensTransfer";

const substrateEventStub = {
    params: [
        { name: "param0", type: "u32", value: 1 },
        {
            name: "param1",
            type: "AccountId32",
            value: "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
        },
        {
            name: "param2",
            type: "AccountId32",
            value: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
        },
        { name: "param3", type: "u128", value: 10000000000000 },
    ],
};

const expectedTokensTransferParameters: transferParameters = {
    assetId: BigInt(1),
    from: "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
    to: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
    balance: BigInt(10000000000000),
};

describe("mappings/tokens/handleTokensTransfer", () => {
    it("should get the tokens transfer event parameters", () => {
        const extractedTokensTransferParameters = getTokensTransferParameters(
            substrateEventStub as any
        );

        expect(extractedTokensTransferParameters).to.deep.equal(
            expectedTokensTransferParameters
        );
    });
});
