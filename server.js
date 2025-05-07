import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { getServiceAccountAccessToken } from "./lib/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env") });
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SA_ID, APS_SA_KEY_ID, APS_SA_PRIVATE_KEY, EMBED_GENERATOR_ENDPOINT } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_SA_ID || !APS_SA_KEY_ID || !APS_SA_PRIVATE_KEY || !EMBED_GENERATOR_ENDPOINT) {
    console.error("Missing one or more required environment variables: APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SA_ID, APS_SA_KEY_ID, APS_SA_PRIVATE_KEY, EMBED_GENERATOR_ENDPOINT");
    process.exit(1);
}
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, "wwwroot")));

app.get("/token", async (req, res) => {
    try {
        const credentials = await getServiceAccountAccessToken(APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SA_ID, APS_SA_KEY_ID, APS_SA_PRIVATE_KEY, ["data:read"]);
        res.json(credentials);
    } catch (err) {
        console.error("Error generating access token:", err);
        res.status(500).json({ error: "Failed to generate access token" });
    }
});

app.get("/embed-url", async (req, res) => {
    const resp = await fetch(EMBED_GENERATOR_ENDPOINT);
    if (!resp.ok) {
        return res.status(500).json({ error: "Failed to fetch embed URL" });
    }
    const data = await resp.json();
    res.json(data);
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));