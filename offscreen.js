// listen to messages frmo background script

chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("[offscreen.js] Message received:", message, sender);
    switch (message.type) {
        case "START_RECORDING":
            console.log("[offscreen.js] Starting recording with stream ID:", message.data);
            startRecording(message.data);
            break;
        case "STOP_RECORDING":
            console.log("[offscreen.js] Stopping recording");
            stopRecording();
            break;
        default:
            console.warn("[offscreen.js] Unknown message type:", message.type);
            break;

    }

})


let recorder;
let data = [];

const stopRecording = async () => {
    console.log("[offscreen.js] Stopping recording");
    if (recorder && recorder.state === 'recording') {
        recorder.stop();
        console.log("[offscreen.js] Recorder stopped.");
        // stop all tracks in the stream
        recorder.stream.getTracks().forEach(track => {
            track.stop();
            console.log("[offscreen.js] Track stopped:", track);
        });
    } else {
        console.warn("[offscreen.js] No active recorder to stop.");
    }   
 }

const startRecording = async (streamId) => {
    try {
        if (recorder?.state === 'recording') {
            throw new Error("[offscreen.js] Recorder is already recording, stopping first.");
            // await stopRecording();
        }

        console.log("[offscreen.js] Starting recording with stream ID:", streamId);
        // use the tabcaptured steam id

        const media = await navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                },
            },
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            }
        });

        // get microphone audio
        const microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const mixedContext = new AudioContext();
        const mixedDest = mixedContext.createMediaStreamDestination();

        mixedContext.createMediaStreamSource(microphone).connect(mixedDest);
        mixedContext.createMediaStreamSource(media).connect(mixedDest);

        const combinedStream = new MediaStream([
            media.getVideoTracks()[0],
            mixedDest.stream.getAudioTracks()[0]
        ]);

        recorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm; codecs=vp9'
        });


        recorder.ondataavailable = (event) => {
            console.log("[offscreen.js] Data available from recorder:", event.data);
            if (event.data.size > 0) {
                data.push(event.data);
            }
        };

        // listen for stop event
        recorder.onstop = () => {
            console.log("[offscreen.js] Recording stopped, processing data.");
            const blob = new Blob(data, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            console.log("[offscreen.js] Blob URL created:", url);
            chrome.runtime.sendMessage({
                type: "OPEN_TAB",
                url,
            });
        };
        recorder.start();
        console.log("[offscreen.js] Recorder started successfully.");


    } catch (error) {
        console.warn("[offscreen.js] Error starting recording:", error);
    }
}
