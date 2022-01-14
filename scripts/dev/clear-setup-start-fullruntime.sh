
chmod -R 777 ./scripts/dev/wait-for-log-message.sh
. ./scripts/dev/wait-for-log-message.sh

export $(grep -v '^#' .env | xargs)

set -e

docker network inspect basilisk-wrapper-network >/dev/null 2>&1 || \
    docker network create basilisk-wrapper-network

testnet_logfile=$(mktemp)

docker-compose -f ./testnet/testnet-docker-compose.yml -p basilisk-testnet up 2>&1 | tee "${testnet_logfile}" &

message='POLKADOT LAUNCH COMPLETE'
echo Basilisk testnet run success triger message:: "$message"
wait_for_log_message "${testnet_logfile}" "$message"

echo ">>> Basilisk testnet has been launched successfully! >>>"
rm -f "${testnet_logfile}"


yarn processor:clean-and-setup-single

WS_PROVIDER_ENDPOINT_HOST=polkadot-basilisk-testnet docker-compose -f ./indexer/docker-compose.yml -p basilisk-indexer up -d