import {Resolver} from "type-graphql"
import {TestBlock as TestBlockModel} from './generated/model/testBlock.model';
import {entityOverTimeResolverFactory} from "./resolvers/factory";

import {TestBlock} from './resolvers/test.resolver';


@Resolver()
export class TestBlockOverTimeResolver extends entityOverTimeResolverFactory<TestBlock>(
    TestBlock,
    TestBlockModel,
    'testBlocksOverTime',
    'test_block'
) {
}
