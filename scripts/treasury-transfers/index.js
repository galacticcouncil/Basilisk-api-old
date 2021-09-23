const fetch = require('node-fetch');
const {ApiPromise, WsProvider} = require("@polkadot/api");
const types = require("../../types.json");
const typesAlias = require("../../typesAlias.json");
const { BN } = require('bn.js');

const treasury = "7L53bUTBopuwFt3mKUfmkzgGLayYa1Yvn1hAg9v5UMrQzTfh";
const indexer = 'http://localhost:4012/v1/graphql';
const archive = 'ws://localhost:9988';

const treasuryTransfers = {
    operationName: 'Transfers',
    variables: {account: treasury},
    query:`query Transfers($account: String) {
    substrate_event(where: { 
      _and: [
        {name: {_eq: "balances.Transfer"}},
        {_or: [
          {data: {_contains: {param0: {value: $account}}}},
          {data: {_contains: {param1: {value: $account}}}}
        ]}
      ]
    }) {
      blockNumber
      indexInBlock
      data
      extrinsic {
        name
        id
      }
    }
  }
`};

const eraPayouts = {
    operationName: 'EraPayouts',
    variables: {},
    query:`query EraPayouts {
        substrate_event(where: { 
          name: {_eq: "staking.EraPayout"}
        }) {
          blockNumber
          indexInBlock
          data
        }
      }
`};

const queryGraph = q => fetch(indexer, {method: 'post', body: JSON.stringify(q),}).then(r => r.json()).catch(console.err);

async function main() {
    const provider = new WsProvider(archive);
    const [{data: {substrate_event: events}}, {data: {substrate_event: payoutEvents}}, api] = await Promise.all([
        queryGraph(treasuryTransfers),
        queryGraph(eraPayouts),
        ApiPromise.create({
            provider,
            types,
            typesAlias
        })
    ]);
    const initialHash = await api.rpc.chain.getBlockHash(0);
    let {data: {free}} = await api.query.system.account.at(initialHash, treasury);
    const toBalance = bn => api.createType('Balance', bn);
    const transfers = events.map(o => ({
        ...o,
        value: toBalance(o.data.param2.value),
        from: o.data.param0.value,
        to: o.data.param1.value,
        dir: o.data.param0.value === treasury ? 'out' : 'in'
    }));
    let i = new BN(0);
    let o = new BN(0);
    transfers.forEach(({dir, value}) => {
        if (dir === 'out') {
            o = o.add(value.toBn());
        } else {
            i = i.add(value.toBn());
        }
    });

    const payouts = payoutEvents.reduce(({stakers, remainder}, {data: {param1, param2}}) => ({
        stakers: toBalance(param1.value).toBn().add(stakers),
        remainder: toBalance(param2.value).toBn().add(remainder)
    }), {
        stakers: new BN(0),
        remainder: new BN(0)
    });

    const b = free.toBn().add(i).add(payouts.remainder).sub(o);

    console.log('balance at initial block', free.toHuman());
    console.log('transfers in', toBalance(i).toHuman());
    console.log('transfers out', toBalance(o).toHuman());
    console.log('payouts to stakers', toBalance(payouts.stakers).toHuman());
    console.log('payouts remainder', toBalance(payouts.remainder).toHuman());
    console.log('indexed balance', toBalance(b).toHuman());
    console.log('balance in latest block', (await api.query.system.account(treasury)).data.free.toHuman());
}

main().then(() => process.exit(0)).catch(console.error)