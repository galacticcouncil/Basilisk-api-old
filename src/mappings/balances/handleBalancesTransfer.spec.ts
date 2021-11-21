import { expect } from "chai";
import { nativeAssetId } from "../../constants";
import { transferParameters } from "../../utils/types";
import { getBalanceTransferParameters } from "./handleBalancesTransfer";

const substrateEventStub = {
    params: [
        {
            name: "param0",
            type: "AccountId32",
            value: "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
        },
        {
            name: "param1",
            type: "AccountId32",
            value: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
        },
        { name: "param2", type: "u128", value: 10000000000000 },
    ],
};

const expectedBalanceTransferParameters: transferParameters = {
    assetId: nativeAssetId,
    from: "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
    to: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
    balance: BigInt(10000000000000),
};

describe("mappings/balances/handleBalanceTransfer", () => {
    it("should get the balances transfer event parameters", () => {
        const extractedBalanceTransferParameters =
            getBalanceTransferParameters(substrateEventStub as any);

        expect(extractedBalanceTransferParameters).to.deep.equal(
            expectedBalanceTransferParameters
        );
    });
});
