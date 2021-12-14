import { DatabaseManager, SubstrateExtrinsic } from '@subsquid/hydra-common';
import { BuyActionDetail, Status, UserAction, UserActionType } from '../generated/model';
import { xykBuyParameters } from './types';

export const createXykBuyUserAction = async (
    xykBuyParameters: xykBuyParameters,
    extrinsic: SubstrateExtrinsic,
    paraChainBlockHeight: bigint,
    store: DatabaseManager
) => {
    const buyActionDetail = new BuyActionDetail()
    Object.assign(buyActionDetail, {
        assetOut: xykBuyParameters.assetOut,
        assetIn: xykBuyParameters.assetIn,
        assetInAmount: xykBuyParameters.buyPrice * xykBuyParameters.outAmount,
        assetOutAmount: xykBuyParameters.outAmount,
        buyPrice: xykBuyParameters.buyPrice,
        feeAsset: xykBuyParameters.feeAsset,
        feeAmount: xykBuyParameters.feeAmount,
        poolId: xykBuyParameters.poolId
    })

    const userAction = new UserAction();
    userAction.id = extrinsic.hash!.toString();
    const userActionValues = {
        status: Status.isFinalized,
        account: xykBuyParameters.account,
        action: UserActionType.Buy,
        detail: buyActionDetail,
        paraChainBlockHeight

    }
    Object.assign(userAction, userActionValues)

    await store.save(userAction);
};
