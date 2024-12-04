const videoElement = document.querySelector('#video');

async function startCamera() {
    try {
      const videoElement = document.getElementById('video');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
}

async function requestFacialRecognition (blob) {
    console.log(blob)
    const response = await fetch(location.href, {
        method: 'POST',
        headers: {
            'Content-Type': 'image/jpeg'
        },
        body: blob
    })

}



async function transformFrameToBlob () {

    setInterval(() => {
        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
 
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {

            if (blob) {
                requestFacialRecognition(blob)
            }

        }, 'image/jpeg');


    }, 1000);

}


startCamera().then(() => {
    transformFrameToBlob()
})