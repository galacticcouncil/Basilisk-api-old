import {
  EventContext,
  StoreContext,
  DatabaseManager,
} from "@subsquid/hydra-common";
import { ensure } from "../../utils/ensure";
import { Asset } from "../../generated/model";
import { AssetRegistry } from "../../types/asset-registry";

const ensureAsset = async (
  store: DatabaseManager,
  assetId: string
): Promise<Asset> => {
  // ensure the asset with appropriate default parameters
  const asset = await ensure<Asset>(store, Asset, assetId, {
    assetId,
    name: "",
    type: "",
    symbol: "",
  });

  // persist the asset
  await store.save(asset);
  return asset;
};

const handleAssetRegisteredUpdated = async ({
  store,
  event,
}: StoreContext & EventContext) => {
  const [assetId, name, type] = new AssetRegistry.RegisteredEvent(event).params;

  const newAsset = await ensure<Asset>(store, Asset, assetId.toString(), {
    assetId: assetId.toString(),
    name: name.toString(),
    type: type.toString(),
    symbol: "",
  });
  await store.save(newAsset);
};

export default handleAssetRegisteredUpdated;
