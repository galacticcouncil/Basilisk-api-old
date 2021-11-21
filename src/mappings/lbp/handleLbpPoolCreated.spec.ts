import { expect } from "chai";
import { poolCreatedParameters } from "../../utils/types";
import { getPoolCreatedParameters } from "./handleLbpPoolCreated";

const substrateEventStub = {
    params: [
        {
            name: "param0",
            type: "AccountId32",
            value: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
        },
        {
            name: "param1",
            type: '{"owner":"AccountId32","start":"u32","end":"u32","assets":"(u32,u32)","initialWeight":"u32","finalWeight":"u32","weightCurve":"PalletLbpWeightCurveType","fee":"PrimitivesFee","feeCollector":"AccountId32"}',
            value: {
                end: 0,
                fee: { numerator: 1, denominator: 10 },
                owner: "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
                start: 0,
                assets: [0, 1],
                finalWeight: 90000000,
                weightCurve: "Linear",
                feeCollector:
                    "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
                initialWeight: 10000000,
            },
        },
    ],
};

const expectedPoolCreatedParameters: poolCreatedParameters = {
    poolId: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
    assetAId: BigInt(0),
    assetBId: BigInt(1),
};

describe("mappings/lbp/handlePoolCreated", () => {
    it("should get the pool created event parameters", () => {
        const extractedPoolCreatedParameters =
            getPoolCreatedParameters(substrateEventStub as any);

        expect(extractedPoolCreatedParameters).to.deep.equal(
            expectedPoolCreatedParameters
        );
    });
});
