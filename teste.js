const objetoTeste = { nome: 'Guilherme' };


Object.defineProperty(objetoTeste, 'nome', {
    writable: false
});

objetoTeste.nome = 'asjdaw'

Object.defineProperties({}, )