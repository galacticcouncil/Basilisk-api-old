import {
  EventContext,
  StoreContext,
  DatabaseManager,
} from "@subsquid/hydra-common";
import { ensure } from "../../utils/ensure";
import { Pool } from "../../generated/model";
import { LBP } from "../../types/lbp";

const handlePoolCreated = async ({
  store,
  event,
}: StoreContext & EventContext) => {
  const [poolId, pool ] = new LBP.PoolCreatedEvent(event).params;

  console.log('poolId - ', poolId.toString())
  console.log('pool - ', pool.toString())
};

export default handlePoolCreated;
