
export $(grep -v '^#' .env | xargs)

set -e

docker-compose -f ./testnet-sandbox/testnet-sandbox-compose.yml -p basilisk-testnet-sandbox down

docker-compose -f processor-docker-compose.yml -f dockerized-network.yml -p basilisk-processor down

docker-compose -f ./indexer/docker-compose.yml -f dockerized-network.yml -p basilisk-indexer down

docker network inspect basilisk-wrapper-network >/dev/null 2>&1 || \
    docker network rm basilisk-wrapper-network