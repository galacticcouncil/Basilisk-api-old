import { Keyring, ApiPromise, WsProvider } from "@polkadot/api";

async function main(): Promise<void> {
    const wsProvider = new WsProvider("ws://localhost:9988");
    const api = await new ApiPromise({ provider: wsProvider }).isReady;

    // create pool tx
    const tx = await api.tx.xyk.createPool(
        "0", // assetA
        "4", // assetB
        "10000000000000000", // assetAAmount
        "123456", // initialPrice
    );
    // get signer
    const keyring = new Keyring({ type: "sr25519" });
    const signer = keyring.addFromUri("//Alice");
    // sign and announce tx
    await tx.signAndSend(signer);
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
