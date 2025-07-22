// add listner for messages

chrome.runtime.onMessage.addListener((request, sender) => {
    console.log("Message received:", request, sender);
    switch (request.type) {
        case "START_RECORDING":
            // Start recording
            console.log("Start recording message received");
            break;
            case "STOP_RECORDING":
            console.log("stop recording message received");
            // Stop recording
            break;
        default:
            break;
    }
});