import { DatabaseManager } from '@subsquid/hydra-common';
import { EntityConstructor } from './types';

/**
 * Get or Create the provided entity with the given ID
 * 
 * Note: you need to persist/save the entity yourself
 */
export async function ensure<T extends {id: string}>(
    store: DatabaseManager,
    entityConstructor: EntityConstructor<T>,
    id: string,
    init: Partial<T>
): Promise<T> {

    // attempt to get the entity from the database
    let entity = await store.get(entityConstructor, {
        where: { id },
    });

    // if the entity does not exist, construct a new one
    // and assign the provided ID to it
    if (entity == null) {
        entity = new entityConstructor()
        entity.id = id
        Object.assign(entity, init)
    }

    return entity;
};