//INICIALIZAÇÃO DO F7 QUANDO DISPOSITIVO ESTÁ PRONTO
document.addEventListener('deviceready', onDeviceReady, false);

// Navigation history tracker
window.navigationHistory = [];
window.maxHistorySize = 10;

function addToHistory(route) {
	if (route && route !== window.navigationHistory[window.navigationHistory.length - 1]) {
		window.navigationHistory.push(route);
		if (window.navigationHistory.length > window.maxHistorySize) {
			window.navigationHistory.shift();
		}
	}
}

function getPreviousRoute() {
	// Remove current route if it's the last in history
	if (window.navigationHistory.length > 1) {
		return window.navigationHistory[window.navigationHistory.length - 2];
	}
	return '/index/'; // Default fallback
}

function handleUniversalBackButton(e) {
	const currentRoute = mainView.router.currentRoute.path;
	
	// Special handling for main pages
	if (currentRoute === '/index/' || currentRoute === '/prof/') {
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
		const previousRoute = getPreviousRoute();
		console.log('Going back from', currentRoute, 'to', previousRoute);
		mainView.router.navigate(previousRoute, { force: true });
	}
}

function onDeviceReady() {
    let initialUrl = '/index/'; // URL padrão para alunos

    // Verifica se o usuário está logado
    if (localStorage.getItem('loggedIn') === 'true') {
        const userType = localStorage.getItem('userType'); // Obtém o tipo de usuário do localStorage

        // Define a URL inicial com base no tipo de usuário
        if (userType === 'prof') {
            initialUrl = '/prof/';
        }
    }

    // Cria a view principal com a URL inicial
    window.mainView = app.views.create('.view-main', { url: initialUrl });

    console.log(`Aplicativo inicializado com a URL: ${initialUrl}`);

	// Remove this duplicate line - the universal handler is already added in each page's pageInit
	// document.addEventListener("backbutton", handleUniversalBackButton, false);

	// Remove this duplicate deviceready listener
	// document.addEventListener("deviceready", onDeviceReady, false);

	// Adicionar tratamento especial para a rota da agenda
	app.views.main.router.on('routeChange', function (newRoute, previousRoute, router) {
		console.log('Mudança de rota detectada:', newRoute.path);

		if (newRoute.path === '/agenda/') {
			console.log('🗓️ Navegando para agenda - preparando inicialização...');

			// Aguardar um pouco para garantir que a página foi carregada
			setTimeout(() => {
				if (typeof window.initCalendario === 'function') {
					console.log('🗓️ Forçando inicialização do calendário via rota...');
					window.initCalendario();
				} else {
					console.warn('⚠️ Função initCalendario não encontrada');
				}
			}, 500);
		}
	});
}

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

					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldIndexCss = document.getElementById('index-css');
					if (oldIndexCss) {
						oldIndexCss.parentNode.removeChild(oldIndexCss);
					}

					const oldLoginCss = document.getElementById('login-css');
					if (oldLoginCss) {
						oldLoginCss.parentNode.removeChild(oldLoginCss);
					}

					const css = document.getElementById('login-css');
					if (css) css.remove();


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

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}

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

					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldIndexCss = document.getElementById('index-css');
					if (oldIndexCss) {
						oldIndexCss.parentNode.removeChild(oldIndexCss);
					}

					const css = document.getElementById('inicio-css');
					if (css) css.remove();

					const cssId = 'login-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/login.css';
						link.media = 'all';
						head.appendChild(link);
					}

					if (localStorage.getItem('loggedIn') === 'true') {
						app.views.main.router.navigate('/index/');
					}

					const senhaInput = page.el.querySelector('#senha');
					const changeIcon = page.el.querySelector('#viewPassword2');

					if (senhaInput && changeIcon) {
						changeIcon.addEventListener('click', function () {
							if (senhaInput.type === 'password') {
								senhaInput.type = 'text';
								changeIcon.classList.remove('ri-eye-line');
								changeIcon.classList.add('ri-eye-off-line');
							} else {
								senhaInput.type = 'password';
								changeIcon.classList.remove('ri-eye-off-line');
								changeIcon.classList.add('ri-eye-line');
							}
						});
					}

					$.getScript('js/login.js');

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldLoginCss = document.getElementById('login-css');
					if (oldLoginCss) {
						oldLoginCss.parentNode.removeChild(oldLoginCss);
					}

					const inicioCss = document.getElementById('inicio-css');
					if (inicioCss) inicioCss.remove();

					const cssId = 'cadastro-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/cadastro.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript('js/cadastro.js')
					$.getScript('js/mascara_cadastro.js')

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},

				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}

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
					// Limpa cache se mudou o tipo de usuário
					const currentUserType = localStorage.getItem('userType');
					const lastUserType = localStorage.getItem('lastUserType');

					console.log('pageBeforeIn /index/ - userType atual:', currentUserType, 'anterior:', lastUserType);

					if (currentUserType !== lastUserType) {
						limparCacheUsuario();
						localStorage.setItem('lastUserType', currentUserType);
					}
				},
				pageAfterIn: function (event, page) {
					// Força recarregamento dos dados do usuário
					console.log('pageAfterIn /index/ - carregando dados do aluno');
					setTimeout(() => carregarDadosUsuarioFresh('aluno'), 200);
				},
				pageInit: function (event, page) {

					const cssToRemove = [
						'login-css',
						'cadastro-css',
						'treino-css',
						'agenda-css',
						'perfil-aluno-css',
						'popup-solicitacoes-css',
						'popup-prof-css',
						'proatleta-plus-css',
						'popup-prof-css',
						'config-css',
						'chat-aluno-css',
						'ver-treinos-prof-css',
						'escolinhas-css',
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

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

					document.addEventListener('DOMContentLoaded', function () {
						atualizarTabbarPorTipoUsuario();
					});

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

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/proatletaplus/',
			url: 'proatletaplus.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {

					const cssToRemove = [
						'inicio-css',
						'treino-css',
						'agenda-css',
						'perfil-aluno-css',
						'config-css',
						'escolinhas-css',
						'chat-aluno-css',
						'popup-solicitacoes-css',
						'popup-prof-css',
						'ver-treinos-prof-css',
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

					const cssId = 'proatleta-plus-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/proatletaplus.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/treinos_aluno/',
			url: 'treinos_aluno.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {

					const cssToRemove = [
						'inicio-css',
						'proatleta-plus-css',
						'agenda-css',
						'perfil-aluno-css',
						'config-css',
						'escolinhas-css',
						'chat-aluno-css',
						'popup-solicitacoes-css',
						'popup-prof-css',
						'ver-treinos-prof-css',
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

					const cssId = 'treinos-aluno-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/treinos_aluno.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript('js/treinos_aluno.js');

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/ver_treinos_prof/',
			url: 'ver_treinos_prof.html',
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
					const cssId = 'ver-treinos-prof-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/ver_treinos_prof.css';
						link.media = 'all';
						head.appendChild(link);
					}

					const cssIndexId = 'index-css';
					if (!document.getElementById(cssIndexId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssIndexId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/index.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript('js/ver_treinos_prof.js');
				},
				pageBeforeRemove: function (event, page) {
					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/agenda/',
			url: 'agenda.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// Apenas log, sem inicialização aqui
					console.log('📱 Preparando página da agenda...');
					
					// Limpar variáveis globais para permitir nova inicialização
					if (typeof window.calendarioInstance !== 'undefined') {
						window.calendarioInstance = null;
					}
				},
				pageAfterIn: function (event, page) {
					// ÚNICA inicialização controlada após página estar visível
					console.log('📱 Página agenda totalmente carregada');
					setTimeout(() => {
						if (typeof window.initCalendario === 'function') {
							console.log('🗓️ Inicializando calendário via pageAfterIn...');
							window.initCalendario();
						} else {
							console.warn('⚠️ Função initCalendario não encontrada');
						}
					}, 300);
				},
				pageInit: function (event, page) {

					const cssToRemove = [
						'config-css',
						'agenda-css',
						'perfil-aluno-css',
						'popup-solicitacoes-css',
						'popup-prof-css',
						'popup-prof-css',
						'ver-treinos-prof-css',
						'escolinhas-css',
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

					const cssId = 'agenda-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/agenda.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Verificar se o script já foi carregado anteriormente
					if (typeof window.initCalendario === 'function') {
						console.log('Script agenda.js já existe, aguardando pageAfterIn...');
						// NÃO inicializar aqui, deixar para pageAfterIn
					} else {
						console.log('Carregando script agenda.js...');
						// Carrega JavaScript da agenda com callback
						$.getScript('js/agenda.js')
							.done(function (script, textStatus) {
								console.log('Script agenda.js carregado com sucesso:', textStatus);
								// NÃO inicializar aqui, deixar para pageAfterIn
							})
							.fail(function (jqxhr, settings, exception) {
								console.error('Erro ao carregar agenda.js:', exception);
							});
					}

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					console.log('Agenda: pageBeforeRemove - Limpando recursos...');

					// Limpar completamente todas as instâncias e flags
					if (typeof window.calendarioInstance !== 'undefined') {
						window.calendarioInstance = null;
					}
					
					// Limpar flag de inicialização (se existir globalmente)
					if (typeof window.isInitializing !== 'undefined') {
						window.isInitializing = false;
					}

					// Remover apenas o CSS da agenda
					const agendaCss = document.getElementById('agenda-css');
					if (agendaCss) {
						agendaCss.parentNode.removeChild(agendaCss);
					}

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/agenda_prof/',
			url: 'agenda_prof.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
				},
				pageAfterIn: function (event, page) {
				},
				pageInit: function (event, page) {

					const oldIndexCss = document.getElementById('index-prof-css');
					if (oldIndexCss) {
						oldIndexCss.parentNode.removeChild(oldIndexCss);
					}

					const oldAgendaAlunoCss = document.getElementById('agenda-aluno-css');
					if (oldAgendaAlunoCss) {
						oldAgendaAlunoCss.parentNode.removeChild(oldAgendaAlunoCss);
					}

					const oldPerfilCss = document.getElementById('perfil-css');
					if (oldPerfilCss) {
						oldPerfilCss.parentNode.removeChild(oldPerfilCss);
					}


					// Adiciona o CSS específico da agenda_prof
					const cssId = 'agenda-prof-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/agenda_prof.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Carrega o JS da agenda_prof
					$.getScript('js/agenda_prof.js')
						.done(function () {
							console.log('agenda_prof.js carregado');
						})
						.fail(function (jqxhr, settings, exception) {
							console.error('Erro ao carregar agenda_prof.js:', exception);
						});

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove o CSS da agenda_prof ao sair da página

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/link5/',
			url: 'link5.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					// Reaplica o CSS da página
					
				},
				pageInit: function (event, page) {

					const cssToRemove = [
						'config-css',
						'agenda-css',
						'treinos-aluno-css',
						'proatleta-plus-css',
						'index-css',
						'chat-aluno-css',
						'ver-treinos-prof-css',
						'escolinhas-css',
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

					const cssId = 'perfil-aluno-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/perfil_aluno.css';
						link.media = 'all';
						head.appendChild(link);
					}

					const cssPopupId = 'popup-solicitacoes-css';
					if (!document.getElementById(cssPopupId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssPopupId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/popup_solicitacao.css';
						link.media = 'all';
						head.appendChild(link);
					}

					const cssPopupprof = 'popup-prof-css';
					if (!document.getElementById(cssPopupprof)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssPopupprof;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/popup_prof.css';
						link.media = 'all';
						head.appendChild(link);
					}


					// Scripts gerais da página
					$.getScript('js/config.js');
					$.getScript('js/salvar_foto.js');
					$.getScript('js/popup_solicitacoes.js');
					$.getScript('js/popup_associados.js');

					// Inicialização do Sheet Modal
					const btnprof = page.el.querySelector("#btnProfessores");
					const btnass = page.el.querySelector("#btnAssociados");
					const sheet = page.el.querySelector("#sheetProfessores");
					const sheet2 = page.el.querySelector("#sheetAssociado");
					const closeBtn = sheet ? sheet.querySelector(".close-sheet") : null;
					const closeBtn2 = sheet2 ? sheet2.querySelector(".close-sheet2") : null;

					if (btnprof && sheet && closeBtn) {
						btnprof.addEventListener("click", function (e) {
							e.preventDefault();
							app.sheet.open(sheet);
						});

						closeBtn.addEventListener("click", function () {
							app.sheet.close(sheet);
						});
					}

					if (btnass && sheet2 && closeBtn2) {
						btnass.addEventListener("click", function (e) {
							e.preventDefault();
							app.sheet.open(sheet2);
						});

						closeBtn2.addEventListener("click", function () {
							app.sheet.close(sheet2);
						});
					}

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Clean up any inline styles that might have been added
					document.querySelectorAll('link[href*="perfil"]').forEach(link => {
						if (link.id && (link.id.includes('perfil') || link.id.includes('popup'))) {
							link.remove();
						}
					});

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			},
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
					const cssToRemove = [
						'index-prof-css',
						'treino-prof-css',
						'perfil-css',
						'agenda-css'
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

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

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('index-css');
					if (css) css.remove();

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

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

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('inicio-css');
					if (css) css.remove();

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldEscolinhasCss = document.getElementById('escolinhas-css');
					if (oldEscolinhasCss) {
						oldEscolinhasCss.parentNode.removeChild(oldEscolinhasCss);
					}

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

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					// fazer algo quando a página for inicializada
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},
		{
			path: '/prof/',
			url: 'index_prof.html',
			animate: true,
			on: {
				pageBeforeIn: function (event, page) {
					// Limpa cache se mudou o tipo de usuário
					const currentUserType = localStorage.getItem('userType');
					const lastUserType = localStorage.getItem('lastUserType');

					console.log('pageBeforeIn /prof/ - userType atual:', currentUserType, 'anterior:', lastUserType);

					if (currentUserType !== lastUserType) {
						limparCacheUsuario();
						localStorage.setItem('lastUserType', currentUserType);
					}
				},
				pageAfterIn: function (event, page) {
					// Força recarregamento dos dados do usuário
					console.log('pageAfterIn /prof/ - carregando dados do professor');
					setTimeout(() => carregarDadosUsuarioFresh('prof'), 200);
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const cssToRemove = [
						'login-css',
						'cadastro-css',
						'inicio-css',
						'perfil-css',
						'agenda-prof-css'
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});


					const cssId = 'index-prof-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/index_prof.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript('js/index_prof.js');

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/teste/',
			url: 'teste.html',
			animate: true,
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
		{
			path: '/perfil_prof/',
			url: 'perfil_prof.html',
			animate: true,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida

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

					const cssPopupAluno = 'popup_alunos-css';
					if (!document.getElementById(cssPopupAluno)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssPopupAluno;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/popup_alunos.css';
						link.media = 'all';
						head.appendChild(link);
					}

					const css = document.getElementById('agenda-prof-css');
					if (css) css.remove();

					const cssChatProf = document.getElementById('chat-prof-css');
					if (cssChatProf) cssChatProf.remove();

				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					// fazer algo quando a página for inicializada

					const oldCss = document.getElementById('treinos-prof-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldAgendaCss = document.getElementById('agenda-prof-css');
					if (oldAgendaCss) {
						oldAgendaCss.parentNode.removeChild(oldAgendaCss);
					}

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

					// Inicializa os scripts necessários
					$.getScript('js/config.js');
					$.getScript('js/foto_prof.js');
					$.getScript('js/solicitacao.js');
					$.getScript('js/popup_alunos.js');

					// Inicializa o Swiper
					var swiper1 = new Swiper(".mySwiper_prof", {
						slidesPerView: 1,
						spaceBetween: 30,
						loop: false,
						pagination: {
							el: ".swiper-pagination",
							clickable: true,
						},
						navigation: {
							nextEl: ".swiper-button-next",
							prevEl: ".swiper-button-prev",
						},
					});

					// Configura o botão para abrir o Sheet Modal
					const btnAlunos = page.el.querySelector("#btnAlunos");
					const sheetAlunos = page.el.querySelector("#sheetAlunos");
					const closeAlunos = sheetAlunos ? sheetAlunos.querySelector(".close-sheet2") : null;

					if (btnAlunos && sheetAlunos && closeAlunos) {
						btnAlunos.addEventListener("click", function (e) {
							e.preventDefault();
							app.sheet.open(sheetAlunos);
						});

						closeAlunos.addEventListener("click", function () {
							app.sheet.close(sheetAlunos);
						});
					}

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/treinos_prof/',
			url: 'treinos_prof.html',
			animate: true,
			on: {
				pageBeforeIn: function (event, page) {
					
				},
				pageAfterIn: function (event, page) {
					
				},
				pageInit: function (event, page) {
					console.log('Página treinos_prof inicializando...');

					// Remove CSS antigo da agenda se existir - com mais CSS para limpar
					const cssToRemove = [
						'agenda-prof-css',
						'perfil-css',
						'adicionar-treino-css',
						'ver-treinos-aluno-css',
						'agenda-css'
					];
					
					cssToRemove.forEach(cssId => {
						const oldCss = document.getElementById(cssId);
						if (oldCss) {
							oldCss.parentNode.removeChild(oldCss);
							console.log(`Removido CSS antigo: ${cssId}`);
						}
					});

					// Garantir que o CSS correto está carregado
					const cssId = 'treinos-prof-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/treinos_prof.css';
						link.media = 'all';
						head.appendChild(link);
						console.log('CSS treinos_prof adicionado');
					}

					// Carregar o script treinos_prof.js
					$.getScript('js/treinos_prof.js')
						.done(function (script, textStatus) {
							console.log('treinos_prof.js carregado com sucesso:', textStatus);
						})
						.fail(function (jqxhr, settings, exception) {
							console.error('Erro ao carregar treinos_prof.js:', exception);

							// Fallback: executar lógica básica inline
							setTimeout(() => {
								carregarAlunosFallback();
							}, 500);
						});

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// NÃO remover o CSS aqui para evitar problemas quando voltando

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		// Rota para adicionar treino
		{
			path: '/adicionar_treino/',
			url: 'adicionar_treinos.html',
			animate: true,
			on: {
				pageBeforeIn: function (event, page) {
					console.log('adicionar_treino: pageBeforeIn');
					
					// Limpar CSS conflitantes antes de carregar a página
					const conflictingCss = [
						'treinos-prof-css',
						'ver-treinos-aluno-css', 
						'ver-treinos-prof-css',
						'agenda-css',
						'perfil-css'
					];
					
					conflictingCss.forEach(cssId => {
						const element = document.getElementById(cssId);
						if (element) {
							element.parentNode.removeChild(element);
						}
					});
				},
				pageInit: function (event, page) {
					console.log('adicionar_treino: pageInit');
					
					// Carrega o script de adicionar treino
					$.getScript('js/adicionar_treino.js');
			
					// Remove CSS conflitantes
					const oldCss = document.getElementById('treinos-prof-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					// Adiciona CSS específico
					const cssId = 'adicionar-treino-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/adicionar_treino.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					console.log('adicionar_treino: pageBeforeRemove');
					// Limpar CSS específico ao sair
					const css = document.getElementById('adicionar-treino-css');
					if (css) {
						css.parentNode.removeChild(css);
					}

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				}
			}
		},

		{
			path: '/ver_treinos_aluno/',
			url: 'ver_treinos_aluno.html',
			animate: true,
			on: {
				pageInit: function (event, page) {
					// A lógica já está inline no HTML

					const oldCss = document.getElementById('treinos-prof-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldInicioCss = document.getElementById('inicio-css');
					if (oldInicioCss) {
						oldInicioCss.parentNode.removeChild(oldInicioCss);
					}

					const oldProAtletaPlusCss = document.getElementById('proatleta-plus-css');
					if (oldProAtletaPlusCss) {
						oldProAtletaPlusCss.parentNode.removeChild(oldProAtletaPlusCss);
					}

					const oldAgendaCss = document.getElementById('agenda-css');
					if (oldAgendaCss) {
						oldAgendaCss.parentNode.removeChild(oldAgendaCss);
					}

					const oldPerfilCss = document.getElementById('perfil-aluno-css');
					if (oldPerfilCss) {
						oldPerfilCss.parentNode.removeChild(oldPerfilCss);
					}

					const oldPopupSolicitacoesCss = document.getElementById('popup-solicitacoes-css');
					if (oldPopupSolicitacoesCss) {
						oldPopupSolicitacoesCss.parentNode.removeChild(oldPopupSolicitacoesCss);
					}

					const oldPopupProfCss = document.getElementById('popup-prof-css');
					if (oldPopupProfCss) {
						oldPopupProfCss.parentNode.removeChild(oldPopupProfCss);
					}

					const oldChatAlunoCss = document.getElementById('chat-aluno-css');
					if (oldChatAlunoCss) {
						oldChatAlunoCss.parentNode.removeChild(oldChatAlunoCss);
					}

					const oldVerTreinosProfCss = document.getElementById('ver-treinos-prof-css');
					if (oldVerTreinosProfCss) {
						oldVerTreinosProfCss.parentNode.removeChild(oldVerTreinosProfCss);
					}

					$.getScript('js/ver_treinos_aluno.js')

					const cssId = 'ver-treinos-aluno-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/ver_treinos_aluno.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				}
			}
		},

		{
			path: '/detalhe_treino/',
			url: 'detalhe_treino.html',
			animate: true,
			on: {
				pageInit: function (event, page) {
					// Carrega detalhes do treino
				}
			}
		},
		{
			path: '/agenda_aluno/',
			url: 'agenda_aluno.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
					console.log('Preparando para carregar agenda do aluno...');
				},
				pageAfterIn: function (event, page) {
					// Não inicializar imediatamente, deixar o loading screen aparecer primeiro
					console.log('Página agenda do aluno carregada, iniciando em 200ms...');
				},
				pageInit: function (event, page) {
					console.log('Inicializando página agenda_aluno...');

					// Remove CSS antigo se existir
					const oldCss = document.getElementById('agenda-aluno-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const oldAgendaProfCss = document.getElementById('agenda-prof-css');
					if (oldAgendaProfCss) {
						oldAgendaProfCss.parentNode.removeChild(oldAgendaProfCss);
					}

					const oldAgendaCss = document.getElementById('agenda-css');
					if (oldAgendaCss) {
						oldAgendaCss.parentNode.removeChild(oldAgendaCss);
					}

					// Adiciona o CSS específico da agenda do aluno
					const cssId = 'agenda-aluno-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/agenda_aluno.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Aguardar CSS carregar e então carregar o JS
					setTimeout(() => {
						$.getScript('js/agenda_aluno.js')
							.done(function () {
								console.log('agenda_aluno.js carregado com sucesso');
								
								// Aguardar mais um pouco para garantir que tudo está pronto
								setTimeout(() => {
									if (typeof initAgendaAluno === 'function') {
										console.log('Inicializando agenda do aluno...');
										initAgendaAluno();
									} else {
										console.error('Função initAgendaAluno não encontrada');
									}
								}, 100);
							})
							.fail(function (jqxhr, settings, exception) {
								console.error('Erro ao carregar agenda_aluno.js:', exception);
								
								// Mostrar erro de carregamento
								const overlay = document.getElementById('loadingOverlay');
								if (overlay) {
									overlay.innerHTML = `
										<div class="loading-content">
											<div class="loading-spinner" style="color: #ff4444;">
												<i class="ri-error-warning-line"></i>
											</div>
											<h3>Erro ao Carregar</h3>
											<p>Não foi possível carregar os recursos necessários</p>
											<button onclick="location.reload()" style="background: white; color: var(--laranja); border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px;">
												Tentar Novamente
											</button>
										</div>
									`;
								}
							});
					}, 200);
				},
				pageBeforeRemove: function (event, page) {
					console.log('Agenda Aluno: pageBeforeRemove');

					// Limpar instância
					if (typeof window.agendaAlunoInstance !== 'undefined') {
						window.agendaAlunoInstance = null;
					}

					// Remover CSS
					const css = document.getElementById('agenda-aluno-css');
					if (css) css.remove();

					// Remove back button listener
					if (page.backButtonHandler) {
						document.removeEventListener("backbutton", page.backButtonHandler, false);
					}
				},
			}
		},
		{
			path: '/chat_aluno/',
			url: 'chat_aluno.html',
			animate: true,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageInit: function (event, page) {
					// Adiciona o CSS da página

					const css = document.getElementById('perfil_aluno-css');
					if (css) css.remove();

					const oldPerfilCss = document.getElementById('perfil-aluno-css');
					if (oldPerfilCss) {
						oldPerfilCss.parentNode.removeChild(oldPerfilCss);
					}

					const oldPopupSolicitacoesCss = document.getElementById('popup-solicitacoes-css');
					if (oldPopupSolicitacoesCss) {
						oldPopupSolicitacoesCss.parentNode.removeChild(oldPopupSolicitacoesCss);
					}

					const oldPopupProfCss = document.getElementById('popup-prof-css');
					if (oldPopupProfCss) {
						oldPopupProfCss.parentNode.removeChild(oldPopupProfCss);
					}

					const cssChatAluno = 'chat-aluno-css';
					if (!document.getElementById(cssChatAluno)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssChatAluno;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/chat_aluno.css';
						link.media = 'all';
						head.appendChild(link);
					}

					// Carrega o script da página
					$.getScript('js/chat_aluno.js');

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function (event, page) {
					// Remove o CSS da página ao sair dela
				},
			}
		},

		{
			path: '/chat_prof/',
			url: 'chat_prof.html',
			animate: true,
			on: {
				pageInit: function (event, page) {

					const css = document.getElementById('perfil-css');
					if (css) css.remove();

					const cssId = 'chat-prof-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/chat_aluno.css';
						link.media = 'all';
						head.appendChild(link);
					}

					$.getScript('js/chat_prof.js');

					// Add back button listener for this page
					const handleBackButton = (e) => handleUniversalBackButton(e);
					document.addEventListener("backbutton", handleBackButton, false);
					
					// Store reference to remove later
					page.backButtonHandler = handleBackButton;
				},
				pageBeforeRemove: function () {
					const css = document.getElementById('chat-prof-css');
					if (css) css.remove();
				},
			},
		},
	],

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
	// Add to navigation history
	addToHistory(route.url);
	
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


// Guarda a última rota que não seja /config/
window.lastNonConfigRoute = '/index/';
app.on('routeChange', function (route) {
	// Já existem outros listeners; este só cuida da última rota útil
	if (route.url && route.url !== '/config/' && !route.url.startsWith('http')) {
		window.lastNonConfigRoute = route.url;
	}
});

function onDeviceReady() {
    let initialUrl = '/inicio/'; // URL padrão para usuários não logados

    // Verifica se o usuário está logado
    if (localStorage.getItem('loggedIn') === 'true') {
        const userType = localStorage.getItem('userType'); // Obtém o tipo de usuário do localStorage

        // Define a URL inicial com base no tipo de usuário
        if (userType === 'prof') {
            initialUrl = '/prof/'; // Página inicial para professores
        } else {
            initialUrl = '/index/'; // Página inicial para alunos
        }
    }

    // Cria a view principal com a URL inicial
    window.mainView = app.views.create('.view-main', { url: initialUrl });
	
	// Adicionar tratamento especial para a rota da agenda
	app.views.main.router.on('routeChange', function (newRoute, previousRoute, router) {
		console.log('Mudança de rota detectada:', newRoute.path);

		if (newRoute.path === '/agenda/') {
			console.log('🗓️ Navegando para agenda - preparando inicialização...');

			// Aguardar um pouco para garantir que a página foi carregada
			setTimeout(() => {
				if (typeof window.initCalendario === 'function') {
					console.log('🗓️ Forçando inicialização do calendário via rota...');
					window.initCalendario();
				} else {
					console.warn('⚠️ Função initCalendario não encontrada');
				}
			}, 500);
		}
	});
}

function protegerRotas(route) {
	const paginasProtegidas = [
		'/adicionar_treino/',
		'/agenda_prof/',
		'/agenda/',
		'/agenda_aluno/',
		'/cadastro/',
		'/config/',
		'/escolinhas/',
		'/esporte_escolinha/',
		'/index_prof/',
		'/index/',
		'/inicio/',
		'/link5/',
		'/login/',
		'/peneiras/',
		'/perfil_prof/',
		'/proatletaplus/',
		'/treinos_aluno/',
		'/treinos_prof/',
		'/ver_treinos_aluno/',
		'/ver_treinos_prof/',
		'/chat_aluno/',
		'/chat_prof/'
	];

	const estaLogado = localStorage.getItem('loggedIn') === 'true';

	if (paginasProtegidas.includes(route.url) && !estaLogado) {
		console.log('Tentativa de acesso sem login. Redirecionando para /inicio/');
		app.views.main.router.navigate('/inicio/', { clearPreviousHistory: true });
		return false;
	}
	return true;
}

// ========================================
// FUNÇÃO FALLBACK PARA TREINOS_PROF
// ========================================

// Expor funções globalmente para uso nos botões
window.carregarAlunos = carregarAlunos;
window.adicionarTreino = adicionarTreino;
window.verTreinos = verTreinos;
window.irParaPerfil = irParaPerfil;
window.filtrarAlunos = filtrarAlunos;

// Add this function after the existing functions
function limparCacheUsuario() {
	// Remove dados específicos do usuário anterior
	localStorage.removeItem('userFoto');
	localStorage.removeItem('userNome');
	console.log('Cache do usuário limpo');
}

function carregarDadosUsuarioFresh(userType) {
	const email = localStorage.getItem('userEmail');
	if (!email) return;

	console.log('Carregando dados frescos para:', userType);

	// Usar o mesmo endpoint dos perfis (sem /php/)
	fetch('https://proatleta.site/get_usuario.php?email=' + encodeURIComponent(email))
		.then(response => response.json())
		.then(data => {
			if (data.success && data.usuario) {
				// Atualiza localStorage com dados frescos
				localStorage.setItem('userNome', data.usuario.nome);
				localStorage.setItem('userFoto', data.usuario.foto || 'img/user.jpg');

				console.log('Dados atualizados:', data.usuario.nome, data.usuario.foto);

				// Força atualização da UI após 100ms para garantir que elementos existam
				setTimeout(() => {
					const nameEl = document.getElementById('welcomeUserName');
					const photoEl = document.getElementById('welcomeUserPhoto');

					if (nameEl) nameEl.textContent = data.usuario.nome;
					if (photoEl) photoEl.src = data.usuario.foto || 'img/user.jpg';

					console.log('UI atualizada com dados frescos');
				}, 100);
			}
		})
		.catch(error => {
			console.error('Erro ao carregar dados do usuário:', error);
		});
}