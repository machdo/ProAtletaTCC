// Contador para exercícios
let exercicioCount = 0;

// Função para adicionar novo exercício
function adicionarExercicio() {
    exercicioCount++;
    const container = document.getElementById('exerciciosContainer');
    
    const exercicioHTML = `
        <div class="exercicio-item" id="exercicio_${exercicioCount}">
            <button type="button" class="btn-remover-exercicio" onclick="removerExercicio(${exercicioCount})">×</button>
            
            <div class="list no-hairlines-md">
                <ul>
                    <li class="item-content item-input">
                        <div class="item-inner">
                            <div class="item-title item-label">Nome do Exercício</div>
                            <div class="item-input-wrap">
                                <input type="text" name="exercicio_nome_${exercicioCount}" 
                                       placeholder="Ex: Supino Reto" required>
                            </div>
                        </div>
                    </li>
                    
                    <li class="item-content item-input">
                        <div class="item-inner">
                            <div class="item-title item-label">Séries</div>
                            <div class="item-input-wrap">
                                <input type="number" name="exercicio_series_${exercicioCount}" 
                                       placeholder="Ex: 3" min="1" required>
                            </div>
                        </div>
                    </li>
                    
                    <li class="item-content item-input">
                        <div class="item-inner">
                            <div class="item-title item-label">Repetições</div>
                            <div class="item-input-wrap">
                                <input type="text" name="exercicio_repeticoes_${exercicioCount}" 
                                       placeholder="Ex: 10-12" required>
                            </div>
                        </div>
                    </li>
                    
                    <li class="item-content item-input">
                        <div class="item-inner">
                            <div class="item-title item-label">Descanso (segundos)</div>
                            <div class="item-input-wrap">
                                <input type="number" name="exercicio_descanso_${exercicioCount}" 
                                       placeholder="Ex: 60" min="0">
                            </div>
                        </div>
                    </li>
                    
                    <li class="item-content item-input">
                        <div class="item-inner">
                            <div class="item-title item-label">Observações</div>
                            <div class="item-input-wrap">
                                <input type="text" name="exercicio_obs_${exercicioCount}" 
                                       placeholder="Ex: Manter postura reta">
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', exercicioHTML);
}

// Função para remover exercício
function removerExercicio(id) {
    const elemento = document.getElementById(`exercicio_${id}`);
    if (elemento) {
        elemento.remove();
    }
}

// Quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Pegar parâmetros da URL (email do aluno)
    const urlParams = new URLSearchParams(window.location.search);
    const emailAluno = urlParams.get('email') || localStorage.getItem('alunoSelecionado');
    
    if (emailAluno) {
        // Buscar informações do aluno
        buscarInfoAluno(emailAluno);
    }
    
    // Adicionar primeiro exercício automaticamente
    adicionarExercicio();
    
    // Configurar formulário
    document.getElementById('formTreino').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarTreino();
    });
});

// Função para buscar informações do aluno
function buscarInfoAluno(email) {
    fetch(`https://proatleta.site/get_aluno_info.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('nomeAluno').textContent = data.nome || 'Nome não encontrado';
                document.getElementById('emailAluno').textContent = email;
                localStorage.setItem('alunoSelecionado', email);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar informações do aluno:', error);
            document.getElementById('nomeAluno').textContent = 'Erro ao carregar';
            document.getElementById('emailAluno').textContent = email;
        });
}

// Função para salvar o treino
function salvarTreino() {
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
                        onClick: function() {
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