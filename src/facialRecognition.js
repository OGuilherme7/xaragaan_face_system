const faceapi = require('face-api.js');
const canvas = require('canvas');

const { Canvas, Image, ImageData } = canvas;

//Configurando o formato de objeto de imagem da api
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

//Exportando objeto de controle
exports = module.exports = new class Manager{}();

exports.loadModels = loadModels;
exports.loadStudents = loadStudents;
exports.createFaceDetection = createFaceDetection;
exports.findStudent = findStudent;

async function loadModels () {
    await faceapi.nets.tinyFaceDetector.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk('./models');
}

async function findStudent (faceDetectionStudent) {
    const limiar = 0.5;

    return this.students.find(student => {
        if (faceapi.euclideanDistance(student.faceDetection.descriptor, faceDetectionStudent.descriptor) < limiar) {
            console.log(faceapi.euclideanDistance(student.faceDetection.descriptor, faceDetectionStudent.descriptor))
            return student;
        };
    });
}

async function createFaceDetection (studentBuffer) {
    const canvasStudentParse = await loadImage(studentBuffer);
    const detectionStudentParse = await faceapi.detectSingleFace(canvasStudentParse, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

    return detectionStudentParse;
}

async function loadStudents (students) {
    this.students = students;

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const studentImage = student.image;
        const canvasStudent = await loadImage(studentImage);

        try {
            const faceDetectionStudent = await faceapi.detectSingleFace(canvasStudent, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks(true)
                .withFaceDescriptor()

            student.faceDetection = faceDetectionStudent;
        } catch (err) {
            console.log(`Erro ao detectar rosto dos estudantes do banco: ${err}`);
        }
    }
}

async function loadImage (buffer) {
    const imgObj = await canvas.loadImage(buffer);
    const canvasElement = canvas.createCanvas(imgObj.width, imgObj.height);
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(imgObj, 0, 0);
    return canvasElement;
}
