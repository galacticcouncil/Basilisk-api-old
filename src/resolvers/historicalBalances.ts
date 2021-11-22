import { Field, ObjectType, Resolver } from 'type-graphql';
import {
    HistoricalBalanceLBP as HistoricalBalanceLBPModel,
    HistoricalBalanceXYK as HistoricalBalanceXykModel,
} from '../generated/model';
import { entityOverTimeResolverFactory } from './factory';

@ObjectType()
export class HistoricalBalance {
    @Field({ nullable: false })
    asset_a_balance!: bigint;

    @Field({ nullable: false })
    asset_b_balance!: bigint;

    @Field({ nullable: false })
    created_at!: Date;

    @Field({ nullable: false })
    pool_id!: string;

    @Field({ nullable: false })
    block_height_id!: string;

    constructor(props: any) {
        Object.assign(this, props);
    }
}

@Resolver()
export class historicalBalancesLbpGroupedResolver extends entityOverTimeResolverFactory<HistoricalBalance>(
    HistoricalBalance,
    HistoricalBalanceLBPModel,
    'historicalBalancesLbpGrouped',
    'historical_balance_lbp',
    'pool_id'
) {}

@Resolver()
export class historicalBalancesXykGroupedResolver extends entityOverTimeResolverFactory<HistoricalBalance>(
    HistoricalBalance,
    HistoricalBalanceXykModel,
    'historicalBalancesXykGrouped',
    'historical_balance_xyk',
    'pool_id'
) {}
