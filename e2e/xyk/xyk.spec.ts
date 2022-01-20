import { expect } from 'chai';
import { DBClient } from '../../src/utils/db/setup';
import migration from '../../pools/xyk/xyk.json';

describe('Integration XYK', () => {
    let client: any;

    before(async () => {
        client = await DBClient.getInstance();
    });

    const xykPoolAddress = migration.address;
    it('can handle xyk.PoolCreated event', async () => {
        await client.test(
            `
            query MyQuery {
                xYKPools(where: {id_eq: "${xykPoolAddress}"}) {
                    id
                    assetAId
                    assetBId
                }
            }
        `,
            {
                xYKPools: [
                    {
                        id: xykPoolAddress,
                        assetAId: migration.assetAId,
                        assetBId: migration.assetBId,
                    },
                ],
            }
        );
    });

    it('can create historical balances', async () => {
        const response = await client.query(
            `
            query MyQuery {
                historicalBalanceXYKs(where: {pool: {id_eq: "${xykPoolAddress}"}}) {
                    assetABalance
                    assetBBalance
                }
            }              
        `
        );
        expect(response.data.historicalBalanceXYKs).to.be.an('array').and.not.be
            .empty;
    });

    it('can handle balances.Transfer and tokens.Transfer events and keeps track of the pools balance', async () => {
        await client.test(
            `
            query MyQuery {
                xYKPools(where: {id_eq: "${xykPoolAddress}"}) {
                    assetABalance
                    assetBBalance
                }
            }
        `,
            {
                xYKPools: [
                    {
                        assetABalance: '1000000000000315000', // this value is taken from chain state after migration
                        assetBBalance: '1999999999999373662', // this value is taken from chain state after migration
                    },
                ],
            }
        );
    });

    describe('it can create historical volumes entries', () => {
        it('can create historical volume entry for XYK pool creation', async () => {
            await client.test(
                `
                query MyQuery {
                    historicalVolumeXYKs(where: {assetAAmountIn_not_eq: "0", assetAAmountOut_eq: "0", assetBAmountIn_not_eq:"0", assetBAmountOut_eq: "0"}) {
                        assetAAmountIn
                        assetAAmountOut
                        assetBAmountIn
                        assetBAmountOut
                      }
                }
            `,
                {
                    historicalVolumeXYKs: [
                        {
                            assetAAmountIn: migration.assetABalance,
                            assetAAmountOut: '0',
                            assetBAmountIn: migration.assetBBalance,
                            assetBAmountOut: '0',
                        },
                    ],
                }
            );
        });

        it('can create historical volume entry for XYK sell and buy in the same block', async () => {
            await client.test(
                `
                query MyQuery {
                    historicalVolumeXYKs(where: {assetBAmountOut_not_eq: "0", assetBAmountIn_not_eq: "0"}) {
                        assetAAmountIn
                        assetAAmountOut
                        assetBAmountIn
                        assetBAmountOut
                      }
                }
            `,
                {
                    historicalVolumeXYKs: [
                        {
                            assetAAmountIn: '205000',
                            assetAAmountOut: '100000',
                            assetBAmountIn: '200401',
                            assetBAmountOut: '409180',
                        },
                    ],
                }
            );
        });

        it('can create historical volume entry for XYK two buy events in the same block', async () => {
            await client.test(
                `
                query MyQuery {
                    historicalVolumeXYKs(where: {assetAAmountIn_eq: "0", assetAAmountOut_not_eq:"0", assetBAmountOut_eq: "0", }) {
                        assetAAmountIn
                        assetAAmountOut
                        assetBAmountIn
                        assetBAmountOut
                      }
                }
            `,
                {
                    historicalVolumeXYKs: [
                        {
                            assetAAmountIn: '0',
                            assetAAmountOut: '200000',
                            assetBAmountIn: '400801',
                            assetBAmountOut: '0',
                        },
                    ],
                }
            );
        });

        it('can create historical volume entry for XYK two sell events in the same block', async () => {
            await client.test(
                `
                query MyQuery {
                    historicalVolumeXYKs(where: {assetAAmountIn_not_eq:"0", assetAAmountOut_eq: "0", assetBAmountIn_eq: "0"}) {
                        assetAAmountIn
                        assetAAmountOut
                        assetBAmountIn
                        assetBAmountOut
                      }
                }
            `,
                {
                    historicalVolumeXYKs: [
                        {
                            assetAAmountIn: '410000',
                            assetAAmountOut: '0',
                            assetBAmountIn: '0',
                            assetBAmountOut: '818360',
                        },
                    ],
                }
            );
        });
    });

    after(async () => {
        await DBClient.close();
    });
});
