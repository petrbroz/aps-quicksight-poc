export function initializeViewer(containerSelector, urn, generateAccessToken) {
    return new Promise((resolve, reject) => {
        const options = {
            env: "AutodeskProduction2",
            api: "streamingV2",
            getAccessToken: async function (callback) {
                try {
                    const { AccessToken, ExpiresIn } = await generateAccessToken();
                    callback(AccessToken, ExpiresIn);
                } catch (error) {
                    alert("Error getting access token. See console for details.");
                    console.error("Error getting access token:", error);
                }
            }
        };
        Autodesk.Viewing.Initializer(options, () => {
            const viewer = new Autodesk.Viewing.GuiViewer3D(document.querySelector(containerSelector));
            viewer.start();
            viewer.setTheme("light-theme");
            Autodesk.Viewing.Document.load(
                "urn:" + urn,
                (doc) => viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()),
                (code, message, errors) => alert("Error loading document: " + message)
            );
            resolve(viewer);
        });
    });
}

export function filterByRevitCategory(viewer, category) {
    const tree = viewer.model.getInstanceTree();
    const ids = [];
    tree.enumNodeChildren(tree.getRootId(), (id) => {
        if (tree.getNodeName(id) === category) {
            ids.push(id);
        }
    });
    viewer.isolate(ids);
    viewer.fitToView(ids);
}