// Script responsável pelo bloco de boas-vindas da tela do professor

(function () {
    // acesso rápido aos elementos
    function getEls() {
        return {
            nameEl: document.getElementById('welcomeUserName'),
            photoEl: document.getElementById('welcomeUserPhoto'),
            email: localStorage.getItem('userEmail'),
        };
    }

    // Atualiza UI a partir do localStorage
    function renderFromStorage() {
        const els = getEls();
        if (els.nameEl) els.nameEl.textContent = localStorage.getItem('userNome') || 'Professor';
        if (els.photoEl) els.photoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
    }

    // Busca dados atualizados do servidor e atualiza localStorage + UI
    function fetchAndUpdate() {
        const els = getEls();
        const email = els.email;
        if (!email) return;

        const url = 'https://proatleta.site/php/get_usuario.php?email=' + encodeURIComponent(email);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.success && data.usuario) {
                    if (data.usuario.nome) {
                        localStorage.setItem('userNome', data.usuario.nome);
                        if (els.nameEl) els.nameEl.textContent = data.usuario.nome;
                    }
                    if (data.usuario.foto) {
                        localStorage.setItem('userFoto', data.usuario.foto);
                        if (els.photoEl) els.photoEl.src = data.usuario.foto;
                    }
                }
            })
            .catch(err => {
                console.warn('index_prof.js: erro ao buscar usuário', err);
            });
    }

    // Função principal para carregar foto (usa localStorage imediatamente e tenta buscar)
    function carregarFotoUsuario() {
        const els = getEls();
        if (!els.photoEl) return;

        // render rápido com localStorage
        const stored = localStorage.getItem('userFoto');
        if (stored) els.photoEl.src = stored;

        // buscar no servidor (se tiver email ou id)
        const email = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        if (!email && !userId) return;

        const url = email ? ('https://proatleta.site/php/get_usuario.php?email=' + encodeURIComponent(email))
            : ('https://proatleta.site/php/get_usuario.php?id=' + encodeURIComponent(userId));

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Resposta não OK');
                return res.json();
            })
            .then(data => {
                if (data && data.success && data.usuario) {
                    if (data.usuario.foto) {
                        localStorage.setItem('userFoto', data.usuario.foto);
                        els.photoEl.src = data.usuario.foto;
                    }
                    if (data.usuario.nome) {
                        localStorage.setItem('userNome', data.usuario.nome);
                        const nameEl = document.getElementById('welcomeUserName');
                        if (nameEl) nameEl.textContent = data.usuario.nome;
                    }
                }
            })
            .catch(err => {
                // mantém foto do storage ou padrão
                if (!stored && els.photoEl) els.photoEl.src = 'img/user.jpg';
                console.warn('index_prof.js carregarFotoUsuario erro', err);
            });
    }

    // Inicialização imediata quando o script for carregado (se o DOM já tiver os elementos)
    function initIfReady() {
        renderFromStorage();
        carregarFotoUsuario();
        fetchAndUpdate();
    }

    // Inicializa sempre que a página do Framework7 for exibida (rota /prof/)
    document.addEventListener('page:afterin', function (e) {
        // quando carregar a página via router, atualizar
        initIfReady();
    });

    // Também tenta quando o DOM estiver pronto (cobre carregamento direto)
    document.addEventListener('DOMContentLoaded', function () {
        initIfReady();
    });

    // init imediato por segurança (caso o script seja carregado após DOM)
    initIfReady();

})();