#!/bin/bash

set -e

mkdir -p src/chain/default

npx ts-node --skip-project node_modules/.bin/polkadot-types-from-defs \
  --input src/chain \
  --package "."
