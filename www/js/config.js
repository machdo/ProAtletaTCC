document.addEventListener('page:afterin', function (e) {
  if (e.detail.route.path === '/config/') {
    if (localStorage.getItem('loggedIn') !== 'true') {
      app.views.main.router.navigate('/inicio/');
      return;
    }

    document.querySelector('#nomeUsuario').textContent = localStorage.getItem('userNome') || 'Usuário';
    document.querySelector('#emailUsuario').textContent = localStorage.getItem('userEmail') || '';

    const pageEl = e.target;
    const logoutBtn = pageEl.querySelector('#btnLogout');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        localStorage.clear();
        app.views.main.router.navigate('/inicio/');
      });
    }
  }
});
