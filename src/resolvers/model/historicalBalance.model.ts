import { Field, ObjectType } from 'type-graphql';

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
