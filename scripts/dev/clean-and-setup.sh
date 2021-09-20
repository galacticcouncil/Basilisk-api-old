docker-compose down
rm -r db generated types

npm run processor:codegen
npm run processor:typegen

docker-compose up -d db
sleep 1

npm run processor:migrate
npm run processor:db:create-migration initial
npm run processor:db:migrate
