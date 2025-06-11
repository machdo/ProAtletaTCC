// Limita a senha para no máximo 14 caracteres enquanto digita
document.getElementById("senha").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 14) {
    input = input.slice(0, 14);
  }
  event.target.value = input;
});

document.getElementById("nome").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 60) {
    input = input.slice(0, 60);
  }
  event.target.value = input;
});

document.getElementById("email").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 60) {
    input = input.slice(0, 60);
  }
  event.target.value = input;
});

// Lógica de envio do formulário de login
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  // Validação antes do envio
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById('mensagemLogin').innerText = 'E-mail inválido.';
    return;
  }

  if (senha.length > 14) {
    document.getElementById('mensagemLogin').innerText = 'Senha deve ter no máximo 14 caracteres.';
    return;
  }

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
