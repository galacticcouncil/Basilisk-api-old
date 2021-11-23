import lbpPool from "./helpers/lbp";
import { assetPair } from "./helpers/types";

async function main(): Promise<void> {
    // create pool
    const assetPair: assetPair = { assetA: "0", assetB: "1" };
    const lbpPoolInstance = await lbpPool.createPool(assetPair);
    if (!lbpPoolInstance) return;

    // update pool
    const offsetBlocks = {
        start: 10,
        end: 20
    }
    await lbpPoolInstance.updatePool(offsetBlocks);
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
