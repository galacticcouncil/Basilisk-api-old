import { Basilisk } from './helpers/api';
import { getSigner } from './helpers/utils';

const destinations = [
    // gets BSX
    'bXjjaSUwRkYdrnNgHarhhsSjAEDksAeSBh1miTicqUqk1Etes',
    'bXhsEJyKkZ3EenwDtUSQBE3tEAZA3kqLsCDL7Nsi6wuQ6g459',
    'bXmzE17bpRpyTi2EBJUCCGkpsdvVR9Y64cR7AT7iso7xKngcm',
    'bXhTQqUkQNYLjm3shLfiaWMfd9J8TAsjq5vjDzAhsYWdBVAER',
    'bXnJT8FfYPDGvbQBUYyamLTgjfPdupW2Wgv2iEwUcLkHFjQJa',
    'bXiQZ1DHnAqgjAEPpxTVFDYkHiTxggPaiU6atBBpuZFXVoYdG',
    'bXhxg5XurkmitqYGsPwGXQdXxQAKZYEaHvFjbVPY1kpLrW5ek',
    'bXhewYbSzN5LEGRURF5MRVQvUsSPoGNFRYvQF3H98wngtCWdn',
    'bXmzijr4BCpawjjUb8LrEEFqxLhNdcnNctuQthAqaaRjAVyur',
    'bXnM9g5zNFn8WD19m1CXksQ8PxT5YPqMV1TcmVJrSn9Cd5WxR',
    'bXjBWnwQJzMWHEQDmbK2LfbP5LLCw6Y9M2gPwsi4rYPsotvtw',
    'bXmuXqoMtUHZifvuiuHmJmHJQu3nnJ7h9Mca2N3TnknMQsWcD',
    'bXjaxaZ7U85gCM5tRsKKPn4WWQGxpddogxWtuPdZdZ4yPvK9N',
    'bXh6yqyq58KuJt7kXyLcLQSK5PaQKJ2nFsETFv4jrb2Qi7P1Z',
    'bXhy3oXPwXJLmvMk772Aa5iaLywRGGHTCn2AGCuXHbBkvrJmc',
    'bXk1AESn2a9venvNRDDYFGpTycYHQi7porGpjdxES4xQXRvpj',
    'bXmTE4ZgWSnbBZA82spbbrF1ebJxdDujRgAu4mc4oM8PUZcWA',
    'bXhndbrHDEHgDT6eAWjUvw4E5Yj6TCdk6bxL3oWgAaQMDG4hX',
    'bXi6iL5Q3kvPfoxnzx71k95yQCxAVKqFfZSh65FixjsqMyEyx',
    'bXkBpsV2uifcSEiqt5eLBVR1RuyRG9DDQ8jHsU1UEpFRggxoC',
    'bXjWFgjWDd96DXDxf6u1ymk4UuYNLNNRi6L8RKUnFtrovxXJC',
    'bXidt9FsvgKT9r33JSKFrxGDQVgLBTiPZR9yj2CUu6a5m5DrN',
    // gets DAI
    // 'bXm8L54ZP7nDH2G8anZa3wnVmoGhrj2PvdAqEQC96nw19kV9V',
    // 'bXgjRniTnZnr3FNF1B9a6iCczJ75CXSCLMJLudx7dGWFifZFU',
    // 'bXkMv1vhKmTyh7HKdFbcCA1iozQG7vi64W3vdzwVGMiNvH64L',
    // 'bXmuGgCzPY6yXqYpy1LMzr7Hk1ooUhU9EKSEuFpKig224Yq9V',
    // 'bXgn3ddvptNPqPqYvhvBYun9ZXfEToiuebz2NusdbUHfMZ2wj',
    // 'bXj4T35gmy9PZ7xuVvjcn9ST3Fu4upfswJq3vqChb7xGvk8aX',
    // 'bXiTT9xZYDsLarmdGuApTxCoiJDxmXKkfBo4PCsrua83rZ3Rm',
    // 'bXgsgqEHwZdtpShnu8yL2dTSkAZQ5wApuqsr7B7s5TNg5ijZK',
    // 'bXij57gYEQSm74uA3mKzPM98ecGS2Q4QmkayjuCyTtKvYm6BS',
    // 'bXkgXdBZ6P2DJmwAu5aYMDXUMscmcBpcwMsMLBhHZ5gqofsRb',
    // 'bXnDcZZL2XwBt1q5ytthSSymEqDQq2yGYizLuLxBKL25hSFZN',
    // 'bXh6nYU9ejJYAXiNwnsMYUzCNbg494gfvcFLS27TN2zZieoZP',
    // 'bXn2LGJ6KkPB3JzoicabYoVgWt7fsy8up4Gy3zq7A1xx5Gy9x',
    // 'bXiTWWfZdUi8pA7cKnHTpaNjSwR8HMqoK15FxMFVX6Zs6R8vd',
    // 'bXmBMKzcCcJFxk8Dy3oe5Rt4aW59uUDKjD7PvrJzsQK7LvCXS',
    // 'bXibXoaSJScFYBtXKxqA5q9mL7MMdiAz9rhvWX2Cn1ixpTSo1',
    // 'bXj62Zr2EvtJb2r2S8TP4agfSstj5k1nb4iDKBsZVz32x5QtQ',
    // 'bXj62Zr2EvtJb2r2S8TP4agfSstj5k1nb4iDKBsZVz32x5QtQ',
    // 'bXiuoM9YKccwcCiHANw5Wg8HYM57g2fJXrNHAyMP2Fh8DN1fw',
    // 'bXm38EYEtqHNoAvc2dGofDeoed51ypMrWWfm7KGf6cY4MHXRH',
    // 'bXmoe95Uz6LjtdCGY9VxZfCfV2zE2DXy5mA4tW9uExM1WDCQa',
];

const assetId = 0;
const amount = 5000 * 10 ** 12;

async function main() {
    const api = await Basilisk.getInstance();
    if (!api) return;
    const signer = getSigner();

    const txs = destinations.map((destination) =>
        assetId
            ? api.tx.tokens.transfer(destination, assetId, amount)
            : api.tx.balances.transfer(destination, amount)
    );

    await api.tx.utility
        .batch(txs)
        .signAndSend(signer, {}, ({ status, events, dispatchError }: any) => {
            if (status.isBroadcast) console.log('isBroadcast');
            if (status.isInBlock) console.log('isInBlock');
            if (status.isFinalized) console.log('isFinalized');

            if (dispatchError)
                console.log(
                    'dispatchError',
                    api.registry.findMetaError(dispatchError.asModule)
                );
        });
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
