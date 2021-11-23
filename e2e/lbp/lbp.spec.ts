import { expect } from 'chai';
import { useServer } from '../../src/utils/db/setup';

describe('Integration LBP', () => {
    const client = useServer();
    // TODO read address from migration
    const lbpPoolAddress = 'bXikYFVEuifjmPT3j41zwqwrGAJTzMv69weEqrvAotP9VfHxS';
    it('can handle lbp.PoolCreated event', async () => {
        await client.test(
            `
            query MyQuery {
                lBPPools {
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
                        assetAId: '0',
                        assetBId: '1',
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

    // TODO replace expected values with migration storage, see https://github.com/galacticcouncil/Basilisk-api/issues/18
    it('can handle balances.Transfer and tokens.Transfer events', async () => {
        await client.test(
            `
            query MyQuery {
                    lBPPools {
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
                        assetABalance: '10000000000000',
                        assetBBalance: '10000000000000',
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
                historicalBalanceLBPs(orderBy: pool_saleEndAtRelayChainBlockHeight_ASC) {
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
                historicalBalanceLBPs(where: {blockHeight: {relayChainBlockHeight_gte: ${lbpWithHighestSaleEndBlockHeight}}, pool: {saleEndAtRelayChainBlockHeight_gte: ${lbpWithHighestSaleEndBlockHeight}}}) {
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
        expect(response.data.historicalBalanceLBPs).to.be.an('array')
            .and.to.be.empty;
    });
});
