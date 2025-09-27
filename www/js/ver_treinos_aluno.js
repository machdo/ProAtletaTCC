(function () {
    'use strict';

    // Verificar se já foi inicializado globalmente
    if (window.SistemaVerTreinos) {
        console.log('Sistema já existe, reinicializando...');
        window.SistemaVerTreinos.reinicializar();
        return;
    }

    // Criar o sistema como singleton global
    window.SistemaVerTreinos = {
        config: {
            userId: localStorage.getItem("userId"),
            professorId: localStorage.getItem("professor_id"),
            treinosData: [],
            inicializado: false,
            // Dados do aluno - usar email como fonte principal
            emailAluno: localStorage.getItem('alunoSelecionado') || '',
            nomeAluno: localStorage.getItem('nomeAlunoSelecionado') || 'Aluno',
            alunoId: '',
            fotoAluno: null
        },

        utils: {
            mostrarListaVazia: () => {
                const container = document.getElementById('listaTreinos');
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="mdi mdi-clipboard-text-outline"></i>
                        <h3>Nenhum treino encontrado</h3>
                        <p>Este aluno ainda não possui treinos cadastrados.</p>
                        <button class="button button-fill" onclick="window.SistemaVerTreinos.actions.adicionarNovoTreino()">
                            <i class="mdi mdi-plus"></i> Adicionar Primeiro Treino
                        </button>
                    </div>
                `;
            },

            mostrarErro: (mensagem) => {
                const container = document.getElementById('listaTreinos');
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="mdi mdi-alert-circle-outline"></i>
                        <h3>Erro</h3>
                        <p>${mensagem}</p>
                    </div>
                `;
            },

            mostrarTreinos: (treinos) => {
                const container = document.getElementById('listaTreinos');
                
                if (treinos.length === 0) {
                    window.SistemaVerTreinos.utils.mostrarListaVazia();
                    return;
                }
                
                let html = '';
                treinos.forEach((treino, index) => {
                    const dataFormatada = treino.data_treino ? new Date(treino.data_treino).toLocaleDateString('pt-BR') : 'Sem data';
                    const tipoClass = `tipo-${treino.tipo_treino || 'outro'}`;
                    
                    html += `
                        <div class="treino-card">
                            <div class="treino-header">
                                <div class="treino-titulo">
                                    <h3>${treino.nome_treino}</h3>
                                    <div class="treino-meta">
                                        <span class="tipo-badge ${tipoClass}">${treino.tipo_treino || 'Geral'}</span>
                                        <span><i class="ri-calendar-line"></i> ${dataFormatada}</span>
                                        <span><i class="ri-file-list-line"></i> ${treino.total_exercicios} exercícios</span>
                                    </div>
                                </div>
                                <div class="treino-actions">
                                    <button class="btn-icon btn-expand" onclick="window.SistemaVerTreinos.actions.toggleExercicios(${index})">
                                        <i class="ri-arrow-down-s-line" id="arrow-${index}"></i>
                                    </button>
                                    <button class="btn-icon btn-delete" onclick="window.SistemaVerTreinos.actions.deletarTreino(${treino.id})">
                                        <i class="ri-delete-bin-line"></i>
                                    </button>
                                </div>
                            </div>
                            
                            ${treino.observacoes ? `
                                <div class="observacoes-box">
                                    <i class="ri-information-line"></i> ${treino.observacoes}
                                </div>
                            ` : ''}
                            
                            <div class="exercicios-container" id="exercicios-${index}">
                                ${treino.exercicios.map(ex => `
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
                                        ${ex.observacoes ? `<div style="margin-top: 8px; font-size: 13px; color: #888;">${ex.observacoes}</div>` : ''}
                                        ${ex.video_arquivo ? `
                                            <div class="exercicio-video">
                                                <video controls width="100%" height="200" preload="metadata">
                                                    <source src="${ex.video_arquivo}" type="video/mp4">
                                                    Seu navegador não suporta a reprodução de vídeos.
                                                </video>
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
                
                container.innerHTML = html;
            },

            atualizarInfoAluno: () => {
                const nomeElement = document.getElementById('nomeAlunoTreinos');
                const avatarElement = document.getElementById('alunoAvatarTreinos');

                if (nomeElement) {
                    nomeElement.textContent = window.SistemaVerTreinos.config.nomeAluno;
                }
                
                // Atualizar avatar
                if (avatarElement && window.SistemaVerTreinos.config.fotoAluno) {
                    avatarElement.innerHTML = `<img src="${window.SistemaVerTreinos.config.fotoAluno}" alt="Foto do ${window.SistemaVerTreinos.config.nomeAluno}" onerror="this.src='img/user.jpg'">`;
                } else if (avatarElement) {
                    avatarElement.innerHTML = '<i class="ri-user-line"></i>';
                }

                console.log('Interface do aluno atualizada:', {
                    nome: window.SistemaVerTreinos.config.nomeAluno,
                    email: window.SistemaVerTreinos.config.emailAluno
                });
            },

            carregarDadosCompletosAluno: () => {
                const emailAluno = window.SistemaVerTreinos.config.emailAluno;
                
                if (!emailAluno) {
                    console.warn('Email do aluno não encontrado');
                    window.SistemaVerTreinos.utils.atualizarInfoAluno();
                    return;
                }

                console.log('Buscando dados completos do aluno por email:', emailAluno);

                fetch(`https://proatleta.site/get_usuario.php?email=${encodeURIComponent(emailAluno)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success && data.usuario) {
                            // Atualizar todos os dados do aluno
                            window.SistemaVerTreinos.config.alunoId = data.usuario.id;
                            window.SistemaVerTreinos.config.nomeAluno = data.usuario.nome || window.SistemaVerTreinos.config.nomeAluno;
                            window.SistemaVerTreinos.config.emailAluno = data.usuario.email || window.SistemaVerTreinos.config.emailAluno;
                            window.SistemaVerTreinos.config.fotoAluno = data.usuario.foto || 'img/user.jpg';
                            
                            // Salvar dados atualizados no localStorage para consistência
                            localStorage.setItem('alunoSelecionadoId', data.usuario.id);
                            localStorage.setItem('nomeAlunoSelecionado', data.usuario.nome);
                            
                            console.log('Dados completos do aluno carregados:', {
                                id: window.SistemaVerTreinos.config.alunoId,
                                nome: window.SistemaVerTreinos.config.nomeAluno,
                                email: window.SistemaVerTreinos.config.emailAluno,
                                foto: window.SistemaVerTreinos.config.fotoAluno
                            });
                        } else {
                            console.warn('Não foi possível carregar dados completos do aluno');
                            window.SistemaVerTreinos.config.fotoAluno = 'img/user.jpg';
                        }
                        
                        window.SistemaVerTreinos.utils.atualizarInfoAluno();
                    })
                    .catch(error => {
                        console.error('Erro ao carregar dados completos do aluno:', error);
                        window.SistemaVerTreinos.config.fotoAluno = 'img/user.jpg';
                        window.SistemaVerTreinos.utils.atualizarInfoAluno();
                    });
            }
        },

        actions: {
            carregarTreinos: () => {
                const emailAluno = window.SistemaVerTreinos.config.emailAluno;
                const professorId = localStorage.getItem('professor_id');
                
                if (!emailAluno) {
                    window.SistemaVerTreinos.utils.mostrarErro('Email do aluno não encontrado');
                    return;
                }
                
                console.log('Carregando treinos para aluno:', emailAluno);
                
                // Carregar dados completos do aluno primeiro
                window.SistemaVerTreinos.utils.carregarDadosCompletosAluno();
                
                // Busca treinos
                fetch(`https://proatleta.site/get_treinos_aluno.php?email_aluno=${encodeURIComponent(emailAluno)}&professor_id=${professorId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.treinos) {
                            window.SistemaVerTreinos.config.treinosData = data.treinos;
                            window.SistemaVerTreinos.utils.mostrarTreinos(data.treinos);
                        } else {
                            window.SistemaVerTreinos.utils.mostrarListaVazia();
                        }
                    })
                    .catch(error => {
                        console.error('Erro:', error);
                        window.SistemaVerTreinos.utils.mostrarErro('Erro ao carregar treinos');
                    });
            },

            toggleExercicios: (index) => {
                const container = document.getElementById(`exercicios-${index}`);
                const arrow = document.getElementById(`arrow-${index}`);
                
                container.classList.toggle('show');
                
                if (container.classList.contains('show')) {
                    arrow.style.transform = 'rotate(180deg)';
                } else {
                    arrow.style.transform = 'rotate(0deg)';
                }
            },

            deletarTreino: (treinoId) => {
                // Mostra diálogo de confirmação com Framework7
                app.dialog.confirm(
                    'Tem certeza que deseja deletar este treino?', 
                    'Confirmar Exclusão',
                    function() {
                        // Mostra loader
                        app.dialog.preloader('Deletando treino...');
                        
                        const professorId = localStorage.getItem('professor_id');
                        
                        // Faz requisição para deletar usando fetch com URLSearchParams
                        fetch('https://proatleta.site/deletar_treino.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                'treino_id': treinoId,
                                'professor_id': professorId
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            // Fecha loader
                            app.dialog.close();
                            
                            if (data.success) {
                                // Mostra toast de sucesso
                                app.toast.create({
                                    text: 'Treino deletado com sucesso!',
                                    position: 'center',
                                    closeTimeout: 2000,
                                }).open();
                                
                                // Remove o treino do array local
                                window.SistemaVerTreinos.config.treinosData = 
                                    window.SistemaVerTreinos.config.treinosData.filter(t => t.id !== treinoId);
                                
                                // Atualiza a interface
                                window.SistemaVerTreinos.utils.mostrarTreinos(window.SistemaVerTreinos.config.treinosData);
                            } else {
                                throw new Error(data.message || 'Erro ao deletar treino');
                            }
                        })
                        .catch(error => {
                            // Fecha loader
                            app.dialog.close();
                            
                            // Mostra erro
                            app.dialog.alert(
                                'Não foi possível deletar o treino. Tente novamente mais tarde.',
                                'Erro'
                            );
                            console.error('Erro ao deletar treino:', error);
                        });
                    },
                    function() {
                        // Usuário cancelou a exclusão
                        app.toast.create({
                            text: 'Operação cancelada',
                            position: 'center',
                            closeTimeout: 2000,
                        }).open();
                    }
                );
            },

            adicionarNovoTreino: () => {
                app.views.main.router.navigate('/adicionar_treino/');
            }
        },

        inicializar: () => {
            const sistema = window.SistemaVerTreinos;
            console.log('Inicializando sistema de visualização de treinos...');
            
            sistema.actions.carregarTreinos();
            sistema.config.inicializado = true;
        },

        reinicializar: () => {
            const sistema = window.SistemaVerTreinos;
            sistema.config.inicializado = false;
            sistema.config.treinosData = [];
            
            // Resetar dados do aluno usando email como fonte principal
            sistema.config.emailAluno = localStorage.getItem('alunoSelecionado') || '';
            sistema.config.nomeAluno = localStorage.getItem('nomeAlunoSelecionado') || 'Aluno';
            sistema.config.alunoId = '';
            sistema.config.fotoAluno = null;
            
            sistema.inicializar();
        }
    };

    // Eventos de inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.SistemaVerTreinos.inicializar);
    } else {
        window.SistemaVerTreinos.inicializar();
    }

    // Eventos Framework7
    if (typeof app !== 'undefined') {
        app.on('pageInit', (page) => {
            if (page.name === 'ver_treinos_aluno') {
                window.SistemaVerTreinos.inicializar();
            }
        });
    }

    console.log('Sistema de visualização de treinos inicializado');
})();