#!/bin/sh

export $(grep -v '^#' .env | xargs)

set -e

docker network inspect basilisk-wrapper-network >/dev/null 2>&1 || \
    docker network create basilisk-wrapper-network

WS_PROVIDER_ENDPOINT_HOST=polkadot-basilisk-testnet docker-compose -f ./indexer/docker-compose.yml -f docker-compose.yml -f ./testnet/testnet-docker-compose.yml -p basilisk-testnet-processor-indexer up