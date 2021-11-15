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
npm run testnet:start

# Start the local indexer targeting the basilisk node from the previous step
# If you need to debug the indexer, omit the `-d` option
npm run indexer:start -- -d

# Prepare the dev environment for the processor
npm run processor:clean-and-setup

# Start processing the indexed data
npm run processor:start

# Start graphql server for processed data
npm run processor:query-node:start
```

## Generate custom types

1. define custom types in `./chain/definitions.ts`
2. run `processor:gen-chain-types`

## Configuration

Project's configuration is driven by environment variables, defined in `.env`,
and `manifest.yml`. For more details see https://docs.subsquid.io.

## Local testnet

Run `npm run testnet:start` and visit the [Polkadot apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9988#/explorer) UI to observe new blocks being produced after a while.

## Development indexer

Run `npm run indexer:start` to start a local indexer, which will index the locally running Basilisk node.
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

Run `npm run processor:clean-and-setup` to setup the development environment. Then run `npm run processor:start` to start the processor.
