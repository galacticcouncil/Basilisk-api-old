# Basilisk API

This project serves as the API for [Basilisk's](https://bsx.fi) UIs, Dashboards and analytics.

## Prerequisites

-   Node v16.x
-   Docker
-   Built [Basilisk node](https://github.com/galacticcouncil/Basilisk-node) in `./../Basilisk-node`
-   Built [Polkadot node](https://github.com/paritytech/polkadot) in `./../polkadot`

> ⚠️ Make sure to have both the `Basilisk-node` and `polkadot` accessible and built using `cargo build --release` in the aforementioned directories. Otherwise the testnet scripts available in `package.json` won't work.

## Quick start

```zsh
# Start the local basilisk testnet
yarn run testnet:start

# Start the local indexer targeting the basilisk node from the previous step
# If you need to debug the indexer, omit the `-d` option
yarn run indexer:start -- -d

# Prepare the dev environment for the processor
yarn run processor:clean-and-setup

# Start processing the indexed data
yarn run processor:start

# Start graphql server for processed data
yarn run processor:query-node:start
```

## Generate custom types

1. define custom types in `./chain/definitions.ts`
2. run `processor:gen-chain-types`

## Configuration

Project's configuration is driven by environment variables, defined in `.env`,
and `manifest.yml`. For more details see https://docs.subsquid.io.

## Local testnet

Run `yarn run testnet:start` and visit the [Polkadot apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9988#/explorer) UI to observe new blocks being produced after a while.

## Development indexer

Run `yarn run indexer:start` to start a local indexer, which will index the locally running Basilisk node.
Open [Graphiql Online](https://graphiql-online.com/graphiql) and use `http://localhost:4010/v1/graphql` as the GraphQL endpoint
to interact with the indexer.

You can run the following query to get started:

```
query MyQuery {
  indexerStatus {
    inSync
    lastComplete
    chainHeight
  }
}
```

### Apple M1 support

For Apple M1 support you need to build the indexer docker image locally:

```
git clone clone https://github.com/subsquid/hydra
cd hydra && ./scripts/docker-build.sh --target indexer-gateway -t subsquid/hydra-indexer-gateway:4
```

## Development processor

Run `yarn run processor:clean-and-setup` to setup the development environment. Then run `yarn run processor:start` to start the processor.

## Entity over time resolver

Resolvers have to be placed in the same module called `server-extension` ( `src/server-extension.ts` )

A generic factory is provided in order to simplify creation of 'Entity Over Time' resolvers. ( `src/resolvers/factory.ts` )

Model used in this resolver has to have at least one timestamp field.

Creating new resolver is simple as creating new class in the server-extension module:

```typescript

@Resolver()
export class TestBlockOverTimeResolver extends entityOverTimeResolverFactory<TestBlock>(
    EntityType,
    EntityModel,
    'resolverName',
    'db_name',
    'time_fieldname'
) {
}
```

### Parameters:

- `EntityType` is ObjectType class which will be returned from the resolver,eg:

```typescript
@ObjectType()
export class EntityType{

    @Field({nullable: false})
    block_height!: bigint

    @Field({nullable: false})
    created_at!: Date

    constructor(props: any) {
        Object.assign(this, props);
    }
}
```

- `EntityModel` is Entity type class representing model in the DB. This should be auto-generated from the given graphql schema. Eg:

```typescript
@Entity_()
export class EntityModel{
  constructor(props?: Partial<TestBlock>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  blockHeight!: bigint

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date
}
```

- `db_name` is exact table name in the database.
- `time_fieldname` is exact field name of timestamp field in the table.

## Testing

Make sure to have Basilisk-node with XYK pools enabled. Use `make build` to build `releases/testing-basilisk` binary and launch in `rococo-local` folder `polkadot-launch testing-config.json`.

Do not run `yarn run processor:query-node:start`, because we need to keep port `4000` free.

```
# migrate test data
yarn run migrate:lbp
yarn run migrate:xyk

# start indexer and processor
yarn run processor:clean-and-setup
yarn run indexer:start
yarn run processor:start

# run all tests
yarn run test

# alternative
yarn run test:unit
yarn run test:e2e
```