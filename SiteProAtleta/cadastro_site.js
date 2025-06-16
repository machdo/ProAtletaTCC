document.getElementById('cadastroForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const senhaRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,14}$/;

  if (!emailRegex.test(email)) {
    document.getElementById('mensagem').innerText = 'E-mail inválido.';
    return;
  }

  if (!senhaRegex.test(senha)) {
    document.getElementById('mensagem').innerText =
      'A senha deve ter entre 8 e 14 caracteres, com pelo menos uma letra maiúscula e um número.';
    return;
  }

  fetch('https://mediumslateblue-ibex-354235.hostingersite.com/cadastro_site.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Cadastro realizado com sucesso! Verifique seu e-mail.');
        window.location.href = 'index.html';
      } else {
        document.getElementById('mensagem').innerText = data.message || 'Erro ao cadastrar.';
      }
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
      document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
    });
});

  const senhaInput = document.getElementById('senha');
  const changeIcon = document.getElementById('viewPassword');

  changeIcon.addEventListener('click', function () {
    const tipoAtual = senhaInput.getAttribute('type');
    if (tipoAtual === 'password') {
      senhaInput.setAttribute('type', 'text');
      changeIcon.classList.remove('fa-eye');
      changeIcon.classList.add('fa-eye-slash');
    } else {
      senhaInput.setAttribute('type', 'password');
      changeIcon.classList.remove('fa-eye-slash');
      changeIcon.classList.add('fa-eye');
    }
  });


