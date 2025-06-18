document.getElementById('cadastroForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;

  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);

  if (!temMaiuscula || !temNumero) {
    Swal.fire({
      title: 'Erro na Senha',
      text: 'A senha deve conter pelo menos uma letra maiúscula e um número.',
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: {
        confirmButton: 'meu-botao-personalizado'
      }
    });
    return;
  }

  if (senha !== confirmar) {
    Swal.fire({
      title: 'Erro na Senha',
      text: 'As senhas não são iguais.',
      icon: 'warning',
      confirmButtonText: 'Ok',
      customClass: {
        confirmButton: 'meu-botao-personalizado'
      }
    });
    return;
  }

  fetch('https://proesportes.shop/cadastro_site.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
          title: 'Verifique seu E-Mail',
          text: 'Um link de verificação foi enviado para o seu e-mail. Clique nele para ativar sua conta.',
          icon: 'success',
          confirmButtonText: 'Ok',
          customClass: {
            confirmButton: 'meu-botao-personalizado'
          }
        }).then(() => {
          window.location.href = 'index.html';
        });
      } else {
        document.getElementById('mensagem').innerText = data.message || 'Erro ao cadastrar.';
      }
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
      document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
    });
});


