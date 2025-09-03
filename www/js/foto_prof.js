document.addEventListener('page:afterin', function (e) {
    if (e.detail.name === 'perfil_prof') {
        const uploadProfForm = document.getElementById('uploadFotoprofForm');
        const fotoInput2 = document.getElementById('fotoInput2');
        const fotoProfEl = document.getElementById('fotoProf');
        const nomeProfEl = document.getElementById('nomeProf');
        const emailProfEl = document.getElementById('emailProf');

        const email = localStorage.getItem('userEmail');

        // Busca os dados do usuário do servidor (incluindo foto)
        fetch('https://proatleta.site/get_usuario.php?email=' + encodeURIComponent(email))
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('userFoto', data.usuario.foto); // foto do banco
                    fotoProfEl.src = data.usuario.foto || 'img/user.jpg';
                    nomeProfEl.textContent = data.usuario.nome || '';
                    emailProfEl.textContent = data.usuario.email || '';
                } else {
                    // Se não achou, usa dados do localStorage ou default
                    fotoProfEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
                    nomeProfEl.textContent = localStorage.getItem('userNome') || '';
                    emailProfEl.textContent = email || '';
                }
            })
            .catch(() => {
                // Em caso de erro, usa localStorage ou default
                fotoProfEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
                nomeProfEl.textContent = localStorage.getItem('userNome') || '';
                emailProfEl.textContent = email || '';
            });

        // Código que já existia para upload da foto
        uploadProfForm.addEventListener('submit', function (ev) {
            ev.preventDefault();

            const file = fotoInput2.files[0];
            if (!file) return;

            const formData2 = new FormData();
            formData2.append('foto2', file);
            formData2.append('email', email);

            fetch('https://proatleta.site/upload_fotoProf.php', {
                method: 'POST',
                body: formData2
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('userFoto', data.url);
                        fotoProfEl.src = data.url;
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
