import { u32 } from "@polkadot/types";

export type transferParameters = {
    assetId: bigint;
    from: string;
    to: string;
    balance: bigint;
};

export type poolCreatedParameters = {
    poolId: string;
    assetAId: bigint;
    assetBId: bigint;
};

export interface poolCreatedParams1 {
    assets: Array<u32>;
};

export interface poolUpdatedParams1 {
    end: u32;
};

export type poolUpdatedParameters = {
    poolId: string;
    end: bigint;
};

export type poolId = string;

export type blockHeight = bigint;

// subset of a standard generated entity/model
export type EntityConstructor<T> = {
    new (...args: any[]): T
};

export type currentBlockNumbersParameters = {
    relayChainBlockHeight: bigint,
    paraChainBlockHeight: bigint
};
