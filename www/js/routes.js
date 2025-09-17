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

					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

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

					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
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


				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM

					const css = document.getElementById('login-css');
					if (css) css.remove();

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

					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					const css = document.getElementById('perfil-css');
					if (css) css.remove();

					document.addEventListener('DOMContentLoaded', function () {
						atualizarTabbarPorTipoUsuario();
					});

					$.getScript('js/index.js');
					$.getScript('js/entrada.js');

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
			path: '/sport-treino/',
			url: 'sport-treino.html',
			animate: false,
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

					// Adiciona o CSS da página sport-treino
					const cssId = 'sport-treino-css';
					if (!document.getElementById(cssId)) {
						const head = document.head;
						const link = document.createElement('link');
						link.id = cssId;
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'css/index.css'; // ou outro CSS específico se existir
						link.media = 'all';
						head.appendChild(link);
					}

					const css = document.getElementById('perfil-css');
					if (css) css.remove();
				},
				pageBeforeRemove: function (event, page) {
					// Remove o CSS da página sport-treino
					const css = document.getElementById('sport-treino-css');
					if (css) css.remove();
				},
			}
		},
		{
			path: '/treino-fut/',
			url: 'treino-fut.html',
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
			path: '/treino-volei/',
			url: 'treino-volei.html',
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
			path: '/treino-basq/',
			url: 'treino-basq.html',
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
			path: '/basq-func/',
			url: 'basq-func.html',
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
			path: '/treino-tenis/',
			url: 'treino-tenis.html',
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
			path: '/agenda/',
			url: 'agenda.html',
			animate: false,
			on: {
				pageBeforeIn: function (event, page) {
				},
				pageAfterIn: function (event, page) {
					// Garantir que o calendário seja inicializado após a página estar visível
					setTimeout(() => {
						if (typeof initCalendario === 'function') {
							console.log('Reinicializando calendário...');
							initCalendario();
						} else if (typeof window.initCalendario === 'function') {
							console.log('Reinicializando calendário (window)...');
							window.initCalendario();
						}
					}, 100);
				},
				pageInit: function (event, page) {
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

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
						console.log('Script agenda.js já existe, reinicializando...');
						// Aguardar um pouco para garantir que o CSS foi aplicado
						setTimeout(() => {
							try {
								window.initCalendario();
							} catch (error) {
								console.error('Erro ao reinicializar calendário:', error);
							}
						}, 150);
					} else {
						console.log('Carregando script agenda.js...');
						// Carrega JavaScript da agenda com callback
						$.getScript('js/agenda.js')
							.done(function (script, textStatus) {
								console.log('Script agenda.js carregado com sucesso:', textStatus);
								// Aguardar um pouco para garantir inicialização
								setTimeout(() => {
									if (typeof window.initCalendario === 'function') {
										console.log('Inicializando calendário após carregamento...');
										window.initCalendario();
									} else {
										console.warn('initCalendario não encontrado após carregamento');
									}
								}, 200);
							})
							.fail(function (jqxhr, settings, exception) {
								console.error('Erro ao carregar agenda.js:', exception);
							});
					}
				},
				pageBeforeRemove: function (event, page) {
					console.log('Agenda: pageBeforeRemove');

					// Limpar instância do calendário
					if (typeof window.calendarioInstance !== 'undefined') {
						window.calendarioInstance = null;
					}

					// Remover apenas o CSS da agenda
					const agendaCss = document.getElementById('agenda-css');
					if (agendaCss) {
						agendaCss.parentNode.removeChild(agendaCss);
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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
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
				},
				pageBeforeRemove: function (event, page) {
					// Remove o CSS da agenda_prof ao sair da página
					const css = document.getElementById('agenda-prof-css');
					if (css) css.remove();
				},
			}
		},
		{
			path: '/link5/',
			url: 'link5.html',
			animate: false,
			on: {
				pageInit: function (event, page) {
					// Adiciona CSS da página
					const cssId = 'perfil_aluno-css';
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

					// Adiciona CSS do Sheet Modal
					const cssPopupId = 'popup_solicitacoes-css';
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

					const cssPopupprof = 'popup_prof-css';
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

				},
				pageBeforeRemove: function (event, page) {
					// Remove CSS da página e do Sheet Modal
					const css = document.getElementById('perfil_aluno-css');
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

					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
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
					$.getScript('js/foto_prof.js');
					$.getScript('js/solicitacao.js');

					var swiper1 = new Swiper(".mySwiper_prof", {
						slidesPerView: 1,
						spaceBetween: 30,
						loop: false,
						pagination: {
							el: ".swiper-pagination",
							clickable: true,
						},
					});


				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
				},
			}
		},
		{
			path: '/treinos_prof/',
			url: 'treinos_prof.html',
			animate: true,
			on: {
				pageBeforeIn: function (event, page) {
					// fazer algo antes da página ser exibida
				},
				pageAfterIn: function (event, page) {
					// fazer algo depois da página ser exibida
				},
				pageInit: function (event, page) {
					console.log('Página treinos_prof inicializando...');
					
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

					// Carregar o script treinos_prof.js
					$.getScript('js/treinos_prof.js')
						.done(function(script, textStatus) {
							console.log('treinos_prof.js carregado com sucesso:', textStatus);
						})
						.fail(function(jqxhr, settings, exception) {
							console.error('Erro ao carregar treinos_prof.js:', exception);
							
							// Fallback: executar lógica básica inline
							setTimeout(() => {
								carregarAlunosFallback();
							}, 500);
						});
				},
				pageBeforeRemove: function (event, page) {
					// fazer algo antes da página ser removida do DOM
					console.log('Saindo da página treinos_prof');
				},
			}
		},
		// Rota para adicionar treino
		{
			path: '/adicionar_treino/',
			url: 'adicionar_treinos.html',
			animate: true,
			on: {
				pageInit: function (event, page) {
					console.log('Página adicionar_treino inicializando...');
					// Carrega o script de adicionar treino
					$.getScript('js/adicionar_treino.js')
						.done(function() {
							console.log('adicionar_treino.js carregado com sucesso');
						})
						.fail(function(jqxhr, settings, exception) {
							console.error('Erro ao carregar adicionar_treino.js:', exception);
						});
				}
			}
		},

		// Rota para ver treinos do aluno
		{
			path: '/ver_treinos_aluno/',
			url: 'ver_treinos_aluno.html',
			animate: true,
			on: {
				pageInit: function (event, page) {
					console.log('Página ver_treinos_aluno inicializando...');
					// A lógica já está inline no HTML
				}
			}
		}

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
var mainView = app.views.create('.view-main', { url: '/inicio/' });

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
		'/agenda/',
		'/agenda_prof/',
		'/link5/',
		'/prof/',
		'/perfil_prof/',
		'/sport-treino/',
		'/treino-fut/',
		'/treino-volei/',
		'/treino-basq/',
		'/basq-func/',
		'/treino-tenis/',
		'/treinos_prof/',
		'/adicionar_treino/',
		'/ver_treinos_aluno/'
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

function carregarAlunosFallback() {
	console.log('Executando fallback para carregar alunos...');
	
	// Verificar dados do usuário
	let professorId = localStorage.getItem('professor_id');
	const userId = localStorage.getItem('userId');
	const userType = localStorage.getItem('userType');
	
	// Fallback para userId se for professor
	if (!professorId && userType === 'prof' && userId) {
		professorId = userId;
		localStorage.setItem('professor_id', professorId);
		console.log('professor_id definido automaticamente como:', professorId);
	}

	if (!professorId) {
		console.error('ID do professor não encontrado no fallback');
		mostrarErroFallback('ID do professor não encontrado. Por favor, faça login novamente.');
		return;
	}

	console.log('Buscando alunos para professor ID:', professorId);
	
	// Mostrar loading
	const container = document.getElementById('listaAlunos');
	if (container) {
		container.innerHTML = `
			<div class="empty-state">
				<i class="mdi mdi-loading mdi-spin"></i>
				<p>Carregando alunos... (Modo Fallback)</p>
			</div>
		`;
	}

	// Fazer requisição
	const url = `https://proatleta.site/get_alunos_professor.php?professor_id=${professorId}`;
	console.log('URL da requisição (fallback):', url);

	fetch(url)
		.then(response => {
			console.log('Resposta recebida (fallback):', response.status, response.ok);
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			return response.text();
		})
		.then(textResponse => {
			console.log('Resposta texto (fallback):', textResponse.substring(0, 100));
			
			let data;
			try {
				data = JSON.parse(textResponse);
			} catch (e) {
				console.error('Erro no parse JSON (fallback):', e);
				throw new Error('Resposta inválida do servidor');
			}
			
			console.log('Dados parseados (fallback):', data);
			
			if (data.success) {
				if (data.alunos && data.alunos.length > 0) {
					console.log(`${data.alunos.length} alunos encontrados (fallback)`);
					mostrarAlunosFallback(data.alunos);
				} else {
					console.log('Nenhum aluno encontrado (fallback)');
					mostrarListaVaziaFallback();
				}
			} else {
				console.error('Erro do servidor (fallback):', data.message);
				mostrarErroFallback(data.message || 'Erro do servidor');
			}
		})
		.catch(error => {
			console.error('Erro na requisição (fallback):', error);
			mostrarErroFallback('Erro ao carregar alunos: ' + error.message);
		});
}

function mostrarAlunosFallback(alunos) {
	console.log('Mostrando', alunos.length, 'alunos (fallback)');
	
	const container = document.getElementById('listaAlunos');
	if (!container) {
		console.error('Container listaAlunos não encontrado! (fallback)');
		return;
	}

	let html = '';
	alunos.forEach((aluno, index) => {
		const nome = aluno.nome || 'Nome não disponível';
		const email = aluno.email || 'Email não disponível';
		const totalTreinos = aluno.total_treinos || 0;
		
		html += `
			<div class="aluno-card" data-email="${email}">
				<div class="aluno-info">
					<div class="aluno-nome">${nome}</div>
					<div class="aluno-email">${email}</div>
					<small style="color: #666;">Treinos: ${totalTreinos}</small>
				</div>
				<div class="aluno-actions">
					<button class="btn-action btn-adicionar" onclick="adicionarTreinoFallback('${email}')">
						<i class="mdi mdi-plus"></i> Adicionar
					</button>
					<button class="btn-action btn-ver" onclick="verTreinosFallback('${email}')">
						<i class="mdi mdi-eye"></i> Ver
					</button>
				</div>
			</div>
		`;
	});

	container.innerHTML = html;
	console.log('Alunos exibidos com sucesso (fallback)');
}

function mostrarListaVaziaFallback() {
	const container = document.getElementById('listaAlunos');
	if (container) {
		container.innerHTML = `
			<div class="empty-state">
				<i class="mdi mdi-account-group-outline"></i>
				<h3>Nenhum aluno encontrado</h3>
				<p>Você ainda não tem alunos aceitos.</p>
				<p>Para vincular alunos, vá ao seu perfil e envie solicitações.</p>
				<button class="button button-fill" onclick="irParaPerfilFallback()">
					Ir para Perfil
				</button>
			</div>
		`;
	}
}

function mostrarErroFallback(mensagem) {
	const container = document.getElementById('listaAlunos');
	if (container) {
		container.innerHTML = `
			<div class="empty-state">
				<i class="mdi mdi-alert-circle-outline"></i>
				<h3>Erro (Modo Fallback)</h3>
				<p>${mensagem}</p>
				<button class="button button-outline" onclick="carregarAlunosFallback()">
					Tentar Novamente
				</button>
			</div>
		`;
	}
}

// Funções de navegação fallback
function adicionarTreinoFallback(email) {
	console.log('Adicionando treino para:', email, '(fallback)');
	localStorage.setItem('alunoSelecionado', email);
	
	if (typeof app !== 'undefined' && app.views && app.views.main) {
		app.views.main.router.navigate('/adicionar_treino/');
	} else {
		console.warn('App não disponível (fallback)');
	}
}

function verTreinosFallback(email) {
	console.log('Visualizando treinos para:', email, '(fallback)');
	localStorage.setItem('alunoSelecionado', email);
	
	if (typeof app !== 'undefined' && app.views && app.views.main) {
		app.views.main.router.navigate('/ver_treinos_aluno/');
	} else {
		console.warn('App não disponível (fallback)');
	}
}

function irParaPerfilFallback() {
	if (typeof app !== 'undefined' && app.views && app.views.main) {
		app.views.main.router.navigate('/perfil_prof/');
	} else {
		console.warn('App não disponível (fallback)');
	}
}

// Expor funções fallback globalmente
window.carregarAlunosFallback = carregarAlunosFallback;
window.adicionarTreinoFallback = adicionarTreinoFallback;
window.verTreinosFallback = verTreinosFallback;
window.irParaPerfilFallback = irParaPerfilFallback;