import { expect } from "chai";
import {
    increasePoolBalanceForAssetId,
    decreasePoolBalanceForAssetId,
} from "./poolRepository";

describe("utils/poolRepository", () => {
    describe("increasePoolBalanceForAssetId", () => {
        const poolInit = () => ({
            assetAId: BigInt(0),
            assetABalance: BigInt(0),
            assetBId: BigInt(1),
            assetBBalance: BigInt(0),
        });

        it("should increase balance for assetA, not assetB", () => {
            const pool = poolInit();
            const balanceToAdd = BigInt(10);
            const assetId = pool.assetAId;

            const poolAfter = increasePoolBalanceForAssetId(
                pool as any,
                balanceToAdd,
                assetId
            );

            // increased
            expect(poolAfter.assetABalance).to.equal(
                poolInit().assetABalance + balanceToAdd
            );
            // unchanged
            expect(poolAfter.assetBBalance).to.equal(poolInit().assetBBalance);
        });
        it("should increase balance for assetB. not assetA", () => {
            const pool = poolInit();
            const balanceToAdd = BigInt(10);
            const assetId = pool.assetBBalance;

            const poolAfter = increasePoolBalanceForAssetId(
                pool as any,
                balanceToAdd,
                assetId
            );

            // increased
            expect(poolAfter.assetABalance).to.equal(
                poolInit().assetBBalance + balanceToAdd
            );
            // unchanged
            expect(poolAfter.assetBBalance).to.equal(poolInit().assetABalance);
        });
    });

    describe("decreasePoolBalanceForAssetId", () => {
        const poolInit = () => ({
            assetAId: BigInt(0),
            assetABalance: BigInt(100),
            assetBId: BigInt(1),
            assetBBalance: BigInt(100),
        });

        it("should decrease balance for assetA, not assetB", () => {
            const pool = poolInit();
            const balanceToRemove = BigInt(10);
            const assetId = pool.assetAId;

            const poolAfter = decreasePoolBalanceForAssetId(
                pool as any,
                balanceToRemove,
                assetId
            );

            // decreased
            expect(poolAfter.assetABalance).to.equal(
                poolInit().assetABalance - balanceToRemove
            );
            // unchanged
            expect(poolAfter.assetBBalance).to.equal(poolInit().assetBBalance);
        });

        it("should decrease balance for assetB, not assetA", () => {
            const pool = poolInit();
            const balanceToRemove = BigInt(10);
            const assetId = pool.assetBId;

            const poolAfter = decreasePoolBalanceForAssetId(
                pool as any,
                balanceToRemove,
                assetId
            );

            // decreased
            expect(poolAfter.assetBBalance).to.equal(
                poolInit().assetBBalance - balanceToRemove
            );
            // unchanged
            expect(poolAfter.assetABalance).to.equal(poolInit().assetABalance);
        });
    });
});
