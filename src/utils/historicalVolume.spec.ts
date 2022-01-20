import { expect } from 'chai';
import {
    HistoricalVolumeLBP,
    HistoricalVolumeXYK,
    LBPPool,
    XYKPool,
} from '../generated/model';
import {
    addIncomingVolumeForAssetId,
    addOutgoingVolumeForAssetId,
    getHistoricalVolumeEntity,
} from './historicalVolume';

describe('utils/historicalVolume', () => {
    it('can get the historicalVolumeLBP class for LBPPool', () => {
        const pool = new LBPPool({});

        const entity = getHistoricalVolumeEntity(pool);
        expect(Object.is(entity, HistoricalVolumeLBP)).to.be.true;
    });

    it('can get the historicalVolumeXYK class for XYKPool', () => {
        const pool = new XYKPool({});

        const entity = getHistoricalVolumeEntity(pool);
        expect(Object.is(entity, HistoricalVolumeXYK)).to.be.true;
    });

    it('fails to get HistoricalVolumeXYK class for LBPPool', () => {
        const pool = new LBPPool({});

        const entity = getHistoricalVolumeEntity(pool);
        expect(Object.is(entity, HistoricalVolumeXYK)).to.be.false;
    });

    it('fails to get HistoricalVolumeLBP class for XYKPool', () => {
        const pool = new XYKPool({});

        const entity = getHistoricalVolumeEntity(pool);
        expect(Object.is(entity, HistoricalVolumeLBP)).to.be.false;
    });

    describe('it can add volume for incoming transactions', () => {
        const partialInitialValuesPool = {
            assetAId: BigInt(0),
            assetBId: BigInt(1),
        };

        const initialValuesHistoricalVolume = {
            assetAAmountIn: BigInt(0),
            assetAAmountOut: BigInt(0),
            assetBAmountIn: BigInt(0),
            assetBAmountOut: BigInt(0),
        };

        const pool = new LBPPool(partialInitialValuesPool);
    
        

        it('can add volume for known asset A', () => {
            const historicalVolume = new HistoricalVolumeLBP(
                initialValuesHistoricalVolume
            );

            const updatedHistoricalVolumeAssetA = addIncomingVolumeForAssetId(
                pool,
                historicalVolume,
                BigInt(100),
                BigInt(0)
            );

            expect(updatedHistoricalVolumeAssetA.assetAAmountIn).to.equal(BigInt(100));
            expect(updatedHistoricalVolumeAssetA.assetBAmountIn).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetA.assetAAmountOut).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetA.assetBAmountOut).to.equal(BigInt(0));
        });

        it('can add volume for asset B', () => {
            const historicalVolume = new HistoricalVolumeLBP(
                initialValuesHistoricalVolume
            );

            const updatedHistoricalVolumeAssetB = addIncomingVolumeForAssetId(
                pool,
                historicalVolume,
                BigInt(200),
                BigInt(1)
            );

            expect(updatedHistoricalVolumeAssetB.assetAAmountIn).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetB.assetBAmountIn).to.equal(BigInt(200));
            expect(updatedHistoricalVolumeAssetB.assetAAmountOut).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetB.assetBAmountOut).to.equal(BigInt(0));
        })

        it('does not add volume for unknown assets', () => {
            const historicalVolume = new HistoricalVolumeLBP(
                initialValuesHistoricalVolume
            );
            const updatedHistoricalVolume = addIncomingVolumeForAssetId(
                pool,
                historicalVolume,
                BigInt(300),
                BigInt(2)
            );
            // unchanged
            expect(updatedHistoricalVolume).to.equal(historicalVolume);
        });
    });

    describe('it can add volume for outgoing transactions', () => {
        const partialInitialValuesPool = {
            assetAId: BigInt(0),
            assetBId: BigInt(1),
        };

        const initialValuesHistoricalVolume = {
            assetAAmountIn: BigInt(0),
            assetAAmountOut: BigInt(0),
            assetBAmountIn: BigInt(0),
            assetBAmountOut: BigInt(0),
        };

        const pool = new LBPPool(partialInitialValuesPool);
    
        

        it('can add volume for known asset A', () => {
            const historicalVolume = new HistoricalVolumeLBP(
                initialValuesHistoricalVolume
            );

            const updatedHistoricalVolumeAssetA = addOutgoingVolumeForAssetId(
                pool,
                historicalVolume,
                BigInt(100),
                BigInt(0)
            );

            expect(updatedHistoricalVolumeAssetA.assetAAmountIn).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetA.assetBAmountIn).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetA.assetAAmountOut).to.equal(BigInt(100));
            expect(updatedHistoricalVolumeAssetA.assetBAmountOut).to.equal(BigInt(0));
        });

        it('can add volume for asset B', () => {
            const historicalVolume = new HistoricalVolumeLBP(
                initialValuesHistoricalVolume
            );

            const updatedHistoricalVolumeAssetB = addOutgoingVolumeForAssetId(
                pool,
                historicalVolume,
                BigInt(200),
                BigInt(1)
            );

            expect(updatedHistoricalVolumeAssetB.assetAAmountIn).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetB.assetBAmountIn).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetB.assetAAmountOut).to.equal(BigInt(0));
            expect(updatedHistoricalVolumeAssetB.assetBAmountOut).to.equal(BigInt(200));
        })

        it('does not add volume for unknown assets', () => {
            const historicalVolume = new HistoricalVolumeLBP(
                initialValuesHistoricalVolume
            );
            const updatedHistoricalVolume = addOutgoingVolumeForAssetId(
                pool,
                historicalVolume,
                BigInt(300),
                BigInt(2)
            );
            // unchanged
            expect(updatedHistoricalVolume).to.equal(historicalVolume);
        });
    });
});
