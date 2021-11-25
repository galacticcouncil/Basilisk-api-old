import { Resolver } from 'type-graphql';
import { entityOverTimeResolverFactory } from './resolvers/factory';
import { HistoricalBalance } from './resolvers/model/historicalBalance.model';
import {
    HistoricalBalanceLBP as HistoricalBalanceLBPModel,
    HistoricalBalanceXYK as HistoricalBalanceXykModel,
} from './generated/model';

@Resolver()
export class HistoricalBalancesLbpGroupedResolver extends entityOverTimeResolverFactory<HistoricalBalance>(
    HistoricalBalance,
    HistoricalBalanceLBPModel,
    'historicalBalancesLbpGrouped',
    'historical_balance_lbp',
    'pool_id'
) {}

@Resolver()
export class HistoricalBalancesXykGroupedResolver extends entityOverTimeResolverFactory<HistoricalBalance>(
    HistoricalBalance,
    HistoricalBalanceXykModel,
    'historicalBalancesXykGrouped',
    'historical_balance_xyk',
    'pool_id'
) {}
