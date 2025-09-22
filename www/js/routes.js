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
					// Remove CSS antigo da agenda se existir
					const oldCss = document.getElementById('agenda-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

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

				},
				pageBeforeRemove: function (event, page) {
					// Remove o CSS da página sport-treino
					const css = document.getElementById('sport-treino-css');
					if (css) css.remove();
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
					const oldAgendaCss = document.getElementById('agenda-prof-css');
					if (oldAgendaCss) {
						oldAgendaCss.parentNode.removeChild(oldAgendaCss);
					}
					const oldPerfilCss = document.getElementById('perfil-css');
					if (oldPerfilCss) {
						oldPerfilCss.parentNode.removeChild(oldPerfilCss);
					}

					const oldAddTreinoCss = document.getElementById('adicionar-treino-css');
					if (oldAddTreinoCss) {
						oldAddTreinoCss.parentNode.removeChild(oldAddTreinoCss);
					}

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
					// Carrega o script de adicionar treino
					$.getScript('js/adicionar_treino.js');

					const oldCss = document.getElementById('treinos-prof-css');
					if (oldCss) {
						oldCss.parentNode.removeChild(oldCss);
					}

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
		'/treinos_aluno/',
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

// Expor funções globalmente para uso nos botões
window.carregarAlunos = carregarAlunos;
window.adicionarTreino = adicionarTreino;
window.verTreinos = verTreinos;
window.irParaPerfil = irParaPerfil;
window.filtrarAlunos = filtrarAlunos;