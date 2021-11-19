import xykPool from "./helpers/xyk";
import { assetPair } from "./helpers/types";

async function main(): Promise<void> {
    // create pool
    const assetPair: assetPair = { assetA: "0", assetB: "1" };
    await xykPool.createPool(assetPair);
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
