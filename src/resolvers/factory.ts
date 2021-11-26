import { Arg, Query, Resolver } from 'type-graphql';
import { getManager } from 'typeorm';
import { defaultTimeField, millisecond } from '../constants';

/**
 * Creates a resolver that makes it possible to query on: 
 * A time-range for the createdAt field of the entities.
 * Provide an additional 'where' condition on one property.
 * 
 * @param entity the ObjectType class to be returned from the resolver.
 * @param entityModel represents the entity type class in the DB. Auto-generated from graphql schema.
 * @param entityName of the resolver.
 * @param table exact name of the table.
 * @param where_field exact field name of the optional 'where' query condition
 * @param timeField exact field name of timestamp field in the table.
 * @returns 
 */
export const entityOverTimeResolverFactory = <TObject>(
    entity: any,
    entityModel: any,
    entityName: string,
    table: string,
    where_field: string, // Additional field name to be used in where condition ( only 1 field supported atm)
    timeField: string = defaultTimeField
) => {
    @Resolver()
    class EntityOverTimeResolver {
        public TABLE: string = table;
        public TIME_FIELD: string = timeField;

        @Query(() => [entity])
        async [entityName](
            @Arg('quantity', { nullable: false }) quantity: number,
            @Arg('from', { nullable: false }) from: string,
            @Arg('to', { nullable: false }) to: string,
            @Arg(where_field, { nullable: true }) where?: string
        ): Promise<TObject[]> {
            throwsForInvalidQuantity(quantity);

            const chunkSizeInSeconds = getChunkSizeInSeconds(
                from,
                to,
                quantity
            );
            let queryParams = [from, to, chunkSizeInSeconds];

            // Additional 'where' condition for one property that is optional
            let maybeCondition = '';
            if (where !== undefined) {
                maybeCondition = `AND ${where_field} = $4`;
                queryParams = [...queryParams, where];
            }

            let manager = getManager();
            // How this was built: https://dbfiddle.uk/?rdbms=postgres_13&fiddle=b2a5aa63ddaf6ac8c773e5f9172724b9
            let results: any[] = await manager.getRepository(entityModel).query(
                `
                SELECT main_t.*
                FROM ${this.TABLE} AS main_t
                         INNER JOIN (
                    SELECT min(${this.TIME_FIELD}) AS min_time,
                           (EXTRACT(EPOCH FROM j_main_t.${this.TIME_FIELD})::integer/$3) AS bucket
                    FROM ${this.TABLE} AS j_main_t
                    WHERE (j_main_t.${this.TIME_FIELD} between $1 AND $2) ${maybeCondition}
                    GROUP BY bucket
                ) grouped_main_t ON main_t.${this.TIME_FIELD} = grouped_main_t.min_time
                ORDER BY main_t.${this.TIME_FIELD};
            `,
                queryParams
            );
            return results.map((result) => (<any>newEntity)(entity, result));
        }
    }

    return EntityOverTimeResolver;
};

/**
 * Calculates the length of each bucket or chunk in seconds.
 * 
 * @param from timestamp of query start
 * @param to timestamp of query stop
 * @param quantity number of chunks
 * @returns length of each chunk in seconds
 */
 export function getChunkSizeInSeconds(
    from: string,
    to: string,
    quantity: number
): number {
    throwsForInvalidQuantity(quantity);

    /**
     * Simple validation - it throws "RangeError: Invalid date or time"
     * error if invalid date is provided
     */
    let start = new Date(from).toISOString();
    let end = new Date(to).toISOString();

    let diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff < 0) {
        throw new Error('Incorrect range');
    }
    // Remove decimals for sql query, because it accepts only integer
    const chunkSizeInSeconds = Math.floor(diff / millisecond / quantity);

    return chunkSizeInSeconds;
}

function throwsForInvalidQuantity(quantity: number) {
    if (quantity <= 0) {
        throw new Error('Invalid quantity.');
    }
}

function newEntity(entity: any) {
    return new (Function.prototype.bind.apply(entity, arguments as any))();
}
