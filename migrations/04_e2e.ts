import BigNumber from 'bignumber.js';
import lbpPool from './helpers/lbp';
import xykPool from './helpers/xyk';
import { assetPair } from './helpers/types';
import { getSignerFromUri } from './helpers/utils';

async function main(): Promise<void> {
    // values
    const assetPairLBP: assetPair = { assetA: '0', assetB: '1' };
    const assetAAmount = new BigNumber(1_000_000);
    const assetBAmount = new BigNumber(1_000_000);

    // create LBP pool
    const lbpPoolInstance = await lbpPool.createPool(
        assetPairLBP,
        assetAAmount,
        assetBAmount
    );
    if (!lbpPoolInstance) return;

    // update pool
    const offsetBlocks = {
        start: 10,
        end: 200,
    };
    await lbpPoolInstance.updatePool(offsetBlocks);

    // create XYK pool
    const assetPairXYK: assetPair = { assetA: '0', assetB: '2' };
    const price = new BigNumber(2);
    const xykPoolInstance = await xykPool.createPool(assetPairXYK, assetAAmount, price);
    if(!xykPoolInstance) throw 'XYK pool migration failed'

    const signerBob = getSignerFromUri("//Bob");
    /**
     * Execute XYK buy and sell in the same block.
     * Test that volume entry has assetIn and assetOut.
     */
    const buyAlicePromise = xykPoolInstance.buy();
    const sellBobPromise = xykPoolInstance.sell(signerBob);
    await Promise.all([buyAlicePromise, sellBobPromise]);
    
    /**
     * Execute XYK buy twice in the same block.
     * Test that volume entry correctly adds up assetAmounts.
     */
    const buyAlice2Promise = xykPoolInstance.buy();
    const buyBobPromise = xykPoolInstance.buy(signerBob);
    await Promise.all([buyAlice2Promise, buyBobPromise]);
    
    /**
     * Execute XYK sell twice in the same block.
     * Test that volume entry correctly adds up assetAmounts.
     */
    const sellAlicePromise = xykPoolInstance.sell();
    const sellBob2Promise = xykPoolInstance.sell(signerBob);
    await Promise.all([sellAlicePromise, sellBob2Promise]);
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
