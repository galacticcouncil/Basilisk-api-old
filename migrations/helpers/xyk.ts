import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { Basilisk } from "./api";
import { getSigner } from "./utils";
import { assetPair } from "./types";

const xyk = (assetPair: assetPair, api: ApiPromise, signer: KeyringPair) => {
    return {
        assetPair,
        signer,
        createPool: async function () {
            // create pool tx
            const tx = await api.tx.xyk.createPool(
                assetPair.assetA,
                assetPair.assetB,
                "10000000000000000", // assetAAmount
                "123456" // initialPrice
            );
            // sign and announce tx
            const hash = await tx.signAndSend(signer);
            console.log("Create XYK Pool transaction hash:", hash.toString());
        },
    };
};

export default {
    createPool: async function (assetPair: assetPair) {
        const api = await Basilisk.getInstance();
        if (!api) return;
        const signer = getSigner();
        const xykPool = xyk(assetPair, api, signer);

        await xykPool.createPool();

        return xykPool;
    },
};
