
export $(grep -v '^#' .env | xargs)

set -e

docker network inspect basilisk-wrapper-network >/dev/null 2>&1 || \
    docker network create basilisk-wrapper-network

chmod -R 777 ./scripts/dev/wait-for-log-message.sh
. ./scripts/dev/wait-for-log-message.sh


testnet_sandbox_logfile=$(mktemp)

docker-compose -f ./testnet-sandbox/testnet-sandbox-compose.yml -p basilisk-testnet-sandbox up 2>&1 | tee "${testnet_sandbox_logfile}" &

message='POLKADOT LAUNCH COMPLETE'
echo Basilisk testnet sandbox success trigger message:: "$message"
wait_for_log_message "${testnet_sandbox_logfile}" "$message"

echo ">>> Basilisk testnet sandbox has been launched successfully! >>>"
rm -f "${testnet_sandbox_logfile}"

while ! nc -z localhost 9988; do
  sleep 1 # wait for 1 second before check again
  echo "Waiting for port 9988 ..."
done

echo "Port 9988 is open."

yarn processor:clean-and-setup-testnet-sandbox

WS_PROVIDER_ENDPOINT_HOST=polkadot-basilisk-testnet-sandbox docker-compose -f ./indexer/docker-compose.yml -f dockerized-network.yml -p basilisk-indexer up -d