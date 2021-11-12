import { Api, ApiPromise, HydraApiPromise } from "hydradx-js";
import fs from "fs";
import YAML from "yaml";

class BasiliskAPI {
    public instance: HydraApiPromise | undefined = undefined;
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
        console.log("Initializing Basilisk SDK");
        const manifest = fs.readFileSync("manifest.yml", "utf8");
        const config = YAML.parse(manifest);

        this.instance = await Api.initializeBasilisk(
            {},
            config.typegen.metadata.source
        );
    };
}

export const Basilisk = new BasiliskAPI();
