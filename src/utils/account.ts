import { AccountId32 } from '@polkadot/types/interfaces';
import { encodeAddress } from '@polkadot/util-crypto';
import { SS58prefixBasilisk as ss58FormatBasilisk } from '../constants';

export const toBasiliskFormattedAddress = (
    address: AccountId32 | string
): string => {
    return encodeAddress(address.toString(), ss58FormatBasilisk);
};
