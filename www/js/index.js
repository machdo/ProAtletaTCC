// Não criar Framework7 se já existir (routes.js já inicializa em seu projeto)
if (!window.app) {
    window.app = new Framework7({
        // ...existing code...
    });
} else {
    console.log('Framework7 já inicializado — reutilizando window.app');
}
// garantir referência local para o resto do arquivo
var app = window.app;

// Immediately load user data
(function loadUserData() {
    const welcomeNameEl = document.getElementById('welcomeUserName');
    const welcomePhotoEl = document.getElementById('welcomeUserPhoto');
    const userEmail = localStorage.getItem('userEmail');
    
    // Set initial data from localStorage
    if (welcomeNameEl) {
        welcomeNameEl.textContent = localStorage.getItem('userNome') || 'Atleta';
    }
    if (welcomePhotoEl) {
        welcomePhotoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
    }

    // Get fresh data from server
    if (userEmail) {
        fetch('https://proatleta.site/php/get_usuario.php?email=' + encodeURIComponent(userEmail))
            .then(response => response.json())
            .then(data => {
                if (data.success && data.usuario) {
                    // Update localStorage
                    localStorage.setItem('userNome', data.usuario.nome);
                    localStorage.setItem('userFoto', data.usuario.foto);

                    // Update UI
                    if (welcomeNameEl) {
                        welcomeNameEl.textContent = data.usuario.nome;
                    }
                    if (welcomePhotoEl && data.usuario.foto) {
                        welcomePhotoEl.src = data.usuario.foto;
                    }
                }
            })
            .catch(error => console.error('Erro ao carregar dados:', error));
    }
})();

// Keep existing tabbar update function
function atualizarTabbarPorTipoUsuario() { 
    const userType = localStorage.getItem('userType');

    document.querySelectorAll('.aluno-link, .prof-link').forEach(el => {
        el.style.display = 'none';
    });

    if (userType === 'aluno') {
        document.querySelectorAll('.aluno-link').forEach(el => {
            el.style.display = 'flex';
        });
    } else if (userType === 'prof') {
        document.querySelectorAll('.prof-link').forEach(el => {
            el.style.display = 'flex';
        });
    }
}

function atualizarDadosUsuario() {
    const welcomeNameEl = document.getElementById('welcomeUserName');
    const welcomePhotoEl = document.getElementById('welcomeUserPhoto');
    const email = localStorage.getItem('userEmail');

    // Primeiro atualiza com dados do localStorage
    if (welcomeNameEl) {
        welcomeNameEl.textContent = localStorage.getItem('userNome') || 'Atleta';
    }
    if (welcomePhotoEl) {
        welcomePhotoEl.src = localStorage.getItem('userFoto') || 'img/user.jpg';
    }

    // Depois busca dados atualizados do servidor
    if (email) {
        fetch('https://proatleta.site/php/get_usuario.php?email=' + encodeURIComponent(email))
            .then(res => res.json())
            .then(data => {
                if (data.success && data.usuario) {
                    // Atualiza localStorage
                    localStorage.setItem('userFoto', data.usuario.foto || '');
                    localStorage.setItem('userNome', data.usuario.nome || '');

                    // Atualiza UI
                    if (welcomeNameEl) {
                        welcomeNameEl.textContent = data.usuario.nome || 'Atleta';
                    }
                    if (welcomePhotoEl && data.usuario.foto) {
                        welcomePhotoEl.src = data.usuario.foto;
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados do usuário:', error);
                // Em caso de erro, mantém os dados do localStorage
            });
    }
}

// Carrega e exibe a foto do usuário (usa localStorage ou busca no servidor se necessário)
function carregarFotoUsuario() {
    var welcomePhotoEl = document.getElementById('welcomeUserPhoto');
    if (!welcomePhotoEl) {
        // Se o elemento ainda não existir, nada a fazer
        return;
    }

    // Se já tiver foto em localStorage, usa imediatamente (fast render)
    var storedFoto = localStorage.getItem('userFoto');
    if (storedFoto) {
        welcomePhotoEl.src = storedFoto;
    }

    // Tenta obter identificador do usuário (prefira email)
    var email = localStorage.getItem('userEmail');
    var userId = localStorage.getItem('userId');

    // Se não houver email mas existir userId, você pode usar endpoint por id (ajuste se existir)
    if (!email && !userId) {
        // nada para buscar do servidor
        return;
    }

    // Monta URL de busca (usar email quando disponível)
    var url = email
        ? 'https://proatleta.site/php/get_usuario.php?email=' + encodeURIComponent(email)
        : 'https://proatleta.site/php/get_usuario.php?id=' + encodeURIComponent(userId);

    fetch(url)
        .then(function (res) {
            if (!res.ok) throw new Error('Resposta do servidor não OK');
            return res.json();
        })
        .then(function (data) {
            if (data && data.success && data.usuario) {
                var foto = data.usuario.foto || '';
                var nome = data.usuario.nome || '';

                if (foto) {
                    localStorage.setItem('userFoto', foto);
                    welcomePhotoEl.src = foto;
                }

                if (nome) {
                    localStorage.setItem('userNome', nome);
                    var nameEl = document.getElementById('welcomeUserName');
                    if (nameEl) nameEl.textContent = nome;
                }
            }
        })
        .catch(function (err) {
            // Em caso de erro, mantém a foto do localStorage ou padrão
            console.warn('carregarFotoUsuario: erro ao buscar foto do servidor', err);
            if (!storedFoto) {
                welcomePhotoEl.src = 'img/user.jpg';
            }
        });
}

// Chamar imediatamente para garantir que foto apareça na primeira abertura
carregarFotoUsuario();

// Garantir que foto seja atualizada quando a página index for exibida pelo router
document.addEventListener('page:afterin', function (e) {
    if (e && e.detail && e.detail.page && e.detail.page.name === 'index') {
        carregarFotoUsuario();
    }
});

// Também garante quando o DOM é carregado (cobertura extra)
document.addEventListener('DOMContentLoaded', function () {
    carregarFotoUsuario();
});

// Executa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    atualizarTabbarPorTipoUsuario();
    atualizarDadosUsuario();
});

// Atualiza quando retornar para a página
document.addEventListener('page:afterin', function(e) {
    if (e.detail.page && e.detail.page.name === 'index') {
        atualizarDadosUsuario();
    }
});