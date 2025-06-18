document.getElementById('cadastroForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar').value;

    const temMaiuscula = /[A-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    if (!temMaiuscula || !temNumero) {
        app.dialog.alert('A senha deve conter pelo menos uma letra maiúscula e um número.', 'Erro na Senha');
        return;
    }

    if (senha !== confirmar) {
        app.dialog.create({
            title: 'Erro na Senha',
            text: 'As senhas não são iguais.',
            buttons: [
                {
                    text: 'OK',
                    onClick: function () {
                        return;
                    }
                }
            ]
        }).open();
        return;
    }

    fetch('https://proesportes.shop/cadastro.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
    })
        .then(response => response.text())
        .then(text => {
            console.log("Resposta bruta:", text);

            try {
                const data = JSON.parse(text);

                if (data.success) {
                    app.dialog.create({
                        title: 'Verifique seu E-Mail',
                        text: 'Um link de verificação foi enviado para o seu e-mail. Clique nele para ativar sua conta.',
                        buttons: [
                            {
                                text: 'OK',
                                onClick: function () {
                                    window.location.href = 'index.html';
                                }
                            }
                        ]
                    }).open();
                } else {
                    app.dialog.alert(data.message || 'Erro ao cadastrar.', 'Erro');
                }
            } catch (e) {
                console.error('Erro ao converter resposta em JSON:', e);
                app.dialog.alert('Erro inesperado na resposta do servidor.', 'Erro');
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
            app.dialog.alert('Ocorreu um erro ao enviar os dados. Dados já cadastrados.', 'Erro');
        });
});
