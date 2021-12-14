import { u32 } from '@polkadot/types';

type assetId = bigint;
type balance = bigint;
// TODO standardize - either amount or balance
type amount = balance;
type address = string;

export type transferParameters = {
    assetId: bigint;
    from: address;
    to: address;
    balance: balance;
};

export type poolCreatedParameters = {
    poolId: string;
    assetAId: assetId;
    assetBId: assetId;
};

export interface poolCreatedParams1 {
    assets: Array<u32>;
}

export interface poolUpdatedParams1 {
    end: u32;
}

export type poolUpdatedParameters = {
    poolId: string;
    end: bigint;
};

export type poolId = string;

export type blockHeight = bigint;

// subset of a standard generated entity/model
export type EntityConstructor<T> = {
    new (...args: any[]): T;
};

export type currentBlockNumbersParameters = {
    relayChainBlockHeight: bigint;
    paraChainBlockHeight: bigint;
};

export type xykBuyParameters = {
    account: string,
    assetOut: assetId,
    assetIn: assetId,
    outAmount: amount,
    buyPrice: amount,
    feeAsset: assetId,
    feeAmount: amount,
    poolId: address
}