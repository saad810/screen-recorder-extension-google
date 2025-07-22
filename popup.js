const injectCamera = async () => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Injecting camera into tab:', tab);
    if (!tab.length) return;

    // if(tab[0].url && tab[0].url.startsWith)

    const tabId = tab[0].id;
    await chrome.scripting.executeScript({
        files: ['content.js'],
        target: { tabId: tabId },
    })
}



const recordBtn = document.querySelector('#tab');
const screenBtn = document.querySelector('#screen');


const checkRecordingStatus = async () => {
    const recording = await chrome.storage.local.get(['recording', 'type']);
    console.log('Recording status retrieved from storage:', recording);
    const recordingStatus = recording.recording || false;
    const recordingType = recording.type || 'unknown';
    console.log(`Recording status: ${recordingStatus}`);
    console.log(`Recording type: ${recordingType}`);
    return [recordingStatus, recordingType];
}
const init = async () => {
    const [recordingStatus, recordingType] = await checkRecordingStatus();
    console.log(`Initial recording status: ${recordingStatus}`);
    console.log(`Initial recording type: ${recordingType}`);

    if (recordingStatus === false) {

    } else {
        if (recordingType === 'tab') {
            // document.querySelector('#tab').classList.add('active');
            recordBtn.innerText = 'Stop Recording';
        } else {
            // document.querySelector('#screen').classList.add('active');
            screenBtn.innerText = 'Stop Recording';
        }
    }
    const updateRecording = async (type) => {
        console.log(`Starting recording of type: ${type}`);
        if (recordingStatus) {
            // stop recording
            await chrome.runtime.sendMessage({
                type: 'STOP_RECORDING'
            });
        } else {
            // start recording
            await chrome.runtime.sendMessage({
                type: 'START_RECORDING',
                recordingType: type
            });
            injectCamera();
        }
    }
   

    recordBtn.addEventListener('click', async () => {
        console.log('Record button clicked');
        updateRecording('tab')
    });
    screenBtn.addEventListener('click', async () => {
        console.log('Screen button clicked');
        updateRecording('screen')
    });

 
}

init();