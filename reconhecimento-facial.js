const fs = require('node:fs');
const path = require('node:path');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const sharp = require('sharp');
const mimeTypes = require('mime-types');

const { Canvas, Image, ImageData } = canvas;

//Configurando o formato de objeto de imagem da api
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels () {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
}

async function studentExists (studentParse) {

    //Carregando modelos
    await loadModels();
    
    //Lendo o arquivo json que contém os objetos dos estudantes
    const studentsDB = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'alunos.json'), 'utf-8'));

    //Criando canvas do estudante de análise
    const canvasStudentParse = await loadImage(studentParse);

    const detectionStudentParse = await faceapi.detectSingleFace(canvasStudentParse)
        .withFaceLandmarks()
        .withFaceDescriptor();

    for (let i = 0; i < studentsDB.length; i++) {
        const student = studentsDB[i];
        const pathImageStudent = student['imagem-rosto'];
        const canvasCurrentStudent = await loadImage(pathImageStudent);

        // const detectionStudentCurrent = await faceapi.detectSingleFace(canvasCurrentStudent)
        //     .withFaceLandmarks()
        //     .withFaceDescriptor()

        // console.log(detectionStudentCurrent);
    }
    return;
}

async function loadImage (imagePath) {
    console.log(await processImage(imagePath));
    const imgObj = await canvas.loadImage(imagePath);
    const canvasElement = canvas.createCanvas(imgObj.width, imgObj.height);
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(imgObj, 0, 0);
    return canvasElement;
}

async function processImage (imagePath) {
    const type = await mimeTypes.lookup(imagePath);
    if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png') {
        return imagePath;
    }

    convertToSupportedFormat(imagePath);
    return imagePath;
}

async function convertToSupportedFormat (imagePath) {
    const buffer = fs.readFileSync(path.resolve(__dirname, imagePath));
    return await sharp(buffer)
        .toFormat('jpeg')
        .toFile();
}

(async () => {
    console.log(await processImage('./alunos-imgs/pessoa1.webp'));
})()


studentExists('./imagem-teste.jpg').then((data) => {
    
})

