import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Basilisk } from './api';
import { get12DecimalsFormat, getSigner, saveXykMigration } from './utils';
import { assetPair } from './types';
import { BigNumber } from 'bignumber.js';

const xyk = (assetPair: assetPair, api: ApiPromise, signer: KeyringPair) => {
    return {
        assetPair,
        assetABalance12e: '',
        assetBBalance12e: '',
        address: '',
        signer,
        api,
        createPool: async function (assetAAmount: BigNumber, price: BigNumber) {
            // create pool tx
            const priceE18 = price.multipliedBy(new BigNumber('10').pow('18')); // add 18 decimals
            this.assetABalance12e =
                get12DecimalsFormat(assetAAmount).toString();
            this.assetBBalance12e = assetAAmount
                .multipliedBy(get12DecimalsFormat(price))
                .toString();

            const tx = await this.api.tx.xyk.createPool(
                this.assetPair.assetA,
                this.assetPair.assetB,
                this.assetABalance12e,
                priceE18.toString() // initialPrice
            );
            // sign and announce tx
            await new Promise<void>(async (resolve, reject) => {
                await tx.signAndSend(
                    this.signer,
                    {},
                    ({ status, events: _events, dispatchError }) => {
                        if (status.isBroadcast) {
                            console.log('tx hash:', status.hash.toString());
                        }
                        if (status.isFinalized) {
                            _events.forEach(
                                ({
                                    event: { data, method, section },
                                    phase,
                                }) => {
                                    if (
                                        section === 'xyk' &&
                                        method == 'PoolCreated'
                                    ) {
                                        // save xyk pool address
                                        this.address = data[5].toString();

                                        console.log(
                                            '[1/1] >>> Pool has been created with address - ',
                                            this.address
                                        ),
                                            saveXykMigration({
                                                address: this.address,
                                                assetAId: this.assetPair.assetA,
                                                assetBId: this.assetPair.assetB,
                                                assetABalance:
                                                    this.assetABalance12e,
                                                assetBBalance:
                                                    this.assetBBalance12e,
                                            });
                                    }
                                }
                            );
                            resolve();
                        }
                        if (dispatchError) {
                            console.log(
                                'dispatchError',
                                api.registry.findMetaError(
                                    dispatchError.asModule
                                )
                            );
                            reject();
                        }
                    }
                );
            });
        },
        buy: async function () {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const unsub = await this.api.tx.xyk
                        .buy(
                            this.assetPair.assetA, // assetOut
                            this.assetPair.assetB, // assetIn
                            '10000', // amount
                            '20500', // max limit
                            false //discount
                        )
                        .signAndSend(this.signer, ({ events = [], status }) => {
                            events.forEach(
                                ({
                                    event: { data, method, section },
                                    phase,
                                }) => {
                                    if (method === 'ExtrinsicFailed') {
                                        unsub();
                                        reject(1);
                                    }
                                    if (section === 'xyk' && method == 'Buy') {
                                        console.log(
                                            '[1/1] >>> Buy executed on XYK Pool.'
                                        );
                                        unsub();
                                        resolve();
                                    }
                                }
                            );

                            if (status.isFinalized) {
                                unsub();
                                resolve();
                            }
                        });
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
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
    createPool: async function (
        assetPair: assetPair,
        assetAAmount: BigNumber,
        price: BigNumber
    ) {
        const api = await Basilisk.getInstance();
        if (!api) return;
        const signer = getSigner();
        const xykPool = xyk(assetPair, api, signer);

        await xykPool.createPool(assetAAmount, price);

        return xykPool;
    },
};
