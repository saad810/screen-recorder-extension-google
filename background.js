// add listner for messages
const checkRecordingStatus = async () => {
    const recording = await chrome.storage.local.get(['recording', 'type']);
    console.log('Recording status [backgroundjs] retrieved from storage:', recording);
    const recordingStatus = recording.recording || false;
    const recordingType = recording.type || 'unknown';
    return [recordingStatus, recordingType];
}

const updateRecording = async (state, type) => {
    console.log(`Updating recording to state: ${state}, type: ${type}`);
    await chrome.storage.local.set({ recording: state, type });
}

const startRecording = async (type) => {
    console.log(`Starting recording of type: ${type}`);
    await updateRecording(true, type);
    // change the icon
    chrome.action.setIcon({ path: 'icons/recording.png' });
    // Logic to start recording
    if (type === 'tab') {
        recordTabState(true);
    }
    if (type === 'screen') {
        recordScreen();
    }

}
const stopRecording = async () => {
    console.log('Stopping recording');
    await updateRecording(false, '');
    // Logic to stop recording
    // change the icon
    chrome.action.setIcon({ path: 'icons/not-recording.png' });
    recordTabState(false);
}
const recordScreen = async () => {
    console.log('Recording screen');
    // create a focused tab with index of 0
    const desktopRecordPath = chrome.runtime.getURL('desktopRecord.html');
    
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', currentTab);
    const currentTabId = currentTab[0].id;

    const newTab = await chrome.tabs.create({
        url: desktopRecordPath,
        active: true,
        pinned: true,
        index: 0
    });
    // wait for few secs and send a message

    setTimeout(() => {
        chrome.tabs.sendMessage(newTab.id, { type: 'START_RECORDING', focusedTabId: currentTabId });
    }, 1000);
}
const recordTabState = async (start = true) => {
    // setup off screen document
    const existingContexts = await chrome.runtime.getContexts({});

    console.log('Existing contexts:', existingContexts);
    const offScreenDocument = existingContexts.find(context => context.contextType === 'OFFSCREEN_DOCUMENT');
    if (!offScreenDocument) {
        console.log('Creating new offscreen document');
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['USER_MEDIA', "DISPLAY_MEDIA"],
            justification: 'Recording tab.CAPTURE api'
        });
    }

    if (start) {
        console.log('Starting tab capture');
        // use tabcapture apu to get the stream
        // get the id of active tab
        const tab = await chrome.tabs.query({ active: true, currentWindow: true })
        console.log('Active tab:', tab);
        if (!tab || !tab.length) {
            console.error('No active tab found');
            return;
        }
        const tabId = tab[0].id;
        console.log('Tab ID:', tabId);
        const streamId = await chrome.tabCapture.getMediaStreamId(
            {
                targetTabId: tabId,
            }
        );

        console.log('Stream ID:', streamId);

        // send to offscreen document
        chrome.runtime.sendMessage({
            type: "START_RECORDING",
            target: 'OFFSCREEN_DOCUMENT',
            data: streamId
        });
    } else {
        chrome.runtime.sendMessage({
            type: "STOP_RECORDING",
            target: 'OFFSCREEN_DOCUMENT',
        });
    }

};



chrome.runtime.onMessage.addListener((request, sender) => {
    console.log("Message received:", request, sender);
    switch (request.type) {
        case "START_RECORDING":
            // Start recording
            console.log("Start recording message received");
            startRecording(request.recordingType);
            break;
        case "STOP_RECORDING":
            console.log("stop recording message received");
            // Stop recording
            stopRecording();
            break;
        default:
            break;
    }
});