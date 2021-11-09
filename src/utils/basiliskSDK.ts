import { Api } from "hydradx-js";
import fs from "fs";
import YAML from "yaml";

export const initialize = async () => {
    const manifest = fs.readFileSync("manifest.yml", "utf8");
    const config = YAML.parse(manifest);
    const basiliskApi = await Api.initializeBasilisk(
        {},
        config.typegen.metadata.source
    );
    return basiliskApi;
};
