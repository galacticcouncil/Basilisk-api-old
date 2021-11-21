import { expect } from "chai";
import { poolCreatedParameters } from "../../utils/types";
import { getXykPoolCreatedParameters } from "./handleXykPoolCreated";

const substrateEventStub = {
    params: [
        {
            name: "param0",
            type: "AccountId32",
            value: "bXmPf7DcVmFuHEmzH3UX8t6AUkfNQW8pnTeXGhFhqbfngjAak",
        },
        { name: "param1", type: "u32", value: 0 },
        { name: "param2", type: "u32", value: 1 },
        {
            name: "param3",
            type: "u128",
            value: "0x0000000000000000002386f26fc10000",
        },
        { name: "param4", type: "u32", value: 3 },
        {
            name: "param5",
            type: "AccountId32",
            value: "bXn6KCrv8k2JV7B2c5jzLttBDqL4BurPCTcLa3NQk5SWDVXCJ",
        },
    ],
};

const expectedPoolCreatedParameters: poolCreatedParameters = {
    poolId: "bXn6KCrv8k2JV7B2c5jzLttBDqL4BurPCTcLa3NQk5SWDVXCJ",
    assetAId: BigInt(0),
    assetBId: BigInt(1),
};

describe("mappings/xyk/handleXykPoolCreated", () => {
    it("should get the pool created event parameters", () => {
        const extractedPoolCreatedParameters = getXykPoolCreatedParameters(
            substrateEventStub as any
        );

        expect(extractedPoolCreatedParameters).to.deep.equal(
            expectedPoolCreatedParameters
        );
    });
});
