const fs = require('node:fs');
const path = require('node:path');
const faceapi = require('face-api.js');
const canvas = require('canvas');

const { Canvas, Image, ImageData } = canvas;

//Configurando o formato de objeto de imagem da api
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });


const OBJECT_GLOBAL = {
    allFaceDetectionsStudents: null,
    loadModels,
    loadStudents,
    findStudent
}

//Ideias Iniciais
//Carregar load models ao iniciar o servidor
//Carregar os face detections dos estudantes ao entrar em "modo" de análise
//Chamar o find student em dentro do handler de requisição do frontend





async function loadModels () {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
}

async function findStudent (studentBlob) {
    
    //Lendo a pasta onde ficam as imagens dos estudantes
    const nameFilesStudents = fs.readdirSync(path.join(__dirname, '../alunos-imgs'));


    //Exemplo real
    const { allFaceDetectionsStudents } = this;
    
    //Criando canvas do estudante de análise
    const canvasStudentParse = await loadImage(studentBlob);
    
    console.time('Detect do faceapi')
    const detectionStudentParse = await faceapi.detectSingleFace(canvasStudentParse)
        .withFaceLandmarks()
        .withFaceDescriptor();
    


    
    
}


async function loadStudents (students) {
    const allFaceDetectionsStudents = [];

    for (let i = 0; i < students.length; i++) {
        const student = students[i];

        const studentBlob = student.image;

        const canvasStudent = await loadImage(studentBlob);

        const faceDetectionStudent = await faceapi.detectSingleFace(canvasStudent)
            .withFaceLandmarks()
            .withFaceDescriptor();

        allFaceDetectionsStudents.push(faceDetectionStudent)
    }

    this.allFaceDetectionsStudents = allFaceDetectionsStudents;
}



async function loadImage (buffer) {
    const imgObj = await canvas.loadImage(buffer);
    const canvasElement = canvas.createCanvas(imgObj.width, imgObj.height);
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(imgObj, 0, 0);
    return canvasElement;
}

module.exports = OBJECT_GLOBAL
