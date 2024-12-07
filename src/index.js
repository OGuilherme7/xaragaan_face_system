const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const app = express();

app.use(express.static('public'));

console.time('Aplicação');

const facialRecognition = require('./facialRecognition');

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/views/index.html');

})

app.post('/', (req, res) => {
    console.time('A requisição demorou: ');
    const chunks = [];
    req.on('data', (chunk) => {
        chunks.push(chunk);
    })

    req.on('end', async () => {
        const faceBuffer = Buffer.concat(chunks);

        const faceDetectionStudent = await facialRecognition.createFaceDetection(faceBuffer);
        if (!faceDetectionStudent) {
            res.send('A requisição vinda do frontend não possui um rosto!');
            return;
        }

        const studentSearched = await facialRecognition.findStudent(faceDetectionStudent);

        if (studentSearched) {
            console.log(studentSearched.nome);
            res.send('O estudante foi encontrado e sua presença foi registrada!')
            fs.writeFileSync(path.resolve(__dirname, 'imagem-encontrada.jpg'), studentSearched.image);
        } else {
            res.send('A pessoa não foi encontrada!');
        }
        console.timeEnd('A requisição demorou: ');

    })

})

const alunos = [
    {nome: 'Pedro'},
    {nome: 'Kaio'},
    {nome: 'João'},
    {nome: 'Guilherme'},
    {nome: 'Carlos'},
    {nome: 'Jhonatan'},
    {nome: 'Andréia'}
]

fs.readdirSync(path.join(__dirname, '../alunos-imgs')).forEach((fileName, index) => {
    const bufferAluno = fs.readFileSync(path.resolve(__dirname, '../alunos-imgs', fileName))

    alunos[index].image = bufferAluno;

})


const PORT = 3000;

//Abrir servidor apenas quando os modelos e estudantes carregarem
facialRecognition.loadModels()
    .then(() => {

        return facialRecognition.loadStudents(alunos)
        
    })
    .then(() => {

        app.listen(PORT, () => {
            console.log('Rodando servidor no caminho http://localhost:' + PORT);
        })

        console.timeEnd('Aplicação');

    })
