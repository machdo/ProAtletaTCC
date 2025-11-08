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
    fetch('https://proatleta.site/get_usuario.php?email=' + encodeURIComponent(email))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('userFoto', data.usuario.foto); // foto do banco
          if (fotoEl) fotoEl.src = data.usuario.foto || 'img/user.jpg';
          if (nomeEl) nomeEl.textContent = data.usuario.nome || '';
          if (emailEl) emailEl.textContent = data.usuario.email || '';
        } else {
          // Se não achou, usa dados do localStorage ou default
          if (fotoEl) fotoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
          if (nomeEl) nomeEl.textContent = localStorage.getItem('userNome') || '';
          if (emailEl) emailEl.textContent = email || '';
        }
      })
      .catch(() => {
        // Em caso de erro, usa localStorage ou default
        if (fotoEl) fotoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
        if (nomeEl) nomeEl.textContent = localStorage.getItem('userNome') || '';
        if (emailEl) emailEl.textContent = email || '';
      });

    // Função de upload
    function uploadFoto(file) {
      if (!file) return;
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('email', email);

      if (msgUpload) {
        msgUpload.style.color = '#444';
        msgUpload.textContent = 'Enviando...';
      }

      fetch('https://proatleta.site/upload_foto.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            localStorage.setItem('userFoto', data.url);
            if (fotoEl) fotoEl.src = data.url;
            if (msgUpload) {
              msgUpload.style.color = 'green';
              msgUpload.textContent = 'Foto enviada com sucesso!';
            }
          } else {
            if (msgUpload) {
              msgUpload.style.color = 'red';
              msgUpload.textContent = 'Erro: ' + (data && data.message ? data.message : 'Falha no upload');
            }
          }
        })
        .catch(err => {
          if (msgUpload) {
            msgUpload.style.color = 'red';
            msgUpload.textContent = 'Erro ao enviar foto.';
          }
          console.error('uploadFoto error:', err);
        });
    }

    // Evita múltiplos listeners ao reentrar na página
    if (fotoInput && fotoInput.dataset._sf_inited !== '1') {
      fotoInput.dataset._sf_inited = '1';
      fotoInput.addEventListener('change', function (ev) {
        const file = ev.target.files[0];
        if (!file) return;

        // usa dialog sem título do Framework7, com "Cancelar" e "Sim"
        if (typeof app !== 'undefined' && app.dialog && app.dialog.create) {
          const dlg = app.dialog.create({
            title: '',
            text: 'tem certeza que deseja alterar a imagem?',
            buttons: [
              {
                text: app.params && app.params.dialog && app.params.dialog.buttonCancel ? app.params.dialog.buttonCancel : 'Cancelar',
                onClick: function () {
                  if (fotoInput) fotoInput.value = '';
                }
              },
              {
                text: app.params && app.params.dialog && app.params.dialog.buttonOk ? app.params.dialog.buttonOk : 'Sim',
                bold: true,
                onClick: function () {
                  uploadFoto(file);
                }
              }
            ]
          });
          dlg.open();
        } else {
          // fallback para confirm nativo
          const ok = confirm('tem certeza que deseja alterar a imagem?');
          if (ok) {
            uploadFoto(file);
          } else {
            fotoInput.value = '';
          }
        }
      });
    }

    // Mantém comportamento do formulário caso o usuário prefira clicar "Editar Perfil"
    if (uploadForm && uploadForm.dataset._sf_inited !== '1') {
      uploadForm.dataset._sf_inited = '1';
      uploadForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const file = fotoInput ? fotoInput.files[0] : null;
        if (!file) return;
        uploadFoto(file);
      });
    }
  }
});