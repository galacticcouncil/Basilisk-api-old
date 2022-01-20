#!/bin/bash

chmod -R 777 ./scripts/ci/gh-actions-wait-for-log-message.sh
. ./scripts/ci/gh-actions-wait-for-log-message.sh

testnet_logfile=$(mktemp)
yarn testnet:start 2>&1 | tee "${testnet_logfile}" &

message='POLKADOT LAUNCH COMPLETE'
echo Basilisk testnet ran success trigger message:: "$message"
wait_for_log_message "${testnet_logfile}" "$message"

echo ">>> Basilisk testnet has been launched successfully! >>>"
rm -f "${testnet_logfile}"
