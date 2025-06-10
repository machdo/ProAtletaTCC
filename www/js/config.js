document.addEventListener('page:afterin', function (e) {
  const pageName = e.detail.name;

  if (pageName === 'config') {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        localStorage.clear();
        app.views.main.router.navigate('/inicio/');
      });
    }
  }

  if (pageName === 'link5') {
    const nomeEl = document.getElementById('nomeUsuario');
    const emailEl = document.getElementById('emailUsuario');

    if (nomeEl) nomeEl.textContent = localStorage.getItem('userNome') || 'Usuário';
    if (emailEl) emailEl.textContent = localStorage.getItem('userEmail') || 'email@exemplo.com';
  }



  const pageEl = e.target;
  const logoutBtn = pageEl.querySelector('#btnLogout');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.clear();
      app.views.main.router.navigate('/inicio/');
    });
  }
});