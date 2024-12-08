document.querySelector('form').addEventListener('submit', async (evt) => {
    evt.preventDefault();

    const nome = document.querySelector('#nome').value;
    const foto = document.querySelector('#foto').files[0];

    const blob = new Blob([foto], { type: foto.type });

    const base64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });

    const base64Imagem = await base64(blob);
    
    await fetch(location.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, image: base64Imagem }),
      });

})