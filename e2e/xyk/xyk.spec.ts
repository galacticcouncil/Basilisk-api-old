import { expect } from 'chai';
import { DBClient } from '../../src/utils/db/setup';
import { assetAAmount as assetABalance, assetBAmount as assetBBalance} from '../../migrations/helpers/xyk';

describe('Integration XYK', () => {
    let client: any;

    before(async () => {
        client = await DBClient.getInstance();
    });

    // TODO read address from migration
    const xykPoolAddress = 'bXn6KCrv8k2JV7B2c5jzLttBDqL4BurPCTcLa3NQk5SWDVXCJ';
    it('can handle xyk.PoolCreated event', async () => {
        await client.test(
            `
                query MyQuery {
                    xYKPools {
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
                        assetAId: '0',
                        assetBId: '1',
                    },
                ],
            }
        );
    });

    // TODO replace expected values with migration storage, see https://github.com/galacticcouncil/Basilisk-api/issues/18
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
                        assetABalance,
                        assetBBalance,
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
