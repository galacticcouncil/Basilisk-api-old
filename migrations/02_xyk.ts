import { Keyring, ApiPromise, WsProvider } from "@polkadot/api";
import fs from "fs";
import YAML from "yaml";

async function main(): Promise<void> {
    const manifest = fs.readFileSync("manifest.yml", "utf8");
    const config = YAML.parse(manifest);
    const wsProvider = new WsProvider(config.typegen.metadata.source);
    const api = await new ApiPromise({ provider: wsProvider }).isReady;

    // create pool tx
    const tx = await api.tx.xyk.createPool(
        "0", // assetA
        "1", // assetB
        "10000000000000000", // assetAAmount
        "123456" // initialPrice
    );
    // get signer
    const keyring = new Keyring({ type: "sr25519" });
    const signer = keyring.addFromUri("//Alice"); 
    // sign and announce tx
    const hash = await tx.signAndSend(signer);
    console.log("Create XYK Pool transaction hash:", hash.toString());
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
