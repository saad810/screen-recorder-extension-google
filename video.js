// const saveToLocalStorage = async(videoURL) => {
//     await chrome.storage.local.set({ videoURL });
//     console.log("[background.js] Video URL saved to local storage:", videoURL);

//     await chrome.storage.local.get('videoURL', (result) => {
//         console.log("[background.js] Retrieved video URL from local storage:", result.videoURL);
//         if (result.videoURL) {
//             playvideo({ url: result.videoURL });
//         }
//     });
// }
const playvideo = async(message) => {
    console.log("[background.js] Playing video with data:", message.data);
    const videoElement = document.querySelector('#recorded-video');
    const url = message?.url || message?.base64data;
    // await saveToLocalStorage(url);
    videoElement.src = url;
    videoElement.play();
};

chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("[background.js] Message received:", message, sender);
    switch (message.type) {
        case 'OPEN_VIDEO':
            console.log("[background.js] Opening video with data:", message.data);
            playvideo(message);
            break;
        default:
            console.warn("[background.js] Unknown message type:", message.type);
            break;
    }
});