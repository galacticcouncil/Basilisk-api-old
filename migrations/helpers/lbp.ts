import { ApiPromise } from "@polkadot/api";
import { AddressOrPair } from "@polkadot/api/types";
import { KeyringPair } from "@polkadot/keyring/types";
import { toBasiliskFormattedAddress } from "../../src/utils/account";
import { Basilisk } from "./api";
import { assetPair } from "./types";
import { getSigner } from "./utils";

const lbp = (assetPair: assetPair, api: ApiPromise, signer: KeyringPair) => {
    return {
        assetPair,
        api,
        signer,
        address: "",
        getSignerAddress: function (): string {
            return toBasiliskFormattedAddress(this.signer.address);
        },
        createPool: async function (): Promise<AddressOrPair> {
            return new Promise<AddressOrPair>(async (resolve, reject) => {
                try {
                    const aliceAddress = await toBasiliskFormattedAddress(
                        signer.address
                    );

                    const tx = await this.api.tx.lbp.createPool(
                        aliceAddress,
                        this.assetPair.assetA,
                        "10000000000000",
                        this.assetPair.assetB,
                        "10000000000000",
                        "10000000",
                        "90000000",
                        "Linear",
                        {
                            numerator: "1",
                            denominator: "10",
                        },
                        aliceAddress
                    );
                    const unsub = await this.api.tx.sudo
                        .sudo(tx)
                        .signAndSend(
                            signer as AddressOrPair,
                            ({ events = [], status }) => {
                                if (status.isInBlock || status.isFinalized) {
                                    events
                                        // We know this tx should result in `Sudid` event.
                                        .filter(({ event }) =>
                                            this.api.events.sudo.Sudid.is(event)
                                        )
                                        .forEach(
                                            ({
                                                event: {
                                                    data: [result],
                                                },
                                            }) => {
                                                // Now we look to see if the extrinsic was actually successful or not...
                                                // @ts-ignore
                                                if (result.isError) {
                                                    unsub();
                                                    reject(1);
                                                }
                                            }
                                        );

                                    events.forEach(
                                        ({
                                            event: { data, method, section },
                                            phase,
                                        }) => {
                                            if (
                                                section === "lbp" &&
                                                method == "PoolCreated"
                                            ) {
                                                unsub();
                                                // set pool's address
                                                this.address =
                                                    data[0].toString();
                                                resolve(data[0].toString());
                                            }
                                        }
                                    );
                                }
                            }
                        );
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
        },
        updatePool: async function (offsetBlocks: {
            start: number;
            end: number;
        }) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    const relayChainBlockHeight =
                        await Basilisk.getBlockHeightRelayChain();
                    const start = relayChainBlockHeight!.plus(
                        offsetBlocks.start
                    );
                    const end = relayChainBlockHeight!.plus(offsetBlocks.end);

                    const unsub = await this.api.tx.lbp
                        .updatePoolData(
                            this.address,
                            null,
                            start.toString(),
                            end.toString(),
                            null,
                            null,
                            null,
                            null
                        )
                        .signAndSend(
                            signer as AddressOrPair,
                            ({ events = [], status }) => {
                                events.forEach(
                                    ({
                                        event: { data, method, section },
                                        phase,
                                    }) => {
                                        if (method === "ExtrinsicFailed") {
                                            unsub();
                                            reject(1);
                                        }
                                        if (
                                            section === "lbp" &&
                                            method == "PoolUpdated"
                                        ) {
                                            console.log(
                                                "[3/3] >>> Pool has been updated successfully."
                                            );
                                            unsub();
                                            resolve();
                                        }
                                    }
                                );

                                if (status.isFinalized) {
                                    unsub();
                                    resolve();
                                }
                            }
                        );
                } catch (e: any) {
                    console.log(e);
                    reject(e);
                }
            });
        },
    };
};

export default {
    createPool: async function (assetPair: assetPair) {
        const api = await Basilisk.getInstance();
        if (!api) return;
        const signer = getSigner();
        const lbpPool = lbp(assetPair, api, signer);

        await lbpPool.createPool();
        console.log(
            "[1/3] >>> Pool has been created with address - ",
            lbpPool.address
        );

        return lbpPool;
    },
};
