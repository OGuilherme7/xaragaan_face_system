const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));

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
            console.timeEnd('A requisição demorou: ');
            return;
        }

        const studentSearched = await facialRecognition.findStudent(faceDetectionStudent);

        if (studentSearched) {
            console.log(facialRecognition.students);
            console.log(studentSearched.nome);
            res.send(`A sua presença foi registrada! [${studentSearched.nome}]`)
        } else {
            res.send('A pessoa não foi encontrada!');
            console.timeEnd('A requisição demorou: ');  
        }
        console.timeEnd('A requisição demorou: ');

    })

})

app.get('/add', (req, res) => {

    res.sendFile(__dirname + '/views/add.html');

})

app.post('/add', async (req, res) => {

    const { nome, image } = req.body;

    const bufferImage = Buffer.from(image, 'base64');

    const faceDetection = await facialRecognition.createFaceDetection(bufferImage);

    facialRecognition.students.push({ nome, faceDetection });

    res.redirect('/')

    console.log(facialRecognition.students)
})



const alunos = [
    {nome: 'Pedro'},
    {nome: 'Kaio'},
    {nome: 'João'},
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
    