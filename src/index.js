const express = require('express');

const app = express();

app.use(express.static('public'));

const facialRecognition = require('./studentsExists');

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/views/index.html');

})

app.post('/', (req, res) => {
    console.log('Inicío da executação do handdler');
    const chunks = [];
    req.on('data', (chunk) => {
        chunks.push(chunk);
    })

    req.on('end', async () => {
        const faceBuffer = Buffer.concat(chunks);
        const studentSearched = await facialRecognition.studentExists(faceBuffer);

        

    })

})


const PORT = 3000;
//Abrir servidor apenas quando os modelos do sistema de reconhecimento facial forem carregados
facialRecognition.loadModels().then(() => {
    app.listen(PORT, () => {
        console.log('Rodando servidor no caminho http://localhost:' + PORT);
    })

})
