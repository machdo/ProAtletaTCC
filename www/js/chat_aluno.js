document.addEventListener('page:afterin', function (e) {
    if (e.detail.name === 'chat_aluno') {
        // Simula os dados do professor (substitua com dados reais do servidor)
        const professor = {
            nome: localStorage.getItem('profNome') || 'Nome do Professor',
            email: localStorage.getItem('profEmail') || 'email@exemplo.com',
            foto: localStorage.getItem('profFoto') || 'img/user.jpg',
            escolinha: 'Pendente' // Campo fixo
        };

        // Atualiza os elementos da página com os dados do professor
        const profNomeEl = document.getElementById('profNome');
        const profEmailEl = document.getElementById('profEmail');
        const profFotoEl = document.getElementById('profFoto');
        const profEscolinhaEl = document.getElementById('profEscolinha');

        if (profNomeEl && profEmailEl && profFotoEl && profEscolinhaEl) {
            profNomeEl.textContent = professor.nome;
            profEmailEl.textContent = professor.email;
            profFotoEl.src = professor.foto;
            profEscolinhaEl.textContent = professor.escolinha;
        } else {
            console.error('Elementos da página não encontrados.');
        }
    }
});