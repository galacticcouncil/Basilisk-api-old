
export $(grep -v '^#' .env | xargs)

set -e

docker-compose -f ./testnet-sandbox/testnet-sandbox-compose.yml -p basilisk-testnet-sandbox stop

docker-compose -f processor-docker-compose.yml -f dockerized-network.yml -p basilisk-processor stop

docker-compose -f ./indexer/docker-compose.yml -f dockerized-network.yml -p basilisk-indexer stop
