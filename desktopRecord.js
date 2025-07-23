// listening to messages from the background script start/stop recording


chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("[desktopRecord.js] Message received:", message, sender);
    switch (message.type) {
        case "START_RECORDING":
            console.log("[desktopRecord.js] Starting recording with stream ID:", message.data);
            startRecording(message.focusedTabId);
            break;
        case "STOP_RECORDING":
            console.log("[desktopRecord.js] Stopping recording");
            stopRecording();
            break;
        default:
            console.warn("[desktopRecord.js] Unknown message type:", message.type);
            break;
    }
}
);

let recorder;
let data = [];

const stopRecording = async () => {

}

const startRecording = async (focusedTabId) => {
    // use desktop capture API to get the stream
    chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], async function (streamId) {
        if (!streamId) {
            console.error("User cancelled the desktop capture.");
            return;
        }
        console.log("[desktopRecord.js] Starting recording with stream ID:", streamId);
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId
                }
            },
            audio: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId
                }
            }
        });
        console.log("[desktopRecord.js] Media stream obtained:", stream);
        const microphone = await navigator.mediaDevices.getUserMedia(
            {
                audio: { echoCancellation: false }
            }
        );
        console.log("[desktopRecord.js] Microphone stream obtained:", microphone);
        if (microphone.getAudioTracks().length !== 0) {
            const combinedStream = new MediaStream([
                stream.getVideoTracks()[0],
                microphone.getAudioTracks()[0]
            ]);
            console.log("[desktopRecord.js] Combined stream created:", combinedStream);
            recorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm; codecs=vp9'
            });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    data.push(event.data);
                    console.log("[desktopRecord.js] Data available:", event.data);
                }
            };

            recorder.onstop = async()=>{
                console.log("[desktopRecord.js] Recording stopped, processing data...");
                // send the data to the background script
                console.log('[desktopRecord.js] Data length:', data.length);
                console.log('[desktopRecord.js] Data:', data);
                data = []

                // convrt to a blob
                // const blob = new Blob(data, { type: 'video/webm' });
                // console.log("[desktopRecord.js] Blob created:", blob);
                // const url = URL.createObjectURL(blob);
                // console.log("[desktopRecord.js] Blob URL created:", url);
                // window.open(url, '_blank'); // open the recorded video in a new tab
            }
            recorder.start();
            console.log("[desktopRecord.js] Recorder started successfully.");
            // set focus back to the prev tab
            if (focusedTabId) {
                console.log("[desktopRecord.js] Focusing back to tab ID:", focusedTabId);
                chrome.tabs.update(focusedTabId, { active: true });
            }
        }
    })
}