import { expect } from "chai";
import { poolUpdatedParameters } from "../../utils/types";
import { getPoolUpdatedParameters } from "./handlePoolUpdated";

const substrateEventStub = {
    params: [
        {
          name: 'param0',
          type: 'AccountId32',
          value: 'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS'
        },
        {
          name: 'param1',
          type: '{"owner":"AccountId32","start":"u32","end":"u32","assets":"(u32,u32)","initialWeight":"u32","finalWeight":"u32","weightCurve":"PalletLbpWeightCurveType","fee":"PrimitivesFee","feeCollector":"AccountId32"}',
          value: {
            end: 429,
            fee: [],
            owner: 'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak',
            start: 389,
            assets: [Array],
            finalWeight: 90000000,
            weightCurve: 'Linear',
            feeCollector: 'bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak',
            initialWeight: 10000000
          }
        }
      ],
};

const expectedPoolUpdatedParameters: poolUpdatedParameters = {
    poolId: "bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS",
    end: BigInt(429),
};

describe("mappings/lbp/handlePoolUpdated", () => {
    it("should get the pool updated event parameters", () => {
        const extractedPoolUpdatedParameters =
            getPoolUpdatedParameters(substrateEventStub as any);

        expect(extractedPoolUpdatedParameters).to.deep.equal(
            expectedPoolUpdatedParameters
        );
    });
});
