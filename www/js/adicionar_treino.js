(function () {
    'use strict';

    // Verificar se já foi inicializado globalmente
    if (window.SistemaAddTreino) {
        console.log('Sistema já existe, reinicializando...');
        window.SistemaAddTreino.reinicializar();
        return;
    }

    // Criar o sistema como singleton global
    window.SistemaAddTreino = {
        config: {
            exercicioCount: 0,
            userId: localStorage.getItem("userId"),
            professorId: localStorage.getItem("professor_id"),
            inicializado: false
        },

        utils: {
            buscarInfoAluno: (email) => {
                fetch(`https://proatleta.site/get_aluno_info.php?email=${encodeURIComponent(email)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            document.getElementById('nomeAluno').textContent = data.nome || 'Nome não encontrado';
                            document.getElementById('emailAluno').textContent = email;
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar informações do aluno:', error);
                        document.getElementById('nomeAluno').textContent = 'Erro ao carregar';
                        document.getElementById('emailAluno').textContent = email;
                    });
            },

            adicionarExercicio: () => {
                window.SistemaAddTreino.config.exercicioCount++;
                const count = window.SistemaAddTreino.config.exercicioCount;
                const container = document.getElementById('exerciciosContainer');

                const exercicioHTML = `
                    <div class="exercicio-item" id="exercicio_${count}">
                        <button type="button" class="btn-remover-exercicio" onclick="window.SistemaAddTreino.actions.removerExercicio(${count})">&times;</button>
                        
                        <div class="list no-hairlines-md">
                            <ul>
                                <li>
                                    <h2 class="title-input">Nome do Exercício</h2>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-input-wrap">
                                                <input type="text" name="exercicio_nome_${count}" 
                                                    placeholder="Ex: Supino Reto" required>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                
                                <li>
                                    <h2 class="title-input">Séries</h2>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-input-wrap">
                                                <input type="number" name="exercicio_series_${count}" 
                                                       placeholder="Ex: 3" min="1" required>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                
                                <li>
                                    <h2 class="title-input">Repetições</h2>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-input-wrap">
                                                <input type="text" name="exercicio_repeticoes_${count}" 
                                                   placeholder="Ex: 10-12" required>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                
                                <li>
                                    <h2 class="title-input">Descanso (segundos)</h2>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-input-wrap">
                                                <input type="number" name="exercicio_descanso_${count}" 
                                                       placeholder="Ex: 60" min="0">
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                
                                <li>
                                    <h2 class="title-input">Observações</h2>
                                    <div class="item-content item-input">
                                        <div class="item-inner">
                                            <div class="item-input-wrap">
                                                <input type="text" name="exercicio_obs_${count}" 
                                                       placeholder="Ex: Manter postura reta">
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                `;

                container.insertAdjacentHTML('beforeend', exercicioHTML);
            }
        },

        actions: {
            removerExercicio: (id) => {
                const elemento = document.getElementById(`exercicio_${id}`);
                if (elemento) {
                    elemento.remove();
                }
            },

            salvarTreino: () => {
                const professorId = localStorage.getItem('professor_id');
                const emailAluno = document.getElementById('emailAluno').textContent;

                if (!professorId || !emailAluno) {
                    app.dialog.alert('Erro: Dados do professor ou aluno não encontrados.', 'Erro');
                    return;
                }

                // Coletar dados do formulário
                const formData = new FormData();
                formData.append('professor_id', professorId);
                formData.append('email_aluno', emailAluno);
                formData.append('nome_treino', document.getElementById('nomeTreino').value);
                formData.append('tipo_treino', document.getElementById('tipoTreino').value);
                formData.append('data_treino', document.getElementById('dataTreino').value);
                formData.append('observacoes', document.getElementById('observacoes').value);

                // Coletar exercícios
                const exercicios = [];
                const exerciciosElements = document.querySelectorAll('.exercicio-item');

                exerciciosElements.forEach((elem, index) => {
                    const id = elem.id.split('_')[1];
                    const exercicio = {
                        nome: elem.querySelector(`[name="exercicio_nome_${id}"]`).value,
                        series: elem.querySelector(`[name="exercicio_series_${id}"]`).value,
                        repeticoes: elem.querySelector(`[name="exercicio_repeticoes_${id}"]`).value,
                        descanso: elem.querySelector(`[name="exercicio_descanso_${id}"]`).value || 60,
                        observacoes: elem.querySelector(`[name="exercicio_obs_${id}"]`).value || ''
                    };
                    exercicios.push(exercicio);
                });

                formData.append('exercicios', JSON.stringify(exercicios));

                // Enviar para o servidor
                fetch('https://proatleta.site/salvar_treino.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            app.dialog.create({
                                title: 'Sucesso',
                                text: 'Treino salvo com sucesso!',
                                buttons: [
                                    {
                                        text: 'OK',
                                        onClick: function () {
                                            // Voltar para a página de treinos
                                            app.views.main.router.navigate('/treinos_prof/');
                                        }
                                    }
                                ]
                            }).open();
                        } else {
                            app.dialog.alert(data.message || 'Erro ao salvar treino.', 'Erro');
                        }
                    })
                    .catch(error => {
                        console.error('Erro:', error);
                        app.dialog.alert('Erro ao salvar treino. Tente novamente.', 'Erro');
                    });
            }
        },

        inicializar: () => {
            const sistema = window.SistemaAddTreino;
            console.log('Inicializando sistema de adicionar treino...');

            // Pegar email do aluno do localStorage
            const emailAluno = localStorage.getItem('alunoSelecionado');
            console.log("Email do aluno:", emailAluno);

            if (emailAluno) {
                sistema.utils.buscarInfoAluno(emailAluno);
            }

            // Adicionar primeiro exercício

            // Configurar formulário
            const form = document.getElementById('formTreino');
            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    sistema.actions.salvarTreino();
                });
            }

            sistema.config.inicializado = true;
        },

        reinicializar: () => {
            const sistema = window.SistemaAddTreino;
            sistema.config.inicializado = false;
            sistema.config.exercicioCount = 0;

            const container = document.getElementById('exerciciosContainer');
            if (container) {
                sistema.inicializar();
            }
        }
    };

    // Eventos de inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.SistemaAddTreino.inicializar);
    } else {
        window.SistemaAddTreino.inicializar();
    }

    // Eventos Framework7
    if (typeof app !== 'undefined') {
        app.on('pageInit', (page) => {
            if (page.name === 'adicionar_treino') {
                window.SistemaAddTreino.inicializar();
            }
        });
    }

    // Expor função globalmente para compatibilidade
    window.adicionarExercicio = window.SistemaAddTreino.utils.adicionarExercicio;

    console.log('Sistema de adicionar treino inicializado');
})();