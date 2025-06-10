document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  fetch('https://mediumslateblue-ibex-354235.hostingersite.com/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
  })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Ver no console
      if (data.success) {
        // Salva no localStorage para manter sessão
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userNome', data.nome || 'Usuário');
        localStorage.setItem('userEmail', email);

        app.dialog.create({
          title: 'Sucesso',
          text: 'Login bem sucedido!',
          buttons: [
            {
              text: 'Entrar',
              onClick: function () {
                app.views.main.router.navigate('/index/');
              }
            }
          ]
        }).open();
      } else {
        document.getElementById('mensagemLogin').innerText = data.message;
      }
    })
    .catch(error => {
      document.getElementById('mensagemLogin').innerText = 'Erro ao fazer login.';
      console.error(error);
    });
});
