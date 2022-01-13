import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Basilisk } from './api';
import { get12DecimalsFormat, getSigner, saveXykMigration } from './utils';
import { assetPair } from './types';
import { BigNumber } from 'bignumber.js';
import { pool } from './types';

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
                            console.log('tx hash is broadcast:', status.hash.toString());
                        }
                        if (status.isInBlock) {
                            console.log('tx hash is in block:', status.hash.toString());
                        }
                        if (status.isFinalized) {
                            console.log('tx hash is finalized:', status.hash.toString());
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
        buy: async function (signer?: KeyringPair) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const unsub = await this.api.tx.xyk
                        .buy(
                            this.assetPair.assetA, // assetOut
                            this.assetPair.assetB, // assetIn
                            '100000', // amount
                            '205000', // max limit
                            false //discount
                        )
                        .signAndSend(signer ?? this.signer, ({ events = [], status, dispatchError }) => {
                            events.forEach(
                                ({
                                    event: { data, method, section },
                                    phase,
                                }) => {
                                    if (method === 'ExtrinsicFailed') {
                                        unsub();
                                        reject(1);
                                    }
                                    if (section === 'xyk' && method == 'BuyExecuted') {
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
                            if (dispatchError) {
                                console.log(
                                    'dispatchError',
                                    api.registry.findMetaError(
                                        dispatchError.asModule
                                    )
                                );
                                reject();
                            }
                        });
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
        },
        addLiquidity: async function () {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const unsub = await this.api.tx.xyk
                        .addLiquidity(
                            this.assetPair.assetA, // assetA
                            this.assetPair.assetB, // assetB
                            '10000', // amount
                            '22000', // amount B max limit
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
                                    if (section === 'xyk' && method == 'LiquidityAdded') {
                                        console.log(
                                            '[1/1] >>> Liquidity added to XYK Pool.'
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
        sell: async function (signer?: KeyringPair) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const unsub = await this.api.tx.xyk
                        .sell(
                            this.assetPair.assetA, // assetIn
                            this.assetPair.assetB, // assetOut
                            '205000', // amount
                            '100000', // max limit
                            false //discount
                        )
                        .signAndSend(signer ?? this.signer, ({ events = [], status, dispatchError }) => {
                            events.forEach(
                                ({
                                    event: { data, method, section },
                                    phase,
                                }) => {
                                    if (method === 'ExtrinsicFailed') {
                                        unsub();
                                        reject(1);
                                    }
                                    if (section === 'xyk' && method == 'SellExecuted') {
                                        console.log(
                                            '[1/1] >>> Sell executed on XYK Pool.'
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
                            if (dispatchError) {
                                console.log(
                                    'dispatchError',
                                    api.registry.findMetaError(
                                        dispatchError.asModule
                                    )
                                );
                                reject();
                            }
                        });
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
        },
    };
};

const loadXyk = (pool: pool, api: ApiPromise, signer: KeyringPair) => {
    const assetPair: assetPair = {
        assetA: pool.assetAId,
        assetB: pool.assetBId,
    };
    const xykInstance = xyk(assetPair, api, signer);
    xykInstance.address = pool.address;
    xykInstance.assetABalance12e;
    xykInstance.assetBBalance12e;
    return xykInstance;
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
    loadPool: async function (pool: pool) {
        const api = await Basilisk.getInstance();
        if(!api) throw(`Can't load Basilisk API`)
        const signer = getSigner();

        return loadXyk(pool, api!, signer);
    },
};
