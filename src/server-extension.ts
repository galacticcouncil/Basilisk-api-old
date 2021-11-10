import {Resolver, ObjectType, Field, Query, Arg} from "type-graphql"
import {InjectManager} from "typeorm-typedi-extensions"
import {EntityManager, getManager} from "typeorm"
import {TestBlock as Block} from "./generated/model/testBlock.model"

@ObjectType()
export class Entry{
  @Field({ nullable: false })
  height!: string

  @Field({ nullable: false })
  liquidity!: string

  @Field({ nullable: false })
  at!: string

  constructor(h: string,l: string, at: string) {
    this.height = h;
    this.liquidity = h;
    this.at = at;
  }
}

type QueryResult = {
  block_height: string,
  created_at: Date,
}

@Resolver()
export class LiquidityOverTimeResolver {
  TABLE: string = "test_block";
  TIME_FIELD: string = "created_at";

  constructor(
      @InjectManager() private db: EntityManager,
  ) {}

  chunk_size_in_seconds(from: string, to:string, quantity: number): number{

    let diff = new Date(to).getTime() - new Date(from).getTime();

    if (diff < 0){
      throw new Error("Incorrect range");
    }

    return diff / 1000 / quantity;
  }

  @Query(() => [Entry])
  async liquidityOverTime(
      @Arg("quantity", { nullable: false}) quantity: number,
      @Arg("from", { defaultValue: new Date().toISOString() }) from: string,
      @Arg("to", { defaultValue: new Date().toISOString()}) to: string,
  ): Promise<Entry[]> {

    let manager  = getManager(); // note: this.db does not work for some reason.

    let results:QueryResult[] = await manager.getRepository(Block).query(`

      SELECT
        b.*
      FROM
        ${this.TABLE} AS b
          INNER JOIN (
          SELECT
            min(${this.TIME_FIELD}) AS t, (EXTRACT(EPOCH FROM bb.${this.TIME_FIELD})::integer/${this.chunk_size_in_seconds(from,to,quantity)}) AS p
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

    return results.map(val => {
      return new Entry(val.block_height, "200", val.created_at.toISOString())
    })
  }
}