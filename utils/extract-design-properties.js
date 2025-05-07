#!/usr/bin/env node

import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { getServiceAccountAccessToken } from "../lib/auth.js";
import { getRevitProperties } from "../lib/props.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", ".env") });
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SA_ID, APS_SA_KEY_ID, APS_SA_PRIVATE_KEY } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_SA_ID || !APS_SA_KEY_ID || !APS_SA_PRIVATE_KEY) {
    console.error("Missing one or more required environment variables: APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SA_ID, APS_SA_KEY_ID, APS_SA_PRIVATE_KEY");
    process.exit(1);
}

const [,, urn] = process.argv;
if (!urn) {
    console.error("Usage: node extract-design-properties.js <urn>");
    console.error("Example: node extract-design-properties.js dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLjNmandCX25NVFhPWmRKd29Ec3dibUE_dmVyc2lvbj0y");
    process.exit(1);
}

try {
    const decodedPrivateKey = Buffer.from(APS_SA_PRIVATE_KEY, "base64").toString("utf-8");
    const credentials = await getServiceAccountAccessToken(APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SA_ID, APS_SA_KEY_ID, decodedPrivateKey, ["data:read"]);
    const properties = await getRevitProperties(urn, credentials.access_token);
    process.stdout.write(JSON.stringify(properties, null, 2));
} catch (err) {
    console.error(err);
    process.exit(1);
}