import { AccountId32 } from "@polkadot/types/interfaces";
import { encodeAddress } from "@polkadot/util-crypto";

export const toBasiliskFormattedAddress = (address: AccountId32 | string): string => {
  return encodeAddress(address.toString(), 10041);
};
