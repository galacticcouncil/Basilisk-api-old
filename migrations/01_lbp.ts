import BigNumber from "bignumber.js";
import { Keyring } from "@polkadot/keyring";
import { getFormattedAddress } from "hydradx-js";
import { Basilisk } from "../src/utils/basiliskApi";

async function main(): Promise<void> {
    const basiliskAPI = await Basilisk.getInstance();

    const alice = getAliceAccount();
    const aliceAddress = await getFormattedAddress(alice.address);
    const assetA = "0";
    const assetB = "1";

    // create pool
    const poolId = await basiliskAPI!.basilisk.tx.createPoolLbp({
        poolOwner: aliceAddress!,
        assetA,
        assetAAmount: new BigNumber(10),
        assetB,
        assetBAmount: new BigNumber(10),
        initialWeight: new BigNumber(10000000),
        finalWeight: new BigNumber(90000000),
        weightCurve: "Linear",
        fee: {
            numerator: new BigNumber(1),
            denominator: new BigNumber(200),
        },
        feeCollector: aliceAddress!,
        isSudo: true,
    });

    // update pool
    const blockHeight =
        await basiliskAPI!.basilisk.query.getBlockHeightRelayChain();
    await basiliskAPI!.basilisk.tx.updatePoolDataLbp({
        poolId: poolId!.toString(),
        start: blockHeight!.plus(10),
        end: blockHeight!.plus(1000),
    });
}

const getAliceAccount = () => {
    const keyring = new Keyring({ type: "sr25519", ss58Format: 2 });
    const alice = keyring.addFromUri("//Alice");

    return alice;
};

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
