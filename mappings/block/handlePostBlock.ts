import {
  EventContext,
  StoreContext,
  DatabaseManager,
  BlockContext,
} from "@subsquid/hydra-common";
import { BN } from "@polkadot/util";

import basiliskApi from "../../utils/basiliskApi";

const handlePostBlock = async ({
  store,
  block,
}: BlockContext & StoreContext) => {
  const blockHeight = new BN(block.height);
  console.log("---handlePostBlock---", blockHeight);
  const api = basiliskApi.getApi();

  if (api) {
    const assetsList = await api.basilisk.query.getAssetList();

    console.log("assetsList - ", assetsList);
  }
};

export default handlePostBlock;
