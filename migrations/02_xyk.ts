import xykPool from './helpers/xyk';
import { assetPair } from './helpers/types';
import BigNumber from 'bignumber.js';

async function main(): Promise<void> {
    // create pool
    const assetPair: assetPair = { assetA: '0', assetB: '1' };
    const assetAAmount = new BigNumber(1_000_000);
    const price = new BigNumber(2);
    const xykPoolInstance = await xykPool.createPool(assetPair, assetAAmount, price);
    if(!xykPoolInstance) return
    await xykPoolInstance.buy();
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);  