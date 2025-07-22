const main= async () => {

    const cameraElement = document.querySelector('#camera')
    console.log(cameraElement);
    const permissinos = await navigator.permissions.query({ name: 'camera' });
    console.log(permissinos);

    if (permissinos.state === 'prompt') {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    } if (permissinos.state === 'denied') {
        console.error('Camera permissions denied');
        alert('Please enable camera permissions in your browser settings.');
    } if (permissinos.state === 'granted') {
        console.log('Camera permissions granted');
    }

    const startCamera = async () => {
        const videoElement = document.createElement('video');
        videoElement.setAttribute('style',
            `
            height: 200px;
            border-radius: 100px;
            transform:scaleX(-1);
            `
        )
        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('muted', 'true');

        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoElement.srcObject = cameraStream;
        cameraElement.appendChild(videoElement);
        // videoElement.autoplay = true;
        // videoElement.muted = true;
    }

    startCamera().catch(err => {
        console.error('Error starting camera:', err);
        alert('Failed to start camera. Please check your permissions.');
    });



}

main();