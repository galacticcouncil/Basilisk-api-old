import { expect } from 'chai';
import { DBClient } from '../../src/utils/db/setup';
import migration from '../../pools/lbp/lbp.json';

describe('Integration LBP', () => {
    let client: any;

    before(async () => {
        client = await DBClient.getInstance();
    });

    const lbpPoolAddress = migration.address;
    it('can handle lbp.PoolCreated event', async () => {
        await client.test(
            `
            query MyQuery {
                lBPPools(where: {id_eq: "${lbpPoolAddress}"}) {
                    id
                    assetAId
                    assetBId
                }
            }
        `,
            {
                lBPPools: [
                    {
                        id: lbpPoolAddress,
                        assetAId: migration.assetAId,
                        assetBId: migration.assetBId,
                    },
                ],
            }
        );
    });

    it('can handle lbp.PoolUpdated event', async () => {
        const response = await client.query(
            `
            query MyQuery {
                lBPPools(where: {id_eq: "${lbpPoolAddress}"}) {
                    saleEndAtRelayChainBlockHeight
                }
            }
        `
        );
        expect(response.data).to.have.nested.property(
            'lBPPools[0].saleEndAtRelayChainBlockHeight'
        );
    });

    it('can handle balances.Transfer and tokens.Transfer events', async () => {
        await client.test(
            `
            query MyQuery {
                lBPPools(where: {id_eq: "${lbpPoolAddress}"}) {
                        id
                        assetABalance
                        assetBBalance
                    }
                }
        `,
            {
                lBPPools: [
                    {
                        id: lbpPoolAddress,
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
                historicalBalanceLBPs(where: {pool: {id_eq: "${lbpPoolAddress}"}}) {
                    assetABalance
                    assetBBalance
                }
            }              
        `
        );
        expect(response.data.historicalBalanceLBPs).to.be.an('array').and.not.be
            .empty;
    });

    it('stops creating historical balances after sale has ended', async () => {
        const responseSaleEnded = await client.query(
            `
            query MyQuery {
                historicalBalanceLBPs(orderBy: pool_saleEndAtRelayChainBlockHeight_DESC) {
                    pool {
                        saleEndAtRelayChainBlockHeight
                    }
                }
            }     
        `
        );
        const lbpWithHighestSaleEndBlockHeight =
            responseSaleEnded.data.historicalBalanceLBPs[0].pool
                .saleEndAtRelayChainBlockHeight;
        const response = await client.query(
            `
            query MyQuery {
                historicalBalanceLBPs(where: {blockHeight: {relayChainBlockHeight_gt: ${lbpWithHighestSaleEndBlockHeight}}, pool: {saleEndAtRelayChainBlockHeight_gt: ${lbpWithHighestSaleEndBlockHeight}}}) {
                    pool {
                        saleEndAtRelayChainBlockHeight
                    }
                    blockHeight {
                        relayChainBlockHeight
                    }
                }
            }              
            `
        );
        expect(response.data.historicalBalanceLBPs).to.be.an('array').and.to.be
            .empty;
    });

    // Historical Volume
    it('can create a historical volume entry', async () => {
        const response = await client.query(`
            query MyQuery {
                historicalVolumeLBPs(where: {assetAAmountIn_not_eq: "0"}) {
                    assetAAmountIn
                    assetAAmountOut
                    assetBAmountIn
                    assetBAmountOut
                }
            }
        `);

        expect(response.data.historicalVolumeLBPs[0]).to.deep.equal({
            assetAAmountIn: '1000000000000000000',
            assetAAmountOut: '0',
            assetBAmountIn: '1000000000000000000',
            assetBAmountOut: '0',
        });
    });
});
