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
		.then(response => response.json())
		.then(data => {
			console.log(data); // Ver resposta no console

			if (data.success) {
				console.log("Cadastro realizado com sucesso! Tentando redirecionar...");

				if (app && app.views && app.views.main) {
					app.dialog.create({
						title: 'Sucesso',
						text: 'Cadastro feito com sucesso!',
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
					app.dialog.alert('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.', 'Erro');
				}
			}

		})
		.catch(error => {
			console.error(error);
			document.getElementById('mensagem').innerText = 'Erro ao enviar dados.';
			app.dialog.alert('Ocorreu um erro ao enviar os dados. Dados já cadastrados.', 'Erro');
		});
});