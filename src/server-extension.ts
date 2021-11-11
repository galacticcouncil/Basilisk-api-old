import { Resolver, ObjectType, Field, Query, Arg, ID } from "type-graphql"
import { InjectManager } from "typeorm-typedi-extensions"
import { Entity, EntityManager, EntityTarget, getManager } from "typeorm"
import { TestBlock as TestBlockModel } from './generated/model/testBlock.model';

function newEntity(entity: any) {
  return new (Function.prototype.bind.apply(entity, arguments as any));
}

export const defaultTimeField = 'created_at';

export const entityOverTimeResolverFactory = <TObject>(
  entity: any,
  entityModel: any,
  entityName: string, 
  table: string,
  timeField: string = defaultTimeField
) => {
  @Resolver()
  class EntityOverTimeResolver {

    public TABLE: string = table;
    public TIME_FIELD: string = timeField;

    chunkSizeInSeconds(from: string, to: string, quantity: number): number {

      let diff = new Date(to).getTime() - new Date(from).getTime();

      if (diff < 0) {
        throw new Error("Incorrect range");
      }

      return diff / 1000 / quantity;
    }

    @Query(() => [entity])
    async [entityName](
      @Arg("quantity", { nullable: false }) quantity: number,
      @Arg("from", { defaultValue: new Date().toISOString() }) from: string,
      @Arg("to", { defaultValue: new Date().toISOString() }) to: string,
    ): Promise<TObject[]> {
      let manager = getManager();

      // How this was built: https://dbfiddle.uk/?rdbms=postgres_13&fiddle=b2a5aa63ddaf6ac8c773e5f9172724b9
      let results: any[] = await manager.getRepository(entityModel).query(`
        SELECT
          b.*
        FROM
          ${this.TABLE} AS b
            INNER JOIN (
            SELECT
              min(${this.TIME_FIELD}) AS t, (EXTRACT(EPOCH FROM bb.${this.TIME_FIELD})::integer/${this.chunkSizeInSeconds(from, to, quantity)}) AS p
            FROM
              ${this.TABLE} AS bb
            WHERE
              (bb.${this.TIME_FIELD} between '${from}' AND '${to}')
            GROUP BY p
          ) t
            ON
             b.${this.TIME_FIELD} = t.t
        ORDER BY b.${this.TIME_FIELD};
      `);

      return results.map(result => (<any>newEntity)(entity, result));
    }
  }

  return EntityOverTimeResolver
}

/**
 * To define a custom over time resolver for a new entity, you first
 * need to define an @ObjectType() to be served as a response from your resolver.
 * 
 * Then you can create a new class that extends a generic over time resolver class from
 * the factory.
 */
@ObjectType()
export class TestBlock {

  @Field({ nullable: false })
  block_height!: bigint

  @Field({ nullable: false })
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
) {}