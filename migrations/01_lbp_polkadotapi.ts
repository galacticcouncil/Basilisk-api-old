import { Keyring, ApiPromise, WsProvider } from "@polkadot/api";
import { encodeAddress } from "@polkadot/util-crypto";
import BigNumber from "bignumber.js";
import type { AnyJson } from "@polkadot/types/types";
import { AddressOrPair, Signer } from "@polkadot/api/types";

type RelayChainValidationDataHuman = {
    parentHead: string;
    relayParentNumber: string;
    relayParentStorageRoot: string;
    maxPovSize: string;
    [index: string]: AnyJson;
};

const getAliceAccount = () => {
    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");

    return alice;
};

export const getFormattedAddress = (address: string): string => {
    let chainFormat = 10041;
    return encodeAddress(address, chainFormat);
};

const getBlockHeightRelayChain = async (
    apiInstance: ApiPromise
): Promise<BigNumber> => {
    return new Promise<BigNumber>(async (resolve, reject) => {
        try {
            /**
             * validationDataResponse has the next structure:
             *
             * {
                parentHead: '0xb9b654...',
                relayParentNumber: 9895669,
                relayParentStorageRoot: '0xdde0...',
                maxPovSize: 5242880,
              }
             */
            const validationDataResponse = await apiInstance.query.parachainSystem.validationData();

            const dataToHuman = validationDataResponse.toHuman() as RelayChainValidationDataHuman;

            if (
                !dataToHuman ||
                !dataToHuman.relayParentNumber ||
                typeof dataToHuman.relayParentNumber !== "string"
            )
                reject(1);

            // "relayParentNumber" contains string interpretation of a block number in
            // the next format - "9,903,911"
            resolve(
                new BigNumber(dataToHuman.relayParentNumber.replace(/,/g, ""))
            );
        } catch (e: any) {
            console.log(e);
            reject(e);
        }
    });
};

const createPool = async (
    apiInstance: ApiPromise,
    signer: any
): Promise<AddressOrPair | null> => {
    return new Promise<AddressOrPair | null>(async (resolve, reject) => {
        try {
            const assetA = "0";
            const assetB = "1";
            const aliceAddress = await getFormattedAddress(signer.address);

            const tx = await apiInstance.tx.lbp.createPool(
                aliceAddress,
                assetA,
                "10000000000000",
                assetB,
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
            const unsub = await apiInstance.tx.sudo
                .sudo(tx)
                .signAndSend(
                    signer as AddressOrPair,
                    ({ events = [], status }) => {
                        if (status.isInBlock || status.isFinalized) {
                            events
                                // We know this tx should result in `Sudid` event.
                                .filter(({ event }) =>
                                    apiInstance.events.sudo.Sudid.is(event)
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
                                            // @ts-ignore
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
                                        resolve(data[0].toString());
                                    }
                                }
                            );
                        }
                        // if (status.isFinalized) {
                        //     let newPoolAccount: AddressOrPair | null = null;
                        //     events.forEach(
                        //         ({
                        //             event: { data, method, section },
                        //             phase,
                        //         }) => {
                        //             if (
                        //                 section === "lbp" &&
                        //                 method == "PoolCreated"
                        //             ) {
                        //                 newPoolAccount = data[0].toString();
                        //             }
                        //         }
                        //     );
                        //
                        //     unsub();
                        //     resolve(newPoolAccount);
                        // }
                    }
                );
        } catch (e: any) {
            console.log(e);
            reject(e);
        }
    });
};

const updatePool = async (
    poolData: any,
    apiInstance: ApiPromise,
    signer: any
): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const unsub = await apiInstance.tx.lbp
                .updatePoolData(
                    poolData.poolId,
                    null,
                    poolData.start.toString(),
                    poolData.end.toString(),
                    null,
                    null,
                    null,
                    null
                )
                .signAndSend(
                    signer as AddressOrPair,
                    ({ events = [], status }) => {
                        events.forEach(
                            ({ event: { data, method, section }, phase }) => {
                                if (method === "ExtrinsicFailed") {
                                    unsub();
                                    reject(1);
                                }
                                if (
                                    section === "lbp" &&
                                    method == "PoolUpdated"
                                ) {
                                    unsub();
                                    resolve();
                                }
                            }
                        );

                        // if (status.isFinalized) {
                        //     unsub();
                        //     resolve();
                        // }
                    }
                );
        } catch (e: any) {
            console.log(e);
            reject(e);
        }
    });
};

async function main(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const wsProvider = new WsProvider("ws://localhost:9988");
            const api = await new ApiPromise({ provider: wsProvider }).isReady;

            const alice = getAliceAccount();

            const poolId = await createPool(api, alice);

            console.log(
                "[1/3] >>> Pool has been created with address - ",
                poolId
            );

            const relayChainBlockHeight = await getBlockHeightRelayChain(api);

            console.log(
                "[2/3] >>> Current relay chain block height - ",
                relayChainBlockHeight.toString()
            );

            await updatePool(
                {
                    poolId: poolId!.toString(),
                    start: relayChainBlockHeight!.plus(10),
                    end: relayChainBlockHeight!.plus(1000),
                },
                api,
                alice
            );

            console.log("[3/3] >>> Pool has been updated successfully.");
            resolve();
        } catch (e: any) {
            reject(e);
        }
    });
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
