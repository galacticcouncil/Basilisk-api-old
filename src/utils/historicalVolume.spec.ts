import { expect } from 'chai';
import {
    HistoricalVolumeLBP,
    HistoricalVolumeXYK,
    LBPPool,
    XYKPool,
} from '../generated/model';
import { getHistoricalVolumeEntity } from './historicalVolume';

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
});
