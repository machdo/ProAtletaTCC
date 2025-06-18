document.addEventListener('page:afterin', function (e) {
  if (e.detail.name === 'link5') {
    const uploadForm = document.getElementById('uploadFotoForm');
    const fotoInput = document.getElementById('fotoInput');
    const msgUpload = document.getElementById('msgUpload');
    const fotoEl = document.getElementById('fotoUsuario');
    const nomeEl = document.getElementById('nomeUsuario');
    const emailEl = document.getElementById('emailUsuario');

    const email = localStorage.getItem('userEmail');

    // Busca os dados do usuário do servidor (incluindo foto)
    fetch('https://proesportes.shop/get_usuario.php?email=' + encodeURIComponent(email))
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          localStorage.setItem('userFoto', data.usuario.foto); // foto do banco
          fotoEl.src = data.usuario.foto || 'img/user.jpg';
          nomeEl.textContent = data.usuario.nome || '';
          emailEl.textContent = data.usuario.email || '';
        } else {
          // Se não achou, usa dados do localStorage ou default
          fotoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
          nomeEl.textContent = localStorage.getItem('userNome') || '';
          emailEl.textContent = email || '';
        }
      })
      .catch(() => {
        // Em caso de erro, usa localStorage ou default
        fotoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
        nomeEl.textContent = localStorage.getItem('userNome') || '';
        emailEl.textContent = email || '';
      });

    // Código que já existia para upload da foto
    uploadForm.addEventListener('submit', function (ev) {
      ev.preventDefault();

      const file = fotoInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('foto', file);
      formData.append('email', email);

      fetch('https://proesportes.shop/upload_foto.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('userFoto', data.url);
            fotoEl.src = data.url;
            msgUpload.style.color = 'green';
            msgUpload.textContent = 'Foto enviada com sucesso!';
          } else {
            msgUpload.style.color = 'red';
            msgUpload.textContent = 'Erro: ' + data.message;
          }
        })
        .catch(err => {
          msgUpload.style.color = 'red';
          msgUpload.textContent = 'Erro ao enviar foto.';
          console.error(err);
        });
    });
  }
});
