//to inject iframe to page that has permissions to access the camera


const cameraId = 'loom-camera';
const camera = document.getElementById(cameraId);

// check if camera exists

if (camera) {
    console.log('camera found', camera);
}else{
    const cameraElement = document.createElement('iframe');
    cameraElement.id = cameraId;
    cameraElement.setAttribute('style',
        `
        position: fixed;
        top:10px;
        right: 10px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        border: none;
        `
    )
    // set permissions for iframe
    cameraElement.setAttribute('allow', 'camera; microphone;');



    cameraElement.src = chrome.runtime.getURL('camera.html');
    document.body.appendChild(cameraElement);
    console.log('camera not found, created new camera element', cameraElement);
}