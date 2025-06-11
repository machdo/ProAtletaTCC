//INICIALIZAÇÃO DO F7 QUANDO DISPOSITIVO ESTÁ PRONTO
document.addEventListener('deviceready', onDeviceReady, false);
window.app = new Framework7({
	// App root element
	el: '#app',
	// App Name
	name: 'My App',
	// App id
	id: 'com.myapp.test',
	// Enable swipe panel
	panel: {
		swipe: true,
	},
	dialog: {
		buttonOk: 'Sim',
		buttonCancel: 'Cancelar',
	},
	// Add default routes
	routes: [
		{
			path: '/inicio/',
			url: 'inicio.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit({ page }) {
					// fazer algo quando a página for inicializada

					const cssId = 'inicio-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/inicio.css';
						link.media = 'all';
						head.appendChild(link);
					}
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('inicio-css');
					if (css) css.remove();
				},
			}
		},

		{
			path: '/login/',
			url: 'login.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const css = document.getElementById('inicio-css');
					if (css) css.remove();

					if (localStorage.getItem('loggedIn') === 'true') {
						app.views.main.router.navigate('/index/');
					}

					$.getScript('js/login.js');
					$.getScript('js/mascaras.js');

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},

		{
			path: '/cadastro/',
			url: 'cadastro.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit({ page }) {
					const inicioCss = document.getElementById('inicio-css');
					if (inicioCss) inicioCss.remove();

					$.getScript('js/cadastro.js')
				},

				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					removeCSS('css/cadastro.css');
				},
			}
		},

		{
			path: '/index/',
			url: 'index.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada
					
					const css = document.getElementById('perfil-css');
					if (css) css.remove();
					
					$.getScript('js/index.js');

					var swiper = new Swiper(".mySwiper", {
						slidesPerView: 1,
						spaceBetween: 30,
						autoplay: true,
						delay: 3000,
						loop: true,
						breakpoints: {
							0: {
								slidesPerView: 1,
								spaceBetween: 30
							},
							640: {
								slidesPerView: 2,
								spaceBetween: 30
							},
							992: {
								slidesPerView: 3,
								spaceBetween: 30
							},
							1200: {
								slidesPerView: 4,
								spaceBetween: 30
							},

						}
					});

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},
		{
			path: '/link2/',
			url: 'link2.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const css = document.getElementById('perfil-css');
					if (css) css.remove();

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},
		{
			path: '/link3/',
			url: 'link3.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const css = document.getElementById('perfil-css');
					if (css) css.remove();

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},
		{
			path: '/link4/',
			url: 'link4.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const css = document.getElementById('perfil-css');
					if (css) css.remove();

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},
		{
			path: '/link5/',
			url: 'link5.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const cssId = 'perfil-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/perfil.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript('js/config.js');

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('perfil-css');
					if (css) css.remove();

				},
			}
		},
		{
			path: '/config/',
			url: 'config.html',
			animate: true, // <- animação ativada
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida

					$.getScript('js/config.js');

				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const cssId = 'index-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/index.css';
						link.media = 'all';
						head.appendChild(link);
					}

					if (localStorage.getItem('loggedIn') !== 'true') {
						app.views.main.router.navigate('/inicio/');
						return;
					}
					// Exibe os dados do usuário na página, por exemplo:
					document.getElementById('nomeUsuario').textContent = localStorage.getItem('userNome') || 'Usuário';
					document.getElementById('emailUsuario').textContent = localStorage.getItem('userEmail') || '';

				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('index-css');
					if (css) css.remove();

				},
			}
		},
		{
			path: '/escolinhas/',
			url: 'escolinhas.html',
			animate: true, // <- animação ativada
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const cssId = 'escolinhas-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/escolinhas.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript("js/escolinha.js");
					console.log('Página escolinhas carregada');

					const input = page.el.querySelector('#endereco');
					const resultados = page.el.querySelector('#resultados');
					const enderecoDiv = page.el.querySelector('#endereco-escolinha');
					const clearBtn = page.el.querySelector('.icon.clear');

					function toggleClear() {
						if (input.value.trim() !== '') {
							clearBtn.style.display = 'block';
						} else {
							clearBtn.style.display = 'none';
						}
					}

					function clearInput() {
						input.value = '';
						toggleClear();
						input.focus();
					}

					input.addEventListener('input', toggleClear);
					clearBtn.addEventListener('click', clearInput);

					input.addEventListener('keypress', (e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							buscarEscolinhas(page);
						}
					});

					const btnBuscar = page.el.querySelector('#btnBuscar');
					btnBuscar.addEventListener('click', () => {
						buscarEscolinhas(page);
					});
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('inicio-css');
					if (css) css.remove();

				},
			}
		},
		{
			path: '/esporte_escolinha/',
			url: 'esporte_escolinha.html',
			animate: true, // <- animação ativada
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada
					const cssId = 'esporte-escolinha-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/index.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Lógica dos botões diretamente no pageInit
					const buttons = page.el.querySelectorAll('.sport-button');
					const linkContainer = page.el.querySelector('#goToEscolinhas');

					buttons.forEach(btn => {
						btn.addEventListener('click', () => {
							buttons.forEach(b => b.classList.remove('selected'));
							btn.classList.add('selected');
							const esporte = btn.dataset.sport;
							localStorage.setItem('esporteSelecionado', esporte);
							linkContainer.style.display = 'block';
						});
					});
				},
				pageBeforeRemove: function () {
					// Remove o CSS da página ao sair dela
					const css = document.getElementById('esporte-escolinha-css');
					if (css) css.remove();
				},
			}
		},
		{
			path: '/peneiras/',
			url: 'peneiras.html',
			animate: true, // <- animação ativada
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},

	],
	// ... other parameters
});

var tabbar = document.querySelector('.toolbar-bottom');

// Evento para controlar a visibilidade da tabbar conforme a rota
app.on('routeChange', function (route) {
	const currentPath = route.url;

	// Lista de páginas onde a tabbar deve ser ocultada
	const paginasSemTabbar = ['/inicio/', '/cadastro/', '/login/'];

	if (paginasSemTabbar.includes(currentPath)) {
		tabbar.style.display = 'none';
	} else {
		tabbar.style.display = 'flex'; // ou 'block'
	}
});




//Para testes direto no navegador
//var mainView = app.views.create('.view-main', { url: '/index/' });

//EVENTO PARA SABER O ITEM DO MENU ATUAL
app.on('routeChange', function (route) {

	protegerRotas(route);

	var currentRoute = route.url;
	console.log(currentRoute);
	document.querySelectorAll('.tab-link').forEach(function (el) {
		el.classList.remove('active');
	});
	var targetEl = document.querySelector('.tab-link[href="' + currentRoute + '"]');
	if (targetEl) {
		targetEl.classList.add('active');
	}
});


function onDeviceReady() {
	//Quando estiver rodando no celular
	let initialUrl = '/inicio/';
	if (localStorage.getItem('loggedIn') === 'true') {
		initialUrl = '/index/';
	}

	window.mainView = app.views.create('.view-main', { url: initialUrl });

	document.addEventListener("backbutton", function (e) {
		if (mainView.router.currentRoute.path === '/index/') {
			e.preventDefault();
			app.dialog.create({
				title: 'Sair do ProAtleta',
				text: 'Quer mesmo sair do ProAtleta?',
				buttons: [
					{
						text: 'Não',
						close: true
					},
					{
						text: 'Sim',
						onClick: function () {
							navigator.app.exitApp();
						}
					}
				]
			}).open();

		} else {
			e.preventDefault();
			mainView.router.back({ force: true });
		}
	}, false);
}

function protegerRotas(route) {
	const paginasProtegidas = [
		'/index/',
		'/config/',
		'/escolinhas/',
		'/esporte_escolinha/',
		'/peneiras/',
		'/link2/',
		'/link3/',
		'/link4/',
		'/link5/'
	];

	const estaLogado = localStorage.getItem('loggedIn') === 'true';

	if (paginasProtegidas.includes(route.url) && !estaLogado) {
		console.log('Tentativa de acesso sem login. Redirecionando para /inicio/');
		app.views.main.router.navigate('/inicio/', { clearPreviousHistory: true });
		return false;
	}
	return true;
}

