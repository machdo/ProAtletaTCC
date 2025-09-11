document.getElementById('buscarAlunoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const emailAluno = document.getElementById('busca_email').value;
    const idProfessor = parseInt(localStorage.getItem('professor_id'), 10); // pega o ID do professor do login

    // Valida ID do professor antes de enviar
    if (isNaN(idProfessor)) {
        app.dialog.alert('ID do professor inválido. Faça login novamente.', 'Erro');
        return;
    }

    const params = new URLSearchParams();
    params.append("busca_email", emailAluno);
    params.append("id_professor", idProfessor);

    fetch('https://proatleta.site/solicitacao.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro na rede');
            return response.json();
        })
        .then(data => {
            console.log("Resposta do servidor:", data);
            if (data.success) {
                app.dialog.alert(data.message, 'Sucesso');
            } else {
                app.dialog.alert(data.message, 'Erro');
            }
        })
        .catch(error => {
            console.error(error);
            app.dialog.alert('Ocorreu um erro ao enviar os dados.', 'Erro');
        });
});

// Executa após o carregamento inicial da página
document.addEventListener('DOMContentLoaded', function () {
    atualizarTabbarPorTipoUsuario();
});

// Esconde a tabbar quando o teclado é aberto (input focado)
$(document).on('focusin', 'input, textarea', function () {
    $('.toolbar-bottom').css('display', 'none');
});

// Mostra a tabbar quando o teclado é fechado (input desfocado)
$(document).on('focusout', 'input, textarea', function () {
    $('.toolbar-bottom').css('display', '');
});

// Garante que a tabbar aparece ao voltar para a página
document.addEventListener('backbutton', function () {
    $('.toolbar-bottom').css('display', '');
}, false);

$$(document).on('page:afterin', function () {
    $('.toolbar-bottom').css('display', '');
});