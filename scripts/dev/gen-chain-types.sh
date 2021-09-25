#!/bin/bash

set -e

mkdir -p chain/default

npx ts-node --skip-project node_modules/.bin/polkadot-types-from-defs \
  --input chain \
  --package chain
