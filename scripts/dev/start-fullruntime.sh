docker-compose -f ./testnet/docker-compose.yml up --detach

sleep 40

yarn processor:clean-and-setup

docker network inspect basilisk-wrapper-network >/dev/null 2>&1 || \
    docker network create basilisk-wrapper-network

WS_PROVIDER_ENDPOINT_HOST=polkadot_basilisk_testnet docker-compose -f ./indexer/docker-compose.yml up