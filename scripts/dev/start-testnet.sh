mkdir -p logs
cd ./logs
nohup ../node_modules/polkadot-launch/dist/cli.js ../scripts/testnet-config.json > /dev/null &

LINK="https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9988#/explorer"
echo "Open $LINK in your browser to explore the local testnet"

# TODO: add a wait-until-ready script for the local testnet