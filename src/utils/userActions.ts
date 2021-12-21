import { DatabaseManager, SubstrateExtrinsic } from '@subsquid/hydra-common';
import {
    BuyActionDetail,
    LiquidityAddedActionDetail,
    Status,
    UserAction,
    UserActionType,
} from '../generated/model';
import { getOrCreate } from './getOrCreate';
import { buyDetails } from './types';

export const createUserActionBuy = async (
    buyDetails: buyDetails,
    extrinsic: SubstrateExtrinsic,
    paraChainBlockHeight: bigint,
    store: DatabaseManager
) => {
    const buyActionDetail = new BuyActionDetail();
    Object.assign(buyActionDetail, {
        assetOut: buyDetails.assetOut,
        assetIn: buyDetails.assetIn,
        assetInAmount: buyDetails.buyPrice * buyDetails.outAmount,
        assetOutAmount: buyDetails.outAmount,
        buyPrice: buyDetails.buyPrice,
        feeAsset: buyDetails.feeAsset,
        feeAmount: buyDetails.feeAmount,
        poolId: buyDetails.poolId,
    });

    const id = extrinsic.hash!.toString();
    const userActionValues = {
        status: Status.isFinalized,
        account: buyDetails.account,
        action: UserActionType.Buy,
        detail: buyActionDetail,
        paraChainBlockHeight,
    };
    const userAction = await getOrCreate(
        store,
        UserAction,
        id,
        userActionValues
    );

    await store.save(userAction);
};

export const createUserActionLiquidityAdded = async (
    liquidityAddedDetails: any,
    extrinsic: SubstrateExtrinsic,
    paraChainBlockHeight: bigint,
    store: DatabaseManager
) => {
    const liquidityAddedActionDetail = new LiquidityAddedActionDetail();
    Object.assign(liquidityAddedActionDetail, {
        poolId: liquidityAddedDetails.poolId,
        assetA: liquidityAddedDetails.assetA,
        assetB: liquidityAddedDetails.assetB,
        assetAAmount: liquidityAddedDetails.amountA,
        assetBAmount: liquidityAddedDetails.amountB
    });

    const id = extrinsic.hash!.toString();
    const userActionValues = {
        status: Status.isFinalized,
        account: liquidityAddedDetails.account,
        action: UserActionType.AddLiquidity,
        detail: liquidityAddedActionDetail,
        paraChainBlockHeight,
    };
    const userAction = await getOrCreate(
        store,
        UserAction,
        id,
        userActionValues
    );

    await store.save(userAction);
};
