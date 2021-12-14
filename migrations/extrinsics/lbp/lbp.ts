import pool from '../../../pools/lbp/lbp.json';
import _lbpHelper from '../../helpers/lbp';

let lbp: any;

const init = async () => {
    lbp = await _lbpHelper.loadPool(pool);
};

const addLiquidity = async () => {
    await init();
    await lbp.addLiquidity();
};

const buy = async () => {
    await init();
    await lbp.buy();
};

export { addLiquidity, buy };
