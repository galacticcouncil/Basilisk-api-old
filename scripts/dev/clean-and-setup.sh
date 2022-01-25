set -e

docker-compose -f processor-docker-compose.yml down
rm -rf db src/generated src/types

npm run processor:codegen
npm run processor:typegen
npm run build

docker-compose -f processor-docker-compose.yml up -d db-processor
sleep 5

npm run processor:migrate
npm run processor:db:create-migration initial
npm run processor:db:migrate
