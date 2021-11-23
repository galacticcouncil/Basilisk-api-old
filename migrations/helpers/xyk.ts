import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Basilisk } from './api';
import { getSigner } from './utils';
import { assetPair } from './types';
import { BigNumber } from 'bignumber.js';

export const assetAAmount = new BigNumber('1000000')
    .multipliedBy(new BigNumber('10').pow('12'))
    .toString();

export const assetBAmount = new BigNumber('2')
    .multipliedBy(new BigNumber('10').pow('18'))
    .toString();

const xyk = (assetPair: assetPair, api: ApiPromise, signer: KeyringPair) => {
    return {
        assetPair,
        signer,
        api,
        createPool: async function () {
            // create pool tx
            const tx = await this.api.tx.xyk.createPool(
                this.assetPair.assetA,
                this.assetPair.assetB,
                assetAAmount, // assetAAmount = 10 000
                assetBAmount // initialPrice
            );
            // sign and announce tx
            await new Promise<void>(async (resolve, reject) => {
                await tx.signAndSend(
                    this.signer, 
                    {},
                    ({status, events: _events, dispatchError}) => {
                        if(status.isBroadcast) {
                            console.log('tx hash:', status.hash.toString())
                        }
                        if(status.isFinalized) {
                            console.log('operation finalized')
                            resolve()
                        }
                        if(dispatchError){
                            console.log('dispatchError', api.registry.findMetaError(dispatchError.asModule))
                            reject()
                        }
                    }
                );
            });
        },
        buy: async function () {
            const tx = await this.api.tx.xyk.buy(
                this.assetPair.assetA, // assetOut
                this.assetPair.assetB, // assetIn
                '10000', // amount
                '10000', // max limit
                false //discount
            );
            await tx.signAndSend(this.signer);
        },
        sell: async function () {
            const tx = await this.api.tx.xyk.sell(
                this.assetPair.assetB, // assetOut
                this.assetPair.assetA, // assetIn
                '10000', // amount
                '10000', // max limit
                false //discount
            );
            await tx.signAndSend(this.signer);
        },
    };
};

export default {
    createPool: async function (assetPair: assetPair) {
        const api = await Basilisk.getInstance();
        if (!api) return;
        const signer = getSigner();
        const xykPool = xyk(assetPair, api, signer);

        await xykPool.createPool();

        return xykPool;
    },
};
