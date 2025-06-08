document.getElementById('cadastroForm').addEventListener('submit', function (e) {
	e.preventDefault();

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const senha = document.getElementById('senha').value;

	fetch('https://mediumslateblue-ibex-354235.hostingersite.com/cadastro.php', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: `nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
	})
	.then(response => response.text())
	.then(text => {
		console.log("Resposta bruta:", text); // debug

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
