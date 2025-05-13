import { initializeViewer, filterByRevitCategory, filterByRevitProperty } from "./viewer.js";
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
    if (!response.ok) throw new Error(`Could not generate embed URL: ${response.statusText}. Please try again.`);
    const json = await response.json();
    return json.EmbedUrl;
};

try {
    const viewer = await initializeViewer("#viewer", urn, generateAccessToken);
    const embedUrl = await generateEmbedUrl();
    await embedDashboard("#dashboard", embedUrl, (dimension, value) => {
        switch (dimension) {
            case "category":
                filterByRevitCategory(viewer, value);
                break;
            case "level":
                filterByRevitProperty(viewer, "Level", value);
                break;
            case "structural_material":
                filterByRevitProperty(viewer, "Structural Material", value);
                break;
        }
    });
} catch (err) {
    alert(err);
}