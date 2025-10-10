(function () {
    'use strict';

    // Verificar se já foi inicializado globalmente
    if (window.SistemaTreinosAluno) {
        console.log('Sistema já existe, reinicializando...');
        window.SistemaTreinosAluno.reinicializar();
        return;
    }

    // Criar o sistema como singleton global
    window.SistemaTreinosAluno = {
        config: {
            userId: localStorage.getItem("userId"),
            inicializado: false,
            intervalos: [],
            professoresData: [] // Armazenar dados dos professores
        },

        utils: {
            mostrarListaVazia: () => {
                const container = document.getElementById('lista-professores');
                if (container) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="mdi mdi-account-group-outline"></i>
                            <h3>Nenhum professor encontrado</h3>
                            <p>Você ainda não tem professores vinculados</p>
                        </div>
                    `;
                }
            },

            mostrarErro: (mensagem) => {
                const container = document.getElementById('lista-professores');
                if (container) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="mdi mdi-alert-circle-outline"></i>
                            <h3>Erro</h3>
                            <p>${mensagem}</p>
                            <button class="button button-fill" onclick="window.SistemaTreinosAluno.actions.carregarProfessores()">
                                Tentar Novamente
                            </button>
                        </div>
                    `;
                }
            },

            criarCardProfessor: (professor) => {
                return `
                    <li>
                        <a href="/ver_treinos_prof/" class="item-link item-content" onclick="window.SistemaTreinosAluno.actions.verTreinosProfessor('${professor.id}')">
                            <div class="item-media">
                                <img src="${professor.foto || 'img/user.jpg'}" class="professor-avatar" width="44"/>
                            </div>
                            <div class="item-inner">
                                <div class="item-title-row">
                                    <div class="item-title">${professor.nome_prof || 'Nome não disponível'}</div>
                                </div>
                                <div class="item-subtitle">${professor.email || ''}</div>
                            </div>
                        </a>
                    </li>
                `;
            }
        },

        actions: {
            verTreinosProfessor: (professorId) => {
                console.log('Navegando para treinos do professor:', professorId);
                
                // Garantir que o professorId seja armazenado corretamente
                localStorage.setItem('professorSelecionado', professorId);
                
                // Buscar dados do professor na lista atual
                const professores = window.SistemaTreinosAluno.config.professoresData || [];
                const professorSelecionado = professores.find(p => p.id == professorId);
                
                if (professorSelecionado) {
                    // Armazenar dados completos do professor
                    localStorage.setItem('professor_id', professorId); // Adicionar esta linha
                    localStorage.setItem('professorNomeSelecionado', professorSelecionado.nome_prof);
                    localStorage.setItem('professorEmailSelecionado', professorSelecionado.email);
                    localStorage.setItem('professorFotoSelecionada', professorSelecionado.foto || '');
                }
                
                // Navegar para a página de treinos do professor
                if (typeof app !== 'undefined' && app.views && app.views.main) {
                    app.views.main.router.navigate(`/ver_treinos_professor/?professor_id=${professorId}`);
                } else {
                    console.error('Framework7 não disponível');
                }
            },

            carregarProfessores: () => {
                const sistema = window.SistemaTreinosAluno;
                
                if (!sistema.config.userId) {
                    sistema.utils.mostrarErro('ID do usuário não encontrado');
                    return;
                }

                // Mostra loader
                app.dialog.preloader('Carregando professores...');

                // Faz requisição com URL completa
                fetch(`https://proatleta.site/get_associados.php?id=${sistema.config.userId}`)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        // Fecha loader
                        app.dialog.close();

                        if (data.professores && data.professores.length > 0) {
                            // Armazenar dados dos professores
                            sistema.config.professoresData = data.professores;
                            
                            const html = data.professores
                                .map(sistema.utils.criarCardProfessor)
                                .join('');
                            
                            document.getElementById('lista-professores').innerHTML = html;
                        } else {
                            sistema.utils.mostrarListaVazia();
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao carregar professores:', error);
                        app.dialog.close();
                        sistema.utils.mostrarErro('Erro ao conectar com o servidor');
                    });
            },

            filtrarProfessores: (termo) => {
                const cards = document.querySelectorAll('.item-link');
                const termoBusca = termo.toLowerCase();
                
                cards.forEach(card => {
                    const nome = card.querySelector('.item-title').textContent.toLowerCase();
                    const email = card.querySelector('.item-subtitle').textContent.toLowerCase();
                    
                    if (nome.includes(termoBusca) || email.includes(termoBusca)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            },

            configurarBusca: () => {
                const searchInput = document.getElementById('buscarProfessor');
                if (searchInput && !searchInput.hasAttribute('data-listener-added')) {
                    searchInput.addEventListener('input', (e) => {
                        window.SistemaTreinosAluno.actions.filtrarProfessores(e.target.value);
                    });
                    searchInput.setAttribute('data-listener-added', 'true');
                }
            }
        },

        inicializar: () => {
            const sistema = window.SistemaTreinosAluno;
            console.log('Inicializando sistema de treinos do aluno...');
            
            sistema.actions.configurarBusca();
            sistema.actions.carregarProfessores();
            sistema.config.inicializado = true;
        },

        reinicializar: () => {
            const sistema = window.SistemaTreinosAluno;
            sistema.config.inicializado = false;
            sistema.config.intervalos.forEach(id => clearInterval(id));
            sistema.config.intervalos = [];
            sistema.inicializar();
        }
    };

    // Modificar os eventos de inicialização
    const executarInicializacao = () => {
        const container = document.getElementById('lista-professores');
        if (container && !window.SistemaTreinosAluno.config.inicializado) {
            window.SistemaTreinosAluno.inicializar();
        }
    };

    // Eventos padrão
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executarInicializacao);
    } else {
        executarInicializacao();
    }

    // Eventos para SPAs e Framework7
    document.addEventListener('page:init', (e) => {
        if (e.detail.name === 'link3') {
            setTimeout(executarInicializacao, 100);
        }
    });

    document.addEventListener('page:reinit', (e) => {
        if (e.detail.name === 'link3') {
            setTimeout(executarInicializacao, 100);
        }
    });

    if (typeof app !== 'undefined') {
        app.on('pageInit', (page) => {
            if (page.name === 'link3') {
                setTimeout(executarInicializacao, 100);
            }
        });

        app.on('pageBeforeIn', (page) => {
            if (page.name === 'link3') {
                setTimeout(executarInicializacao, 100);
            }
        });
    }

    console.log('Sistema de treinos do aluno inicializado');
})();