const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
console.time('Applicação');
const app = express();

app.use(express.static('public'));

const facialRecognition = require('./facialRecognition');

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/views/index.html');

})

app.post('/', (req, res) => {
    const chunks = [];
    req.on('data', (chunk) => {
        chunks.push(chunk);
    })

    req.on('end', async () => {
        const faceBuffer = Buffer.concat(chunks);

        const faceDetectionStudent = facialRecognition.createFaceDetection(faceBuffer);
        if (!faceDetectionStudent) {
            res.status(400);
            return;
        }

        const studentSearched = await facialRecognition.findStudent(faceDetectionStudent);

        if (studentSearched) {
            //Fazer processo de dar presença ao aluno
            console.log(studentSearched);
            res.send('O estudante foi encontrado e sua presença foi registrado!')
            fs.writeFileSync(path.resolve(__dirname, 'Imagem-encontrada.jpg'), studentSearched.image);
        }

    })

})

const alunos = [
    {nome: 'Guilherme'},
    {nome: 'Pedro'},
    {nome: 'Kaio'},
    {nome: 'João'},
]

fs.readdirSync(path.join(__dirname, '../alunos-imgs')).forEach((fileName, index) => {
    const bufferAluno = fs.readFileSync(path.resolve(__dirname, '../alunos-imgs', fileName))

    alunos[index].image = bufferAluno;

})


const PORT = 3000;
//Abrir servidor apenas quando os modelos carregarem
facialRecognition.loadModels()
    .then(() => {

        //Criar as detecções dos alunos antes do servidor abrir
        return facialRecognition.loadStudents(alunos);

    })
    .then(() => {

        app.listen(PORT, () => {
            console.log('Rodando servidor no caminho http://localhost:' + PORT);
        })

        console.log(facialRecognition.students);
        console.timeEnd('Applicação');

    })
