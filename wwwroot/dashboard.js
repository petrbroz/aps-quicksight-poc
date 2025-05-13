export async function embedDashboard(containerSelector, embedUrl, onDataPointClick) {
    const { createEmbeddingContext } = QuickSightEmbedding;
    let dashboard;

    const embeddingContext = await createEmbeddingContext({
        onChange: (changeEvent, metadata) => {
            console.log('embeddingContext.onChange:', changeEvent);
        }
    });

    const frameOptions = {
        url: embedUrl,
        container: containerSelector,
        // height: "900px",
        // width: "1600px",
        resizeHeightOnSizeChangedEvent: true,
        onChange: (changeEvent, metadata) => {
            console.log("frameOptions.onChange:", changeEvent);
        },
    };

    const contentOptions = {
        parameters: [],
        locale: "en-US",
        // sheetOptions: {
        //     initialSheetId: '<YOUR_SHEETID>',
        //     singleSheet: false,
        //     emitSizeChangedEventOnSheetChange: false,
        // },
        toolbarOptions: {
            export: false,
            undoRedo: false,
            reset: false
        },
        attributionOptions: {
            overlayContent: false,
        },
        onMessage: async (messageEvent) => {
            console.log("contentOptions.onMessage:", messageEvent);
            const { eventName, message } = messageEvent;
            switch (eventName) {
                case "CONTENT_LOADED": {
                    const sheets = await dashboard.getSheets();
                    for (const sheet of sheets) {
                        const visuals = await dashboard.getSheetVisuals(sheet.SheetId);
                        for (const visual of visuals) {
                            await registerCustomAction(dashboard, sheet.SheetId, visual.VisualId, "Data Point Click", "DATA_POINT_CLICK");
                        }
                    }
                    break;
                }
                case "CALLBACK_OPERATION_INVOKED": {
                    if (message.Datapoints && message.Datapoints.length > 0) {
                        const datapoint = message.Datapoints[0];
                        const dimension = datapoint.Columns[0]?.Dimension?.String?.Column?.ColumnName;
                        const value = datapoint.RawValues[0]?.String;
                        if (dimension && value && onDataPointClick) {
                            onDataPointClick(dimension, value);
                        }
                    }
                    break;
                }
                // case "PARAMETERS_CHANGED": {
                //     onParamsChanged && onParamsChanged(message);
                //     break;
                // }
            }
        }
    };

    dashboard = await embeddingContext.embedDashboard(frameOptions, contentOptions);
    return dashboard;
}

async function registerCustomAction(dashboard, sheetId, visualId, actionName, actionTrigger) {
    const customAction = {
        Name: actionName,
        CustomActionId: `${sheetId}-${visualId}-${actionTrigger}`,
        Status: "ENABLED",
        Trigger: actionTrigger,
        ActionOperations: [
            {
                CallbackOperation: {
                    EmbeddingMessage: {}
                }
            }
        ]
    };
    const resp = await dashboard.addVisualActions(sheetId, visualId, [customAction]);
    if (!resp.success) {
        throw new Error(`Failed to add custom action: ${resp.errorCode}`);
    }
}