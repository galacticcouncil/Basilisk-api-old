set -e

docker-compose down
rm -rf db src/generated src/types

npm run processor:codegen
npm run processor:typegen
npm run build

docker-compose up -d db
sleep 1

npm run processor:migrate
npm run processor:db:create-migration initial
npm run processor:db:migrate
