// Limita a senha para no máximo 14 caracteres enquanto digita
document.getElementById("senha").addEventListener("input", function (event) {
  let input = event.target.value;
  if (input.length > 14) {
    input = input.slice(0, 14);
  }
  event.target.value = input;
});

// Limita o nome e email para no máximo 60 caracteres enquanto digita
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

// Lógica de envio do formulário de cadastro
document.getElementById('cadastroForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const senhaRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,14}$/;

  if (nome.length > 60) {
    document.getElementById('mensagem').innerText = 'O nome não pode ter mais de 60 caracteres.';
    return;
  }

  if (email.length > 60) {
    document.getElementById('mensagem').innerText = 'O e-mail não pode ter mais de 60 caracteres.';
    return;
  }

  if (!emailRegex.test(email)) {
    document.getElementById('mensagem').innerText = 'E-mail inválido.';
    return;
  }

  if (!senhaRegex.test(senha)) {
    document.getElementById('mensagem').innerText =
      'A senha deve ter entre 8 e 14 caracteres, com pelo menos uma letra maiúscula e um número.';
    return;
  }

  fetch('https://mediumslateblue-ibex-354235.hostingersite.com/cadastro.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
  })
    .then(response => response.text())
    .then(text => {
      console.log("Resposta bruta:", text);

      try {
        const data = JSON.parse(text);

        if (data.success) {
          app.dialog.create({
            title: 'Verifique seu e-mail',
            text: 'Um link de verificação foi enviado para o seu e-mail. Clique nele para ativar sua conta.',
            buttons: [
              {
                text: 'OK',
                onClick: function () {
                  window.location.href = 'index.html';
                }
              }
            ]
          }).open();
        } else {
          app.dialog.alert(data.message || 'Erro ao cadastrar.', 'Erro');
        }
      } catch (e) {
        console.error('Erro ao converter resposta em JSON:', e);
        app.dialog.alert('Erro inesperado na resposta do servidor.', 'Erro');
      }
    })
    .catch(error => {
      console.error(error);
      document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
      app.dialog.alert('Ocorreu um erro ao enviar os dados. Dados já cadastrados.', 'Erro');
    });
});
