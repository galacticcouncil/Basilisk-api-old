import { Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import BigNumber from 'bignumber.js';
import fs from 'fs-extra';
import { pool } from './types';

export const getSigner = (): KeyringPair => {
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri('//Alice');

    return signer;
};

export const getSignerBob = (): KeyringPair => {
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri('//Bob');

    return signer;
};

export const get12DecimalsFormat = (assetBalance: BigNumber): BigNumber => {
    return assetBalance.multipliedBy(new BigNumber('10').pow('12'));
};

const saveMigration = (data: any, poolType: string) => {
    //let data = JSON.stringify(migration, null, 2);
    
    fs.outputJsonSync(
        `${__dirname}/../../pools/${poolType}/${poolType}.json`,
        data
    );
};

export const saveLbpMigration = (lbpPool: pool) => {
    saveMigration(lbpPool, 'lbp');
};

export const saveXykMigration = (xykPool: pool) => {
    saveMigration(xykPool, 'xyk');
};
