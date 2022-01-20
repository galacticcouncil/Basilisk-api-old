import { ApiPromise } from '@polkadot/api';
import { AddressOrPair } from '@polkadot/api/types';
import { KeyringPair } from '@polkadot/keyring/types';
import BigNumber from 'bignumber.js';
import { toBasiliskFormattedAddress } from '../../src/utils/account';
import { Basilisk } from './api';
import { assetPair, pool } from './types';
import { get12DecimalsFormat, getSigner, saveLbpMigration } from './utils';

const lbp = (assetPair: assetPair, api: ApiPromise, signer: KeyringPair) => {
    return {
        assetPair,
        api,
        signer,
        address: '',
        assetABalance12e: '',
        assetBBalance12e: '',
        getSignerAddress: function (): string {
            return toBasiliskFormattedAddress(this.signer.address);
        },
        createPool: async function (
            assetAAmount: BigNumber,
            assetBAmount: BigNumber
        ): Promise<AddressOrPair> {
            return new Promise<AddressOrPair>(async (resolve, reject) => {
                try {
                    const aliceAddress = await toBasiliskFormattedAddress(
                        signer.address
                    );
                    this.assetABalance12e =
                        get12DecimalsFormat(assetAAmount).toString();
                    this.assetBBalance12e =
                        get12DecimalsFormat(assetBAmount).toString();

                    const tx = await this.api.tx.lbp.createPool(
                        aliceAddress,
                        this.assetPair.assetA,
                        this.assetABalance12e,
                        this.assetPair.assetB,
                        this.assetBBalance12e,
                        '10000000',
                        '90000000',
                        'Linear',
                        ['1', '10'], // numerator, denominator
                        aliceAddress,
                        '0'
                    );
                    const unsub = await this.api.tx.sudo
                        .sudo(tx)
                        .signAndSend(
                            signer as AddressOrPair,
                            ({ events = [], status }) => {
                                if (status.isInBlock || status.isFinalized) {
                                    events
                                        // We know this tx should result in `Sudid` event.
                                        .filter(({ event }) =>
                                            this.api.events.sudo.Sudid.is(event)
                                        )
                                        .forEach(
                                            ({
                                                event: {
                                                    data: [result],
                                                },
                                            }) => {
                                                // Now we look to see if the extrinsic was actually successful or not...
                                                // @ts-ignore
                                                if (result.isError) {
                                                    unsub();
                                                    reject(1);
                                                }
                                            }
                                        );

                                    events.forEach(
                                        ({
                                            event: { data, method, section },
                                            phase,
                                        }) => {
                                            if (
                                                section === 'lbp' &&
                                                method == 'PoolCreated'
                                            ) {
                                                unsub();
                                                // set pool's address
                                                const poolAddress = data[0].toString();
                                                this.address = poolAddress;
                                                saveLbpMigration({
                                                    address: this.address,
                                                    assetAId:
                                                        this.assetPair.assetA,
                                                    assetBId:
                                                        this.assetPair.assetB,
                                                    assetABalance:
                                                        this.assetABalance12e,
                                                    assetBBalance:
                                                        this.assetBBalance12e,
                                                });
                                                resolve(poolAddress);
                                            }
                                        }
                                    );
                                }
                            }
                        );
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
        },
        updatePool: async function (offsetBlocks: {
            start: number;
            end: number;
        }) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const relayChainBlockHeight =
                        await Basilisk.getBlockHeightRelayChain();
                    const start = relayChainBlockHeight!.plus(
                        offsetBlocks.start
                    );
                    const end = relayChainBlockHeight!.plus(offsetBlocks.end);

                    const unsub = await this.api.tx.lbp
                        .updatePoolData(
                            this.address,
                            null,
                            start.toString(),
                            end.toString(),
                            null,
                            null,
                            null,
                            null,
                            null
                        )
                        .signAndSend(
                            signer as AddressOrPair,
                            ({ events = [], status }) => {
                                events.forEach(
                                    ({
                                        event: { data, method, section },
                                        phase,
                                    }) => {
                                        if (method === 'ExtrinsicFailed') {
                                            unsub();
                                            reject(1);
                                        }
                                        if (
                                            section === 'lbp' &&
                                            method == 'PoolUpdated'
                                        ) {
                                            console.log(
                                                '[2/2] >>> Pool has been updated successfully.'
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
                            }
                        );
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
        },
        buy: async function (signer?: KeyringPair) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const unsub = await this.api.tx.lbp
                        .buy(
                            this.assetPair.assetA, // assetOut
                            this.assetPair.assetB, // assetIn
                            '100000', // amount
                            '200000', // max limit
                        )
                        .signAndSend(signer ?? this.signer, ({ events = [], status }) => {
                            events.forEach(
                                ({
                                    event: { data, method, section },
                                    phase,
                                }) => {
                                    if (method === 'ExtrinsicFailed') {
                                        unsub();
                                        reject(1);
                                    }
                                    if (section === 'lbp' && method == 'BuyExecuted') {
                                        console.log(
                                            '[1/1] >>> Buy executed on LBP Pool.'
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
    };
};

const loadLbp = (pool: pool, api: ApiPromise, signer: KeyringPair) => {
    const assetPair: assetPair = {
        assetA: pool.assetAId,
        assetB: pool.assetBId,
    };
    const lbpPool = lbp(assetPair, api, signer);
    
    lbpPool.address = pool.address;
    lbpPool.assetABalance12e = pool.assetABalance;
    lbpPool.assetBBalance12e = pool.assetBBalance;

    return lbpPool;
};


export default {
    createPool: async function (
        assetPair: assetPair,
        assetAAmount: BigNumber,
        assetBAmount: BigNumber
    ) {
        const api = await Basilisk.getInstance();
        if (!api) return;
        const signer = getSigner();
        const lbpPool = lbp(assetPair, api, signer);

        await lbpPool.createPool(assetAAmount, assetBAmount);
        console.log(
            '[1/2] >>> Pool has been created with address - ',
            lbpPool.address
        );

        return lbpPool;
    },
    loadPool: async function (pool: pool) {
        const api = await Basilisk.getInstance();
        if (!api) throw `Can't load Basilisk API`;
        const signer = getSigner();

        return loadLbp(pool, api!, signer);
    },
};

