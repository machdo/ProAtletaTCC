(function () {
    'use strict';

    // Verificar se já foi inicializado globalmente
    if (window.SistemaVerTreinosProfessor) {
        console.log('Sistema já existe, reinicializando...');
        window.SistemaVerTreinosProfessor.reinicializar();
        return;
    }

    // Criar o sistema como singleton global
    window.SistemaVerTreinosProfessor = {
        config: {
            treinosData: [],
            treinosFiltrados: [],
            inicializado: false
        },

        utils: {
            mostrarLoader: () => {
                const container = document.getElementById('listaTreinosProfessor');
                if (container) {
                    container.innerHTML = `
                        <div class="loader-container">
                            <div class="preloader"></div>
                            <p style="margin-top: 15px; color: #666;">Carregando treinos...</p>
                        </div>
                    `;
                }
            },

            mostrarListaVazia: () => {
                const container = document.getElementById('listaTreinosProfessor');
                if (container) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="mdi mdi-clipboard-text-outline"></i>
                            <h3>Nenhum treino encontrado</h3>
                            <p>Este professor ainda não criou treinos para você.</p>
                        </div>
                    `;
                }
            },

            mostrarErro: (mensagem) => {
                const container = document.getElementById('listaTreinosProfessor');
                if (container) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="mdi mdi-alert-circle-outline"></i>
                            <h3>Erro</h3>
                            <p>${mensagem}</p>
                            <button class="button button-fill" onclick="window.SistemaVerTreinosProfessor.actions.carregarTreinos()">
                                Tentar Novamente
                            </button>
                        </div>
                    `;
                }
            },

            atualizarEstatisticas: (treinos) => {
                const totalTreinos = treinos.length;
                const totalExercicios = treinos.reduce((total, treino) => {
                    return total + (treino.exercicios ? treino.exercicios.length : 0);
                }, 0);

                document.getElementById('totalTreinos').textContent = totalTreinos;
                document.getElementById('totalExercicios').textContent = totalExercicios;
            },

            formatarData: (data) => {
                if (!data) return 'Sem data';
                return new Date(data).toLocaleDateString('pt-BR');
            },

            criarCardTreino: (treino, index) => {
                const dataFormatada = window.SistemaVerTreinosProfessor.utils.formatarData(treino.data_treino);
                const tipoClass = `tipo-${treino.tipo_treino?.toLowerCase() || 'outro'}`;
                
                return `
                    <div class="treino-card" data-treino-id="${treino.id}">
                        <div class="treino-header">
                            <div class="treino-titulo">
                                <h3>${treino.nome_treino}</h3>
                                <div class="treino-actions">
                                    <button class="btn-expand" onclick="window.SistemaVerTreinosProfessor.actions.toggleExercicios(${index})">
                                        <i class="ri-list-unordered" id="icon-${index}"></i>
                                        <span>Ver Exercícios</span>
                                        <i class="ri-arrow-down-s-line" id="arrow-${index}"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="treino-meta">
                                <span class="tipo-badge ${tipoClass}">${treino.tipo_treino || 'Geral'}</span>
                                <span><i class="ri-calendar-line"></i> ${dataFormatada}</span>
                                <span><i class="ri-file-list-line"></i> ${treino.exercicios ? treino.exercicios.length : 0} exercícios</span>
                            </div>
                        </div>
                        
                        ${treino.observacoes ? `
                            <div class="observacoes-box">
                                <i class="ri-information-line"></i> ${treino.observacoes}
                            </div>
                        ` : ''}
                        
                        <div class="exercicios-container" id="exercicios-${index}">
                            ${treino.exercicios ? treino.exercicios.map(ex => `
                                <div class="exercicio-item">
                                    <div class="exercicio-nome">${ex.ordem}. ${ex.nome}</div>
                                    <div class="exercicio-details">
                                        <span class="exercicio-detail">
                                            <i class="ri-repeat-line"></i> ${ex.series} séries
                                        </span>
                                        <span class="exercicio-detail">
                                            <i class="ri-number-1"></i> ${ex.repeticoes} reps
                                        </span>
                                        <span class="exercicio-detail">
                                            <i class="ri-timer-line"></i> ${ex.descanso}s
                                        </span>
                                    </div>
                                    ${ex.observacoes ? `<div class="exercicio-obs">${ex.observacoes}</div>` : ''}
                                </div>
                            `).join('') : '<div class="exercicio-item">Nenhum exercício encontrado</div>'}
                        </div>
                    </div>
                `;
            },

            renderizarTreinos: (treinos) => {
                const container = document.getElementById('listaTreinosProfessor');
                
                if (!treinos || treinos.length === 0) {
                    window.SistemaVerTreinosProfessor.utils.mostrarListaVazia();
                    return;
                }

                const html = treinos.map((treino, index) => 
                    window.SistemaVerTreinosProfessor.utils.criarCardTreino(treino, index)
                ).join('');
                
                container.innerHTML = html;
                window.SistemaVerTreinosProfessor.utils.atualizarEstatisticas(treinos);
            }
        },

        actions: {
            obterProfessorId: () => {
                // Tentar obter o ID do professor de várias fontes
                const urlParams = new URLSearchParams(window.location.search);
                const professorId = urlParams.get('professor_id') || 
                                  localStorage.getItem('professor_id') || 
                                  localStorage.getItem('professorSelecionado');
                
                console.log('Professor ID obtido:', professorId); // Debug
                return professorId;
            },

            carregarTreinos: () => {
                const sistema = window.SistemaVerTreinosProfessor;
                
                // Obter ID do professor primeiro
                const professorId = sistema.actions.obterProfessorId();
                console.log('Carregando treinos do professor:', professorId); // Debug
                
                if (!professorId) {
                    sistema.utils.mostrarErro('Professor não identificado');
                    return;
                }

                // Usar o email do usuário logado
                const userEmail = localStorage.getItem('userEmail');
                if (!userEmail) {
                    sistema.utils.mostrarErro('Email do usuário não encontrado');
                    return;
                }

                sistema.utils.mostrarLoader();

                // Fazer requisição com o professor_id
                fetch(`https://proatleta.site/get_treinos_aluno.php?email_aluno=${encodeURIComponent(userEmail)}&professor_id=${professorId}`)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        console.log('Resposta API:', data); // Debug
                        if (data.success && data.treinos) {
                            sistema.config.treinosData = data.treinos;
                            sistema.config.treinosFiltrados = [...data.treinos];
                            sistema.utils.renderizarTreinos(data.treinos);
                        } else {
                            sistema.utils.mostrarListaVazia();
                            sistema.utils.atualizarEstatisticas([]);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao carregar treinos:', error);
                        sistema.utils.mostrarErro('Erro ao conectar com o servidor');
                    });
            },

            toggleExercicios: (index) => {
                const container = document.getElementById(`exercicios-${index}`);
                const arrow = document.getElementById(`arrow-${index}`);
                const icon = document.getElementById(`icon-${index}`);
                
                if (!container) return;

                container.classList.toggle('show');
                
                if (container.classList.contains('show')) {
                    arrow.style.transform = 'rotate(180deg)';
                    icon.className = 'ri-list-check';
                } else {
                    arrow.style.transform = 'rotate(0deg)';
                    icon.className = 'ri-list-unordered';
                }
            },

            filtrarTreinos: (termo) => {
                const sistema = window.SistemaVerTreinosProfessor;
                
                if (!termo.trim()) {
                    sistema.config.treinosFiltrados = [...sistema.config.treinosData];
                } else {
                    const termoLower = termo.toLowerCase();
                    sistema.config.treinosFiltrados = sistema.config.treinosData.filter(treino => {
                        return treino.nome_treino.toLowerCase().includes(termoLower) ||
                               treino.tipo_treino?.toLowerCase().includes(termoLower) ||
                               (treino.observacoes && treino.observacoes.toLowerCase().includes(termoLower)) ||
                               (treino.exercicios && treino.exercicios.some(ex => 
                                   ex.nome.toLowerCase().includes(termoLower)
                               ));
                    });
                }
                
                sistema.utils.renderizarTreinos(sistema.config.treinosFiltrados);
            },

            configurarBusca: () => {
                const searchInput = document.getElementById('searchTreinos');
                if (searchInput && !searchInput.hasAttribute('data-listener-added')) {
                    searchInput.addEventListener('input', (e) => {
                        window.SistemaVerTreinosProfessor.actions.filtrarTreinos(e.target.value);
                    });
                    searchInput.setAttribute('data-listener-added', 'true');
                }
            }
        },

        inicializar: () => {
            const sistema = window.SistemaVerTreinosProfessor;
            console.log('Inicializando sistema de treinos do professor...');
            
            sistema.actions.configurarBusca();
            sistema.actions.carregarTreinos();
            sistema.config.inicializado = true;
        },

        reinicializar: () => {
            const sistema = window.SistemaVerTreinosProfessor;
            sistema.config.inicializado = false;
            sistema.config.treinosData = [];
            sistema.config.treinosFiltrados = [];
            
            // Verificar se estamos na página correta
            const container = document.getElementById('listaTreinosProfessor');
            if (container) {
                sistema.inicializar();
            }
        }
    };

    // Eventos de inicialização
    const executarInicializacao = () => {
        const container = document.getElementById('listaTreinosProfessor');
        if (container && !window.SistemaVerTreinosProfessor.config.inicializado) {
            window.SistemaVerTreinosProfessor.inicializar();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executarInicializacao);
    } else {
        executarInicializacao();
    }

    // Eventos para SPAs
    document.addEventListener('page:init', (e) => {
        if (e.detail.name === 'ver_treinos_professor') {
            window.SistemaVerTreinosProfessor.inicializar();
        }
    });

    // Eventos Framework7
    if (typeof app !== 'undefined') {
        app.on('pageInit', (page) => {
            if (page.name === 'ver_treinos_professor') {
                window.SistemaVerTreinosProfessor.inicializar();
            }
        });

        app.on('pageBeforeIn', (page) => {
            if (page.name === 'ver_treinos_professor') {
                setTimeout(() => window.SistemaVerTreinosProfessor.inicializar(), 100);
            }
        });
    }

    console.log('Sistema de treinos do professor inicializado');
})();