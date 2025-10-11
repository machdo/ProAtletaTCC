document.addEventListener('page:afterin', function (e) {
    if (e.detail.name === 'chat_prof') {
        // Recupera os dados do aluno do localStorage
        const aluno = {
            nome: localStorage.getItem('chatAlunoNome') || 'Nome do Aluno',
            email: localStorage.getItem('chatAlunoEmail') || 'email@exemplo.com',
            foto: localStorage.getItem('chatAlunoFoto') || 'img/user.jpg',
            escolinha: localStorage.getItem('chatAlunoEscolinha') || 'Pendente'
        };

        // Atualiza os elementos da página com os dados do aluno
        const alunoNomeEl = document.getElementById('alunoNome');
        const alunoEmailEl = document.getElementById('alunoEmail');
        const alunoFotoEl = document.getElementById('alunoFoto');
        const alunoEscolinhaEl = document.getElementById('alunoEscolinha');

        if (alunoNomeEl && alunoEmailEl && alunoFotoEl && alunoEscolinhaEl) {
            alunoNomeEl.textContent = aluno.nome;
            alunoEmailEl.textContent = aluno.email;
            alunoFotoEl.src = aluno.foto;
            alunoEscolinhaEl.textContent = aluno.escolinha;
        } else {
            console.error('Elementos da página não encontrados.');
        }
    }
});