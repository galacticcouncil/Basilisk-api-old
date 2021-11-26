import { Resolver } from 'type-graphql';
import { entityOverTimeResolverFactory } from './resolvers/factory';
import { HistoricalBalance } from './resolvers/model/historicalBalance.model';
import {
    HistoricalBalanceLBP as HistoricalBalanceLBPModel,
    HistoricalBalanceXYK as HistoricalBalanceXykModel,
} from './generated/model';

/**
 * Custom resolver to query a set of historical balances by
 * providing a time-range, the number of results and the poolId.
 */
@Resolver()
export class HistoricalBalancesLbpGroupedResolver extends entityOverTimeResolverFactory<HistoricalBalance>(
    HistoricalBalance,
    HistoricalBalanceLBPModel,
    'historicalBalancesLbpGrouped',
    'historical_balance_lbp',
    'pool_id'
) {}

/**
 * Custom resolver to query a set of historical balances by
 * providing a time-range, the number of results and the poolId.
 */
@Resolver()
export class HistoricalBalancesXykGroupedResolver extends entityOverTimeResolverFactory<HistoricalBalance>(
    HistoricalBalance,
    HistoricalBalanceXykModel,
    'historicalBalancesXykGrouped',
    'historical_balance_xyk',
    'pool_id'
) {}
