const video = document.querySelector('#video');
const btn = document.querySelector('#facial-recognition-mode');
const messageDiv = document.querySelector('.message');
let idInterval;

async function camera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error("Erro: ", err);
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
    
    messageDiv.classList.remove('hidden');
    messageDiv.style.animation = 'message 2s';
    messageDiv.innerText = await response.text();
    setTimeout(() => {  
        messageDiv.classList.add('hidden');
    }, 2000);
}



async function transformFrameToBlob () {
    
    idInterval = setInterval(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        canvas.toBlob((blob) => {

            if (blob) {
                requestFacialRecognition(blob)
            }

        }, 'image/jpeg');

    }, 4000);

}

async function toggleMode (evt) {

    const content = evt.target.innerText;

    if (content === 'Ativar Análise') {
        evt.target.innerText = 'Desativar Análise';
        camera().then(transformFrameToBlob)
    } else {
        evt.target.innerText = 'Ativar Análise';
        clearInterval(idInterval);
        navigator.mediaDevices.getUserMedia({ video: false });
        video.srcObject = null;
    }
}