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
    console.log('current state:', recording);
    const recordingStatus = recording.recording || false;
    const recordingType = recording.type || '';
    return [recordingStatus, recordingType];
}
const removeCamera = async () => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Injecting camera into tab:', tab);
    if (!tab.length) return;

    // if(tab[0].url && tab[0].url.startsWith)


    const tabId = tab[0].id;
    await chrome.scripting.executeScript({
        func: () => {
            const camera = document.querySelector('loom-camera');
            if (!camera) {
                return
            }
            document.querySelector('loom-camera').style.display = 'none';
        },
        target: { tabId: tabId },
    })
}
const init = async () => {
    const [recordingStatus, recordingType] = await checkRecordingStatus();


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
            await removeCamera();
            console.log('Recording stopped');
        } else {
            // start recording
            await chrome.runtime.sendMessage({
                type: 'START_RECORDING',
                recordingType: type
            });
            console.log('Recording started');
            injectCamera();
        }
        window.close(); // close the popup after starting/stopping recording
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