export async function embedDashboard(containerSelector, generateEmbedUrl, onParamsChanged) {
    const { createEmbeddingContext } = QuickSightEmbedding;

    const frameOptions = {
        url: await generateEmbedUrl(),
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
        onMessage: async (messageEvent, experienceMetadata) => {
            console.log("contentOptioons.onMessage:", messageEvent);
            switch (messageEvent.eventName) {
                case "PARAMETERS_CHANGED":
                    if (onParamsChanged) {
                        onParamsChanged(messageEvent);
                    }
                    break;
            }
        }
    };

    const embeddingContext = await createEmbeddingContext({
        onChange: (changeEvent, metadata) => {
            console.log('embeddingContext.onChange:', changeEvent);
        }
    });

    const dashboard = await embeddingContext.embedDashboard(frameOptions, contentOptions);
    return dashboard;
}