import { DatabaseManager, SubstrateExtrinsic } from '@subsquid/hydra-common';
import {
    BuyActionDetail,
    LiquidityAddedActionDetail,
    SellActionDetail,
    Status,
    UserAction,
    UserActionType,
} from '../generated/model';
import { getOrCreate } from './getOrCreate';
import { buyDetails, sellDetails } from './types';

export const createUserActionBuy = async (
    buyDetails: buyDetails,
    extrinsic: SubstrateExtrinsic,
    parachainBlockHeight: bigint,
    store: DatabaseManager
) => {
    const buyActionDetail = new BuyActionDetail();
    Object.assign(buyActionDetail, {
        assetOut: buyDetails.assetOut,
        assetIn: buyDetails.assetIn,
        assetInAmount: buyDetails.inAmount,
        assetOutAmount: buyDetails.outAmount,
        feeAsset: buyDetails.feeAsset,
        feeAmount: buyDetails.feeAmount,
        poolId: buyDetails.poolId,
    });

    const id = extrinsic.id;
    const userActionValues = {
        status: Status.isFinalized,
        account: buyDetails.account,
        action: UserActionType.Buy,
        detail: buyActionDetail,
        parachainBlockHeight,
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
    parachainBlockHeight: bigint,
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

    const id = extrinsic.id;
    const userActionValues = {
        status: Status.isFinalized,
        account: liquidityAddedDetails.account,
        action: UserActionType.AddLiquidity,
        detail: liquidityAddedActionDetail,
        parachainBlockHeight,
    };
    const userAction = await getOrCreate(
        store,
        UserAction,
        id,
        userActionValues
    );

    await store.save(userAction);
};

export const createUserActionSell = async (
    sellDetails: sellDetails,
    extrinsic: SubstrateExtrinsic,
    parachainBlockHeight: bigint,
    store: DatabaseManager
) => {
    const sellActionDetail = new SellActionDetail();
    Object.assign(sellActionDetail, {
        assetIn: sellDetails.assetIn,
        assetOut: sellDetails.assetOut,
        assetInAmount: sellDetails.inAmount,
        assetOutAmount: sellDetails.outAmount,
        feeAsset: sellDetails.feeAsset,
        feeAmount: sellDetails.feeAmount,
        poolId: sellDetails.poolId,
    });

    const id = extrinsic.id;
    const userActionValues = {
        status: Status.isFinalized,
        account: sellDetails.account,
        action: UserActionType.Sell,
        detail: sellActionDetail,
        parachainBlockHeight,
    };
    const userAction = await getOrCreate(
        store,
        UserAction,
        id,
        userActionValues
    );

    await store.save(userAction);
};
