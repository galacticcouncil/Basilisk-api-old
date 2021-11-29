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

    it('can handle balances.Transfer and tokens.Transfer events', async () => {
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
                        assetABalance: migration.assetABalance,
                        assetBBalance: migration.assetBBalance,
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

    after(async () => {
        await DBClient.close();
    });
});
