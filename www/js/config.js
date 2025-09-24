document.addEventListener('page:afterin', function (e) {
  const pageName = e.detail.name;
  const pageEl = e.target;

  // Atualiza dados do perfil (caso seja a página de perfil)
  if (pageName === 'link5') {
    const nomeEl = document.getElementById('nomeUsuario');
    const emailEl = document.getElementById('emailUsuario');
    if (nomeEl) nomeEl.textContent = localStorage.getItem('userNome') || 'Usuário';
    if (emailEl) emailEl.textContent = localStorage.getItem('userEmail') || 'email@exemplo.com';
  }

  // Botão logout
  const logoutBtn = pageEl.querySelector('#btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.clear();
      location.href = 'index.html'; // ← garante que tudo seja recarregado do zero
    }, { once: true });
  }

  // Botão voltar: volta para a página anterior no histórico
  const backBtn = pageEl.querySelector('.btn-voltar');
  if (backBtn) {
    backBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      const destino = window.lastNonConfigRoute || '/index/';
      if (window.app && app.views?.main?.router) {
        app.views.main.router.navigate(destino, { animate: true, reloadCurrent: false });
      } else {
        // Fallback caso router não esteja disponível
        location.href = destino.replace(/\/$/, '') + '.html';
      }
    }, { once: true });
  }
});
