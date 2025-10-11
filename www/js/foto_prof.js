document.addEventListener('page:afterin', function (e) {
    if (e.detail.name === 'perfil_prof') {
        const uploadProfForm = document.getElementById('uploadFotoprofForm');
        const fotoInput2 = document.getElementById('fotoInput2');
        const fotoProfEl = document.getElementById('fotoProf');
        const nomeProfEl = document.getElementById('nomeProf');
        const emailProfEl = document.getElementById('emailProf');
        const msgUpload = document.getElementById('msgUpload'); // pode ser nulo
        const email = localStorage.getItem('userEmail');

        // Busca os dados do usuário do servidor (incluindo foto)
        fetch('https://proatleta.site/get_usuario.php?email=' + encodeURIComponent(email))
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('userFoto', data.usuario.foto);
                    if (fotoProfEl) fotoProfEl.src = data.usuario.foto || 'img/user.jpg';
                    if (nomeProfEl) nomeProfEl.textContent = data.usuario.nome || '';
                    if (emailProfEl) emailProfEl.textContent = data.usuario.email || '';
                } else {
                    if (fotoProfEl) fotoProfEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
                    if (nomeProfEl) nomeProfEl.textContent = localStorage.getItem('userNome') || '';
                    if (emailProfEl) emailProfEl.textContent = email || '';
                }
            })
            .catch(() => {
                if (fotoProfEl) fotoProfEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
                if (nomeProfEl) nomeProfEl.textContent = localStorage.getItem('userNome') || '';
                if (emailProfEl) emailProfEl.textContent = email || '';
            });

        // Função para enviar a foto ao servidor
        function uploadFoto(file) {
            if (!file) return;
            const formData2 = new FormData();
            formData2.append('foto2', file);
            formData2.append('email', email);

            if (msgUpload) {
                msgUpload.style.color = '#444';
                msgUpload.textContent = 'Enviando...';
            }

            fetch('https://proatleta.site/upload_fotoProf.php', {
                method: 'POST',
                body: formData2
            })
                .then(res => res.json())
                .then(data => {
                    if (data && data.success) {
                        localStorage.setItem('userFoto', data.url);
                        if (fotoProfEl) fotoProfEl.src = data.url;
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
        if (fotoInput2 && fotoInput2.dataset._fp_inited !== '1') {
            fotoInput2.dataset._fp_inited = '1';
            fotoInput2.addEventListener('change', function (ev) {
                const file = ev.target.files[0];
                if (!file) return;

                // Dialog sem título usando Framework7
                if (typeof app !== 'undefined' && app.dialog && app.dialog.create) {
                    const dlg = app.dialog.create({
                        title: '',
                        text: 'tem certeza que deseja alterar a imagem?',
                        buttons: [
                            {
                                text: app.params && app.params.dialog && app.params.dialog.buttonCancel ? app.params.dialog.buttonCancel : 'Cancelar',
                                onClick: function () {
                                    if (fotoInput2) fotoInput2.value = '';
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
                    // fallback para confirm
                    const ok = confirm('tem certeza que deseja alterar a imagem?');
                    if (ok) {
                        uploadFoto(file);
                    } else {
                        fotoInput2.value = '';
                    }
                }
            });
        }

        // Mantém comportamento do formulário caso o usuário prefira clicar "Salvar Foto"
        if (uploadProfForm && uploadProfForm.dataset._fp_inited !== '1') {
            uploadProfForm.dataset._fp_inited = '1';
            uploadProfForm.addEventListener('submit', function (ev) {
                ev.preventDefault();
                const file = fotoInput2 ? fotoInput2.files[0] : null;
                if (!file) return;
                uploadFoto(file);
            });
        }
    }
});