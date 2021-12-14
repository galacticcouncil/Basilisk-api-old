import pool from '../../../pools/xyk/xyk.json';
import _xykHelper from '../../helpers/xyk';

let xyk: any;

const init = async () => {
    xyk = await _xykHelper.loadPool(pool);
};

const addLiquidity = async () => {
    await init();
    await xyk.addLiquidity();
};

const buy = async () => {
    await init();
    await xyk.buy();
};

export { addLiquidity, buy };
