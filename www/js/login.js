document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  fetch('https://proatleta.site/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);

      if (data.success) {
        const categoria = data.categoria || 'aluno';
        const nome = data.nome || 'Usuário';
        const id = data.id; // <--- O ID é obtido aqui

        // Salva dados no localStorage
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userNome', nome);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', categoria);
        localStorage.setItem('userId', id); // <--- O ID do usuário é salvo aqui
        
        // Salva o ID em um campo específico para o tipo de usuário
        if (categoria === 'prof') {
            localStorage.setItem('professor_id', id);
        } else {
            localStorage.setItem('aluno_id', id);
        }

        // Atualiza tabbar de acordo com o tipo
        if (typeof atualizarTabbarPorTipoUsuario === 'function') {
          atualizarTabbarPorTipoUsuario();
        }

        // Mostra alerta e redireciona para a rota certa
        app.dialog.create({
          title: 'Sucesso',
          text: 'Login bem-sucedido!',
          buttons: [
            {
              text: 'Entrar',
              onClick: function () {
                const rota = (categoria === 'prof') ? '/prof/' : '/index/';
                app.views.main.router.navigate(rota, {
                  reloadCurrent: true,
                  ignoreCache: true,
                  clearPreviousHistory: true
                });
              }
            }
          ]
        }).open();
      } else {
        document.getElementById('mensagemLogin').innerText = data.message || 'Email ou senha incorretos.';
      }
    })
    .catch(error => {
      document.getElementById('mensagemLogin').innerText = 'Erro ao fazer login.';
      console.error(error);
    });
});