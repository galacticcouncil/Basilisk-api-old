import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

export const getSigner = (): KeyringPair => {
    const keyring = new Keyring({ type: "sr25519" });
    const signer = keyring.addFromUri("//Alice");

    return signer;
};
