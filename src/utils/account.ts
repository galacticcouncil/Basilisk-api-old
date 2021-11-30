import { AccountId32 } from '@polkadot/types/interfaces';
import { encodeAddress } from '@polkadot/util-crypto';
import { ss58FormatBasilisk } from '../constants';

/**
 * @param address eg. '5EvK2PEfHDXgodGLjk3pr121vmdXfWqmZ5htFBe8aZN56qsm'
 * @returns Basilisk formatted address eg. 'bXjT2D2cuxUuP2JzddMxYusg4cKo3wENje5Xdk3jbNwtRvStq'
 */
export const toBasiliskFormattedAddress = (
    address: AccountId32 | string
): string => {
    return encodeAddress(address.toString(), ss58FormatBasilisk);
};
