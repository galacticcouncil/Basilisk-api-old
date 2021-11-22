import {Arg, Query, Resolver} from "type-graphql";
import {getManager} from "typeorm";

function newEntity(entity: any) {
    return new (Function.prototype.bind.apply(entity, arguments as any));
}

const defaultTimeField = 'created_at';

export const entityOverTimeResolverFactory = <TObject>(
    entity: any,
    entityModel: any,
    entityName: string,
    table: string,
    where_field: string, // Additional field name tobe used in where condition ( only 1 field supported atm)
    timeField: string = defaultTimeField
) => {

    @Resolver()
    class EntityOverTimeResolver {

        public TABLE: string = table;
        public TIME_FIELD: string = timeField;

        chunkSizeInSeconds(from: string, to: string, quantity: number): number {

            if (quantity <= 0) {
                throw new Error("Invalid quantity.")
            }

            let diff = new Date(to).getTime() - new Date(from).getTime();

            if (diff < 0) {
                throw new Error("Incorrect range");
            }

            return diff / 1000 / quantity;
        }

        @Query(() => [entity])
        async [entityName](
            @Arg("quantity", {nullable: false}) quantity: number,
            @Arg("from", {nullable: false}) from: string,
            @Arg("to", {nullable: false}) to: string,
            @Arg(where_field, {nullable: true}) where?: string,
        ): Promise<TObject[]> {

            if (quantity <= 0) {
                throw new Error("Invalid quantity.")
            }

            // Simple validation - it throws "RangeError: Invalid date or time" error if invalid date is provided
            let start = new Date(from).toISOString();
            let end = new Date(to).toISOString();

            let manager = getManager();

            let queryParams = [from, to];
            let maybeCondition = "";

            if (where !== undefined ){
                maybeCondition= `AND ${where_field} = $3`;
                queryParams.push(where);
            }

            // How this was built: https://dbfiddle.uk/?rdbms=postgres_13&fiddle=b2a5aa63ddaf6ac8c773e5f9172724b9
            let results: any[] = await manager.getRepository(entityModel).query(`
                SELECT main_t.*
                FROM ${this.TABLE} AS main_t
                         INNER JOIN (
                    SELECT min(${this.TIME_FIELD}) AS min_time,
                           (EXTRACT(EPOCH FROM j_main_t.${this.TIME_FIELD})::integer/${this.chunkSizeInSeconds(start, end, quantity)}) AS bucket
                    FROM ${this.TABLE} AS j_main_t
                    WHERE (j_main_t.${this.TIME_FIELD} between $1  AND $2) ${maybeCondition}
                    GROUP BY bucket
                ) grouped_main_t ON main_t.${this.TIME_FIELD} = grouped_main_t.min_time
                ORDER BY main_t.${this.TIME_FIELD};
            `, queryParams);
            return results.map(result => (<any>newEntity)(entity, result));
        }
    }

    return EntityOverTimeResolver
}
