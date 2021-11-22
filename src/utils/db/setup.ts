import { Client as PgClient, ClientBase, Pool } from 'pg';
import path from 'path';
import {
    ListeningServer,
    serve,
    ServerOptions,
} from '@subsquid/openreader/dist/server';

import { loadModel } from '@subsquid/openreader/dist/tools';
import { Client } from './client';

const db_config = () => {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
    };
};

async function withClient(
    block: (client: ClientBase) => Promise<void>
): Promise<void> {
    let client = new PgClient(db_config());
    await client.connect();
    try {
        await block(client);
    } finally {
        await client.end();
    }
}

export function databaseInit(sql: string[]): Promise<void> {
    return withClient(async (client) => {
        for (let i = 0; i < sql.length; i++) {
            await client.query(sql[i]);
        }
    });
}

export function deleteDBSchema(): Promise<void> {
    return withClient(async (client) => {
        await client.query(`TRUNCATE TABLE test_block`);
    });
}

export function useDatabase(sql: string[]): void {
    before(async () => {
        require('dotenv').config();
        await deleteDBSchema();
        await databaseInit(sql);
    });
}

export function useServer(): Client {
    const model = loadModel(path.join(__dirname, '../../../schema.graphql'));
    let extensionModule: string | undefined;
    try {
        extensionModule = require.resolve('../../resolvers/index.ts');
    } catch (e) {
        // ignore
    }

    let client = new Client('not defined');
    let db: Pool;
    let info: ListeningServer;

    before(async () => {
        require('dotenv').config();
        db = new Pool(db_config());
        const options: ServerOptions = {
            model,
            db,
            port: process.env.GRAPHQL_SERVER_PORT || 3000,
        };

        if (extensionModule) {
            await require('../../generated/type-graphql').setup(
                extensionModule,
                options
            );
        }
        info = await serve(options);
        client.endpoint = `http://localhost:${info.port}/graphql`;
    });
    after(() => info?.stop());
    after(() => db.end());
    return client;
}
