import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { Basilisk } from "./api";
import { getSigner } from "./utils";
import { assetPair } from "./types";

const xyk = (assetPair: assetPair, api: ApiPromise, signer: KeyringPair) => {
    return {
        assetPair,
        signer,
        api,
        createPool: async function () {
            // create pool tx
            const tx = await this.api.tx.xyk.createPool(
                this.assetPair.assetA,
                this.assetPair.assetB,
                "10000000000000000", // assetAAmount
                "123456" // initialPrice
            );
            // sign and announce tx
            const hash = await tx.signAndSend(this.signer);
            console.log("Create XYK Pool transaction hash:", hash.toString());
        },
        buy: async function () {
            const tx = await this.api.tx.xyk.buy(
                this.assetPair.assetA, // assetOut
                this.assetPair.assetB, // assetIn
                "10000", // amount
                "10000", // max limit
                false //discount
            );
            await tx.signAndSend(this.signer);
        },
        sell: async function () {
            const tx = await this.api.tx.xyk.sell(
                this.assetPair.assetB, // assetOut
                this.assetPair.assetA, // assetIn
                "10000", // amount
                "10000", // max limit
                false //discount
            );
            await tx.signAndSend(this.signer);
        }
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
