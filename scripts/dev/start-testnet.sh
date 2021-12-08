cd ./../Basilisk-node/rococo-local
polkadot-launch config.json

LINK="https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9988#/explorer"
echo "Open $LINK in your browser to explore the local testnet"

# TODO: add a wait-until-ready script for the local testnet