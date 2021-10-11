import handleAssetRegisteredUpdated from "./asset/handleAssetRegisteredUpdated";
import handlePostBlock from "./block/handlePostBlock";
import handlePoolCreated from "./pool/handlePoolCreated";
import basiliskApi from "../utils/basiliskApi";

basiliskApi.initialize();

const handleTransfer = async ({ block, event, store }: any) => {
  console.log("handling tokens transfer");
};

export { handleAssetRegisteredUpdated, handlePostBlock, handlePoolCreated, handleTransfer };
