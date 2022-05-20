set -e

docker ps -q --filter "name=db-processor" | grep -q . && docker stop db-processor && docker rm -fv db-processor

rm -rf db src/generated src/types

npm run processor:codegen
npm run processor:typegen
npm run build

docker network inspect basilisk-wrapper-network >/dev/null 2>&1 || \
    docker network create basilisk-wrapper-network

docker-compose -f processor-docker-compose.yml -f dockerized-network.yml -p basilisk-processor up -d db-processor
sleep 5

npm run processor:migrate
npm run processor:db:create-migration initial
npm run processor:db:migrate
