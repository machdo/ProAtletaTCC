// ========================================
// SISTEMA DE DEBUG AVANÇADO
// ========================================

let debugLog = [];
let statusElement = document.getElementById('debugStatus');
let statusInfoElement = document.getElementById('statusInfo');

function addDebug(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;

    console.log('[DEBUG]', logEntry, data || '');
    debugLog.push(logEntry);

    if (statusElement) {
        statusElement.innerHTML = debugLog.slice(-3).join('<br>');
    }
}

function updateStatus(message, type = 'info') {
    if (statusInfoElement) {
        statusInfoElement.innerHTML = `<strong>${type.toUpperCase()}:</strong> ${message}`;
        statusInfoElement.className = `status-info ${type}`;
    }
}

// ========================================
// VERIFICAÇÕES INICIAIS
// ========================================

function verificarAmbiente() {
    addDebug('Verificando ambiente...');

    const checks = {
        localStorage: typeof (Storage) !== "undefined",
        fetch: typeof fetch !== 'undefined',
        jQuery: typeof $ !== 'undefined',
        app: typeof app !== 'undefined'
    };

    addDebug('Verificações do ambiente', checks);

    for (let check in checks) {
        if (!checks[check]) {
            addDebug(`❌ ERRO: ${check} não disponível`);
            updateStatus(`Erro: ${check} não disponível`, 'error');
            return false;
        }
    }

    addDebug('✅ Ambiente OK');
    return true;
}

function verificarDadosUsuario() {
    addDebug('Verificando dados do usuário...');

    const dados = {
        loggedIn: localStorage.getItem('loggedIn'),
        userType: localStorage.getItem('userType'),
        userId: localStorage.getItem('userId'),
        professor_id: localStorage.getItem('professor_id'),
        userEmail: localStorage.getItem('userEmail'),
        userNome: localStorage.getItem('userNome')
    };

    addDebug('Dados do localStorage', dados);

    // Verificar login
    if (dados.loggedIn !== 'true') {
        updateStatus('Usuário não está logado', 'error');
        return false;
    }

    // Verificar se é professor
    if (dados.userType !== 'prof') {
        updateStatus('Usuário não é professor', 'error');
        return false;
    }

    // Configurar professor_id se necessário
    if (!dados.professor_id && dados.userId) {
        localStorage.setItem('professor_id', dados.userId);
        addDebug('professor_id configurado automaticamente');
        dados.professor_id = dados.userId;
    }

    if (!dados.professor_id) {
        updateStatus('ID do professor não encontrado', 'error');
        return false;
    }

    updateStatus(`Professor: ${dados.userNome} (ID: ${dados.professor_id})`, 'success');
    addDebug('✅ Dados do usuário OK');
    return dados;
}

// ========================================
// CARREGAR ALUNOS COM DEBUG
// ========================================

async function carregarAlunosDebug() {
    addDebug('Iniciando carregamento de alunos...');

    const dadosUsuario = verificarDadosUsuario();
    if (!dadosUsuario) {
        mostrarErroDebug('Dados do usuário inválidos');
        return;
    }

    const professorId = dadosUsuario.professor_id;
    const url = `https://proatleta.site/get_alunos_professor.php?professor_id=${professorId}`;

    addDebug(`Fazendo requisição para: ${url}`);
    updateStatus('Buscando alunos na base de dados...', 'info');

    try {
        const response = await fetch(url);

        addDebug(`Resposta recebida - Status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);//trocar ."text" para alunos
        }

        const textResponse = await response.text();
        addDebug(`Resposta (${textResponse.length} chars): ${textResponse.substring(0, 100)}...`);

        let data;
        try {
            data = JSON.parse(textResponse);
            addDebug('JSON parseado com sucesso', data);
        } catch (parseError) {
            addDebug('❌ Erro no parse JSON', parseError);
            throw new Error('Resposta não é JSON válido: ' + textResponse.substring(0, 200));
        }

        // Processar resposta
        if (data.success) {
            if (data.alunos && data.alunos.length > 0) {
                addDebug(`✅ ${data.alunos.length} alunos encontrados`);
                updateStatus(`${data.alunos.length} alunos encontrados`, 'success');
                mostrarAlunosDebug(data.alunos);
            } else {
                addDebug('Nenhum aluno encontrado');
                updateStatus('Nenhum aluno vinculado a este professor', 'warning');
                mostrarListaVaziaDebug('Nenhum aluno encontrado');
            }
        } else {
            const errorMsg = data.message || 'Erro desconhecido do servidor';
            addDebug('❌ Erro do servidor: ' + errorMsg);
            updateStatus('Erro do servidor: ' + errorMsg, 'error');
            mostrarErroDebug(errorMsg);
        }

    } catch (error) {
        addDebug('❌ Erro na requisição: ' + error.message);
        updateStatus('Erro na conexão: ' + error.message, 'error');
        mostrarErroDebug('Erro ao conectar com o servidor: ' + error.message);
    }
}

// ========================================
// FUNÇÕES DE EXIBIÇÃO COM DEBUG
// ========================================

function mostrarAlunosDebug(alunos) {
    addDebug(`Exibindo ${alunos.length} alunos`);

    const container = document.getElementById('listaAlunos');
    if (!container) {
        addDebug('❌ Container listaAlunos não encontrado');
        return;
    }

    let html = '';
    alunos.forEach((aluno, index) => {
        const nome = aluno.nome || 'Nome não disponível';
        const email = aluno.email || 'Email não disponível';
        const totalTreinos = aluno.total_treinos || 0;

        addDebug(`Processando aluno ${index + 1}: ${nome} (${email})`);

        html += `
                    <div class="aluno-card" data-email="${email}">
                        <div class="aluno-info">
                            <div class="aluno-nome">${nome}</div>
                            <div class="aluno-email">${email}</div>
                            <small style="color: #666;">Treinos: ${totalTreinos}</small>
                        </div>
                        <div class="aluno-actions">
                            <button class="btn-action btn-adicionar" onclick="adicionarTreinoDebug('${email}')">
                                <i class="mdi mdi-plus"></i> Adicionar
                            </button>
                            <button class="btn-action btn-ver" onclick="verTreinosDebug('${email}')">
                                <i class="mdi mdi-eye"></i> Ver
                            </button>
                        </div>
                    </div>
                `;
    });

    container.innerHTML = html;
    addDebug('✅ HTML inserido no container');
}

function mostrarListaVaziaDebug(mensagem) {
    addDebug('Mostrando lista vazia: ' + mensagem);

    const container = document.getElementById('listaAlunos');
    if (container) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="mdi mdi-account-group-outline"></i>
                        <h3>Nenhum aluno encontrado</h3>
                        <p>${mensagem}</p>
                        <p>Para vincular alunos:</p>
                        <ol style="text-align: left; max-width: 300px; margin: 20px auto;">
                            <li>Vá ao seu perfil</li>
                            <li>Digite o email do aluno</li>
                            <li>Envie a solicitação</li>
                            <li>Aguarde o aluno aceitar</li>
                        </ol>
                        <button class="button button-fill" onclick="irParaPerfilDebug()">
                            Ir para Perfil
                        </button>
                        <button class="button button-outline" onclick="testarConexaoDebug()" style="margin-top: 10px;">
                            Testar Conexão
                        </button>
                    </div>
                `;
    }
}

function mostrarErroDebug(mensagem) {
    addDebug('Mostrando erro: ' + mensagem);

    const container = document.getElementById('listaAlunos');
    if (container) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="mdi mdi-alert-circle-outline"></i>
                        <h3>Erro</h3>
                        <p>${mensagem}</p>
                        <div style="margin: 20px 0;">
                            <button class="button button-outline" onclick="carregarAlunosDebug()">
                                Tentar Novamente
                            </button>
                            <button class="button button-outline" onclick="mostrarLogCompleto()" style="margin-left: 10px;">
                                Ver Log Completo
                            </button>
                        </div>
                        <button class="button button-fill" onclick="testarConexaoDebug()">
                            Testar Conexão
                        </button>
                    </div>
                `;
    }
}

// ========================================
// FUNÇÕES DE AÇÃO
// ========================================

function adicionarTreinoDebug(email) {
    addDebug('Adicionando treino para: ' + email);
    localStorage.setItem('alunoSelecionado', email);

    if (typeof app !== 'undefined' && app.views && app.views.main) {
        app.views.main.router.navigate('/adicionar_treino/');
    } else {
        alert('Framework7 não disponível. Email salvo: ' + email);
    }
}

function verTreinosDebug(email) {
    addDebug('Visualizando treinos para: ' + email);
    localStorage.setItem('alunoSelecionado', email);

    if (typeof app !== 'undefined' && app.views && app.views.main) {
        app.views.main.router.navigate('/ver_treinos_aluno/');
    } else {
        alert('Framework7 não disponível. Email salvo: ' + email);
    }
}

function irParaPerfilDebug() {
    addDebug('Navegando para perfil');

    if (typeof app !== 'undefined' && app.views && app.views.main) {
        app.views.main.router.navigate('/perfil_prof/');
    } else {
        alert('Framework7 não disponível');
    }
}

// ========================================
// FUNÇÕES DE DEBUG
// ========================================

function mostrarLogCompleto() {
    const logText = debugLog.join('\n');
    console.log('LOG COMPLETO:', logText);
    alert('Log salvo no console. Pressione F12 para ver.');
}

async function testarConexaoDebug() {
    addDebug('Testando conexão com a API...');
    updateStatus('Testando conexão...', 'info');

    try {
        const response = await fetch('https://proatleta.site/get_alunos_professor.php?professor_id=1');
        const text = await response.text();

        addDebug(`Teste OK - Status: ${response.status}, Resposta: ${text.substring(0, 100)}`);
        updateStatus('Conexão OK com a API', 'success');

        alert('Conexão OK! Verifique o console para detalhes.');
    } catch (error) {
        addDebug('❌ Teste falhou: ' + error.message);
        updateStatus('Falha na conexão: ' + error.message, 'error');

        alert('Erro na conexão: ' + error.message);
    }
}

function filtrarAlunosDebug(busca) {
    addDebug('Filtrando por: ' + busca);
    // Implementar filtro se necessário
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    addDebug('DOMContentLoaded disparado');

    setTimeout(() => {
        addDebug('Iniciando verificações...');

        if (!verificarAmbiente()) {
            return;
        }

        // Configurar busca
        const buscarInput = document.getElementById('buscarAluno');
        if (buscarInput) {
            buscarInput.addEventListener('input', function (e) {
                filtrarAlunosDebug(e.target.value);
            });
            addDebug('Busca configurada');
        }

        // Carregar alunos
        carregarAlunosDebug();

    }, 500);
});

// Expor funções globalmente
window.carregarAlunos = carregarAlunosDebug;
window.adicionarTreino = adicionarTreinoDebug;
window.verTreinos = verTreinosDebug;
window.mostrarLogCompleto = mostrarLogCompleto;
window.testarConexaoDebug = testarConexaoDebug;


addDebug('Sistema de debug inicializado');
