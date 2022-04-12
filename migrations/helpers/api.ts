import { ApiPromise, WsProvider } from "@polkadot/api";
import BigNumber from "bignumber.js";
import type { AnyJson } from "@polkadot/types/types";
import "dotenv/config";

type RelayChainValidationDataHuman = {
    parentHead: string;
    relayParentNumber: string;
    relayParentStorageRoot: string;
    maxPovSize: string;
    [index: string]: AnyJson;
};

class BasiliskAPI {
    public instance: ApiPromise | undefined = undefined;
    private isConnected: boolean;

    constructor() {
        this.isConnected = false;
    }

    private async connect() {
        if (this.isConnected) {
            return;
        }

        await this.initialize();
        this.isConnected = true;
    }

    public async getInstance() {
        await this.connect();
        return this.instance;
    }

    private initialize = async () => {
        const wsProvider = new WsProvider(process.env.BASILISK_NODE_URL);

        this.instance = await new ApiPromise({ provider: wsProvider }).isReady;
    };

    public async getBlockHeightRelayChain(): Promise<BigNumber> {
        return new Promise<BigNumber>(async (resolve, reject) => {
            try {
                const api = await this.getInstance();
                if (!api) return;
                const validationDataResponse =
                    await api.query.parachainSystem.validationData();

                const dataToHuman =
                    validationDataResponse.toHuman() as RelayChainValidationDataHuman;

                if (
                    !dataToHuman ||
                    !dataToHuman.relayParentNumber ||
                    typeof dataToHuman.relayParentNumber !== "string"
                )
                    reject(1);

                // "relayParentNumber" contains string interpretation of a block number in
                // the next format - "9,903,911"
                resolve(
                    new BigNumber(
                        dataToHuman.relayParentNumber.replace(/,/g, "")
                    )
                );
            } catch (e: any) {
                console.log(e);
                reject(e);
            }
        });
    }
}

export const Basilisk = new BasiliskAPI();
