import {Field, ObjectType, Resolver} from "type-graphql"
import {TestBlock as TestBlockModel} from './../generated/model/testBlock.model';
import {entityOverTimeResolverFactory} from "./factory";

/**
 * To define a custom over time resolver for a new entity, you first
 * need to define an @ObjectType() to be served as a response from your resolver.
 *
 * Then you can create a new class that extends a generic over time resolver class from
 * the factory.
 */
@ObjectType()
export class TestBlock {

    @Field({nullable: false})
    block_height!: bigint

    @Field({nullable: false})
    created_at!: Date

    constructor(props: any) {
        Object.assign(this, props);
    }
}

@Resolver()
export class TestBlockOverTimeResolver extends entityOverTimeResolverFactory<TestBlock>(
    TestBlock,
    TestBlockModel,
    'testBlocksOverTime',
    'test_block'
) {
}
