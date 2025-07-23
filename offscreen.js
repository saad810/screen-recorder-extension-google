// listen to messages frmo background script

chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("[offscreen.js] Message received:", message, sender);
    switch (message.type) {
        case "START_RECORDING":
            console.log("[offscreen.js] Starting recording with stream ID:", message.data);
            break;
        case "STOP_RECORDING":
            console.log("[offscreen.js] Stopping recording");
            break;
        default:
            console.warn("[offscreen.js] Unknown message type:", message.type);
            break;

    }

})