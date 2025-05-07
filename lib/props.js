import { ModelDerivativeClient } from "@aps_sdk/model-derivative";

export async function getRevitProperties(urn, accessToken) {
    const client = new ModelDerivativeClient();
    const views = await client.getModelViews(urn, { accessToken });
    const view = views.data.metadata[0];
    if (!view) {
        throw new Error("No views found for the specified URN.");
    }
    const props = await client.getAllProperties(urn, view.guid, { accessToken });
    const tree = await client.getObjectTree(urn, view.guid, { accessToken });
    const root = tree.data.objects[0];
    const results = [];
    for (const category of root.objects || []) {
        for (const familyType of category.objects || []) {
            for (const family of familyType.objects || []) {
                for (const instance of family.objects || []) {
                    const result = { 
                        objectId: instance.objectid,
                        category: category.name,
                        familyType: familyType.name,
                        family: family.name,
                        name: instance.name,
                    };
                    const objectProps = props.data.collection.find(p => p.objectid === instance.objectid);
                    if (objectProps) {
                        result.externalId = objectProps.externalId;
                        if ("Constraints" in objectProps.properties) {
                            const constraints = objectProps.properties["Constraints"];
                            result.level = constraints["Level"]?.replace(",", "") || null;
                        }
                        if ("Materials and Finishes" in objectProps.properties) {
                            const materials = objectProps.properties["Materials and Finishes"];
                            result.material = materials["Structural Material"]?.replace(",", "") || null;
                        }
                        if ("Dimensions" in objectProps.properties) {
                            const dimensions = objectProps.properties["Dimensions"];
                            result.volume = dimensions["Volume"]?.replace(",", "") || null;
                            result.area = dimensions["Area"]?.replace(",", "") || null;
                            result.length = dimensions["Length"]?.replace(",", "") || null;
                        }
                    }
                    results.push(result);
                }
            }
        }
    }
    return results;
}