import { initializeViewer, filterByRevitCategory } from "./viewer.js";
import { embedDashboard } from "./dashboard.js";

const params = new URLSearchParams(window.location.search);
const urn = params.get("urn") || "dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLjNmandCX25NVFhPWmRKd29Ec3dibUE_dmVyc2lvbj0y";

const generateAccessToken = async () => {
    const response = await fetch("/token");
    if (!response.ok) throw new Error(`Could not obtain access token: ${response.statusText}`);
    const json = await response.json();
    return { AccessToken: json.access_token, ExpiresIn: json.expires_in };
};

const generateEmbedUrl = async () => {
    const response = await fetch("/embed-url");
    if (!response.ok) throw new Error(`Could not generate embed URL: ${response.statusText}`);
    const json = await response.json();
    return json.EmbedUrl;
};

const viewer = await initializeViewer("#viewer", urn, generateAccessToken);
const dashboard = await embedDashboard("#dashboard", generateEmbedUrl, (ev) => {
    for (const changedParam of ev.message.changedParameters) {
        switch (changedParam.Name) {
            case "category":
                filterByRevitCategory(viewer, changedParam.Values[0]);
                break;
        }
    }
});