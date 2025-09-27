// ========================================
// AGENDA DO ALUNO - VISUALIZAÇÃO INDIVIDUAL
// ========================================

// Classe para gerenciar a agenda de um aluno específico
class AgendaAluno {
    constructor() {
        console.log('Inicializando AgendaAluno...');

        // Loading state management
        this.isLoading = true;
        this.loadingSteps = {
            dadosAluno: false,
            calendario: false,
            eventos: false,
            formulario: false
        };

        this.hoje = new Date();
        this.mesAtual = this.hoje.getMonth();
        this.anoAtual = this.hoje.getFullYear();
        this.diaSelecionado = this.hoje.getDate();

        this.meses = [
            'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
            'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
        ];

        this.mesesCompletos = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Dados do aluno selecionado
        this.alunoId = localStorage.getItem('alunoSelecionadoId') || '';
        this.nomeAluno = localStorage.getItem('nomeAlunoSelecionado') || 'Aluno';
        this.professorId = localStorage.getItem('professor_id') || localStorage.getItem('userId');
        this.emailAluno = ''; // Será carregado depois
        this.fotoAluno = null; // Nova propriedade para a foto

        // Sistema de eventos do aluno
        this.eventos = {};
        this.eventosCarregados = {};

        // Inicializar com loading
        this.mostrarLoading();
        setTimeout(() => this.init(), 100);
    }

    mostrarLoading() {
        const overlay = document.getElementById('loadingOverlay');
        const pageContent = document.getElementById('pageContent');
        
        if (overlay) overlay.style.display = 'flex';
        if (pageContent) pageContent.style.display = 'none';
        
        this.atualizarProgresso(10);
    }

    atualizarProgresso(percent) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    verificarCarregamentoCompleto() {
        const todosCarregados = Object.values(this.loadingSteps).every(step => step === true);
        
        if (todosCarregados && this.isLoading) {
            this.isLoading = false;
            this.esconderLoading();
        }
    }

    esconderLoading() {
        this.atualizarProgresso(100);
        
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            const pageContent = document.getElementById('pageContent');
            
            if (overlay) {
                overlay.classList.add('hide');
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            }
            
            if (pageContent) {
                pageContent.classList.add('show');
            }
            
            console.log('✅ Agenda do aluno totalmente carregada');
        }, 500);
    }

    init() {
        console.log('Inicializando agenda do aluno:', this.nomeAluno);

        // Verificar se dados necessários existem
        if (!this.alunoId || !this.professorId) {
            console.error('Dados necessários não encontrados:', {
                alunoId: this.alunoId,
                professorId: this.professorId
            });
            this.mostrarErroCarregamento('Dados do aluno ou professor não encontrados');
            return;
        }

        this.atualizarProgresso(20);

        // Carregar dados completos do aluno (incluindo foto e email)
        this.carregarDadosAluno();

        // Verificar se elementos essenciais existem
        const elementos = ['diaAtualAluno', 'mesAtualAluno', 'anoAtualAluno', 'diasGridAluno'];
        const todosExistem = elementos.every(id => {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.warn(`Elemento ${id} não encontrado`);
            }
            return elemento;
        });

        if (!todosExistem) {
            console.log('Elementos não prontos, tentando novamente...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.atualizarProgresso(40);

        // Configurar evento do formulário
        this.configurarFormulario();
        this.loadingSteps.formulario = true;

        this.atualizarProgresso(60);

        // Inicializar componentes
        this.atualizarDisplay();
        this.gerarCalendario();
        this.loadingSteps.calendario = true;
        
        this.atualizarProgresso(80);

        // Carregar eventos (async)
        this.carregarEventosAluno();
        this.atualizarDataSelecionada();

        console.log('✅ Componentes básicos da agenda inicializados');
    }

    mostrarErroCarregamento(mensagem) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner" style="color: #ff4444;">
                        <i class="ri-error-warning-line"></i>
                    </div>
                    <h3>Erro ao Carregar</h3>
                    <p>${mensagem}</p>
                    <button onclick="location.reload()" style="background: white; color: var(--laranja); border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px;">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    carregarDadosAluno() {
        if (!this.alunoId) return;

        console.log('Carregando dados completos do aluno ID:', this.alunoId);

        fetch(`https://proatleta.site/get_usuario.php?id=${encodeURIComponent(this.alunoId)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.usuario) {
                    this.nomeAluno = data.usuario.nome || this.nomeAluno;
                    this.emailAluno = data.usuario.email || '';
                    this.fotoAluno = data.usuario.foto || 'img/user.jpg';
                    
                    console.log('Dados do aluno carregados:', {
                        id: this.alunoId,
                        nome: this.nomeAluno,
                        email: this.emailAluno,
                        foto: this.fotoAluno
                    });
                    
                    // Atualizar interface com os novos dados
                    this.atualizarInfoAluno();
                } else {
                    console.warn('Não foi possível carregar dados do aluno');
                    this.fotoAluno = 'img/user.jpg';
                    this.atualizarInfoAluno();
                }
                
                this.loadingSteps.dadosAluno = true;
                this.verificarCarregamentoCompleto();
            })
            .catch(error => {
                console.error('Erro ao carregar dados do aluno:', error);
                this.fotoAluno = 'img/user.jpg';
                this.atualizarInfoAluno();
                this.loadingSteps.dadosAluno = true;
                this.verificarCarregamentoCompleto();
            });
    }

    configurarFormulario() {
        const form = document.getElementById('formEvento');
        if (form && !form.hasAttribute('data-listener-added')) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarEvento();
            });
            form.setAttribute('data-listener-added', 'true');
        }

        // Definir horários padrão
        this.definirHorariosDefault();
    }

    definirHorariosDefault() {
        const agora = new Date();
        const horaAtual = agora.getHours().toString().padStart(2, '0');
        const minutoAtual = agora.getMinutes().toString().padStart(2, '0');
        
        const inicioInput = document.getElementById('eventoHorarioInicio');
        const fimInput = document.getElementById('eventoHorarioFim');
        
        if (inicioInput && !inicioInput.value) {
            inicioInput.value = `${horaAtual}:${minutoAtual}`;
        }
        if (fimInput && !fimInput.value) {
            const horaFim = (agora.getHours() + 1).toString().padStart(2, '0');
            fimInput.value = `${horaFim}:${minutoAtual}`;
        }
    }

    mostrarErro(mensagem) {
        const container = document.getElementById('eventosContainerAluno');
        if (container) {
            container.innerHTML = `
                <div class="sem-eventos" style="color: #e53e3e;">
                    <i class="ri-error-warning-line"></i>
                    ${mensagem}
                </div>
            `;
        }
    }

    atualizarInfoAluno() {
        const nomeElement = document.getElementById('nomeAluno');
        const emailElement = document.getElementById('emailAluno');
        const tituloElement = document.getElementById('nomeAlunoTitulo');
        const avatarElement = document.getElementById('alunoAvatar');

        if (nomeElement) nomeElement.textContent = this.nomeAluno;
        if (emailElement) emailElement.textContent = this.emailAluno;
        if (tituloElement) tituloElement.textContent = `Agenda de ${this.nomeAluno.split(' ')[0]}`;
        
        // Atualizar foto do aluno
        if (avatarElement && this.fotoAluno) {
            avatarElement.innerHTML = `<img src="${this.fotoAluno}" alt="Foto do ${this.nomeAluno}" onerror="this.src='img/user.jpg'">`;
        }
    }

    atualizarDisplay() {
        const diaElement = document.getElementById('diaAtualAluno');
        const mesElement = document.getElementById('mesAtualAluno');
        const anoElement = document.getElementById('anoAtualAluno');

        if (diaElement && mesElement && anoElement) {
            diaElement.textContent = this.diaSelecionado.toString().padStart(2, '0');
            mesElement.textContent = this.meses[this.mesAtual];
            anoElement.textContent = this.anoAtual.toString();
        }
    }

    atualizarDataSelecionada() {
        const dataElement = document.getElementById('dataSelecionada');
        if (dataElement) {
            const dataFormatada = `${this.diaSelecionado.toString().padStart(2, '0')}/${(this.mesAtual + 1).toString().padStart(2, '0')}/${this.anoAtual}`;
            dataElement.textContent = `Dia selecionado: ${dataFormatada}`;
        }
    }

    mudarMes(direcao) {
        this.mesAtual += direcao;

        if (this.mesAtual > 11) {
            this.mesAtual = 0;
            this.anoAtual++;
        } else if (this.mesAtual < 0) {
            this.mesAtual = 11;
            this.anoAtual--;
        }

        const diasNoNovoMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();
        if (this.diaSelecionado > diasNoNovoMes) {
            this.diaSelecionado = diasNoNovoMes;
        }

        this.atualizarDisplay();
        this.atualizarDataSelecionada();
        this.gerarCalendario();
        this.carregarEventosAluno();
        this.mostrarEventos();
    }

    gerarCalendario() {
        const diasGrid = document.getElementById('diasGridAluno');
        if (!diasGrid) return;

        diasGrid.innerHTML = '';

        const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1);
        const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0);
        const diasNoMes = ultimoDia.getDate();
        const diaSemanaInicio = primeiroDia.getDay();

        // Dias do mês anterior
        const mesAnterior = new Date(this.anoAtual, this.mesAtual, 0);
        const diasMesAnterior = mesAnterior.getDate();

        for (let i = diaSemanaInicio - 1; i >= 0; i--) {
            const dia = this.criarDia(diasMesAnterior - i, 'mes-anterior');
            diasGrid.appendChild(dia);
        }

        // Dias do mês atual
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const classes = [];
            const dataKey = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

            // Verificar se é hoje
            if (dia === this.hoje.getDate() &&
                this.mesAtual === this.hoje.getMonth() &&
                this.anoAtual === this.hoje.getFullYear()) {
                classes.push('hoje');
            }

            // Verificar se está selecionado
            if (dia === this.diaSelecionado) {
                classes.push('selecionado');
            }

            // Verificar se tem eventos
            if (this.eventos[dataKey] && this.eventos[dataKey].length > 0) {
                classes.push('com-evento');
            }

            const diaElement = this.criarDia(dia, classes.join(' '));
            diaElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selecionarDia(dia, e.target);
            });
            diasGrid.appendChild(diaElement);
        }

        // Dias do próximo mês
        const totalCelulas = diasGrid.children.length;
        const celulasFaltantes = 42 - totalCelulas;

        for (let dia = 1; dia <= Math.min(celulasFaltantes, 14); dia++) {
            const diaElement = this.criarDia(dia, 'proximo-mes');
            diasGrid.appendChild(diaElement);
        }
    }

    criarDia(numero, classes = '') {
        const dia = document.createElement('div');
        dia.className = `dia ${classes}`.trim();
        dia.textContent = numero;
        return dia;
    }

    selecionarDia(dia, elemento) {
        // Remove seleção anterior
        document.querySelectorAll('.dia.selecionado').forEach(el => {
            el.classList.remove('selecionado');
        });

        // Adiciona nova seleção
        if (elemento) {
            elemento.classList.add('selecionado');
        }

        this.diaSelecionado = dia;
        this.atualizarDisplay();
        this.atualizarDataSelecionada();
        this.mostrarEventos();
    }

    carregarEventosAluno() {
        if (!this.alunoId || !this.professorId) {
            console.warn('Dados necessários não encontrados para carregar eventos');
            this.loadingSteps.eventos = true;
            this.verificarCarregamentoCompleto();
            return;
        }

        const mesChave = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}`;
        
        // Verificar se já carregamos este mês
        if (this.eventosCarregados[mesChave]) {
            this.mostrarEventos();
            this.loadingSteps.eventos = true;
            this.verificarCarregamentoCompleto();
            return;
        }

        console.log('Carregando eventos para aluno ID:', this.alunoId, 'mês:', mesChave);

        const url = `https://proatleta.site/get_eventos_aluno.php?aluno_id=${this.alunoId}&professor_id=${this.professorId}&mes=${mesChave}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);

                if (data.success) {
                    // Limpar eventos do mês atual
                    Object.keys(this.eventos).forEach(key => {
                        if (key.startsWith(mesChave)) {
                            delete this.eventos[key];
                        }
                    });

                    // Organizar eventos por data
                    if (data.eventos && data.eventos.length > 0) {
                        data.eventos.forEach(evento => {
                            if (!this.eventos[evento.data]) {
                                this.eventos[evento.data] = [];
                            }
                            this.eventos[evento.data].push(evento);
                        });
                    }

                    // Marcar como carregado
                    this.eventosCarregados[mesChave] = true;

                    // Atualizar interface
                    this.gerarCalendario();
                    this.mostrarEventos();
                } else {
                    throw new Error(data.message || 'Erro ao carregar eventos');
                }
                
                this.loadingSteps.eventos = true;
                this.verificarCarregamentoCompleto();
            })
            .catch(error => {
                console.error('Erro ao carregar eventos:', error);
                this.mostrarEventos(); // Mostrar sem eventos em caso de erro
                this.loadingSteps.eventos = true;
                this.verificarCarregamentoCompleto();
            });
    }

    mostrarEventos() {
        const container = document.getElementById('eventosContainerAluno');
        if (!container) return;

        const dataKey = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${this.diaSelecionado.toString().padStart(2, '0')}`;
        const eventosDoDia = this.eventos[dataKey] || [];

        if (eventosDoDia.length === 0) {
            container.innerHTML = `
                <div class="sem-eventos">
                    <i class="ri-calendar-line"></i>
                    Nenhum evento agendado para este dia
                </div>
            `;
            return;
        }

        container.innerHTML = eventosDoDia.map(evento => `
            <div class="evento-item">
                <div class="evento-info">
                    <div class="evento-titulo">${evento.titulo}</div>
                    <div class="evento-detalhes">
                        <div class="evento-horario">
                            <i class="ri-time-line"></i>
                            <span>${evento.horario}</span>
                        </div>
                        <div class="evento-local">
                            <i class="ri-map-pin-line"></i>
                            <span>${evento.local}</span>
                        </div>
                    </div>
                    ${evento.descricao ? `<div class="evento-descricao">${evento.descricao}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    salvarEvento() {
        const titulo = document.getElementById('eventoTitulo').value.trim();
        const horarioInicio = document.getElementById('eventoHorarioInicio').value;
        const horarioFim = document.getElementById('eventoHorarioFim').value;
        const local = document.getElementById('eventoLocal').value.trim();
        const descricao = document.getElementById('eventoDescricao').value.trim();

        // Validações
        if (!titulo || !horarioInicio || !horarioFim || !local) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Validar horários
        if (horarioInicio >= horarioFim) {
            alert('O horário de início deve ser anterior ao horário de fim.');
            return;
        }

        // Mostrar loading
        const btnSalvar = document.getElementById('btnSalvar');
        const btnTexto = document.getElementById('btnTexto');
        if (btnSalvar && btnTexto) {
            btnTexto.innerHTML = '<i class="ri-loader-4-line"></i> Salvando...';
            btnSalvar.disabled = true;
            btnSalvar.classList.add('btn-carregando');
        }

        const dataEvento = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${this.diaSelecionado.toString().padStart(2, '0')}`;

        const dados = {
            aluno_id: this.alunoId,
            professor_id: this.professorId,
            titulo: titulo,
            descricao: descricao,
            data_evento: dataEvento,
            horario_inicio: horarioInicio,
            horario_fim: horarioFim,
            local: local, // ← Este campo será mapeado para 'localizacao' no PHP
            tipo: 'treino'
        };

        console.log('Salvando evento:', dados);

        fetch('https://proatleta.site/salvar_evento_aluno.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        })
            .then(response => {
                console.log('Status da resposta:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);

                if (data.success) {
                    // Adicionar evento localmente
                    const dataKey = dataEvento;
                    if (!this.eventos[dataKey]) {
                        this.eventos[dataKey] = [];
                    }
                    
                    // Criar objeto do evento com formato consistente
                    const novoEvento = {
                        id: data.evento_id,
                        titulo: titulo,
                        descricao: descricao,
                        data: dataEvento,
                        horario: `${horarioInicio} - ${horarioFim}`,
                        local: local,
                        tipo: 'treino',
                        horario_inicio: horarioInicio,
                        horario_fim: horarioFim
                    };
                    
                    this.eventos[dataKey].push(novoEvento);

                    // Atualizar interface
                    this.gerarCalendario();
                    this.mostrarEventos();

                    // Limpar formulário
                    this.limparFormulario();

                    // Mostrar sucesso
                    alert('Evento adicionado com sucesso!');
                } else {
                    throw new Error(data.message || 'Erro ao salvar evento');
                }
            })
            .catch(error => {
                console.error('Erro ao salvar evento:', error);
                alert('Erro ao salvar evento: ' + error.message);
            })
            .finally(() => {
                // Restaurar botão
                if (btnSalvar && btnTexto) {
                    btnTexto.innerHTML = '<i class="ri-save-line"></i> Salvar Evento';
                    btnSalvar.disabled = false;
                    btnSalvar.classList.remove('btn-carregando');
                }
            });
    }

    limparFormulario() {
        const form = document.getElementById('formEvento');
        if (form) {
            form.reset();
            this.definirHorariosDefault();
        }
    }
}

// =================================================================
// VARIÁVEIS GLOBAIS E INSTÂNCIA
// =================================================================

let agendaAlunoInstance = null;

// =================================================================
// FUNÇÕES GLOBAIS
// =================================================================

function mudarMesAluno(direcao) {
    if (agendaAlunoInstance) {
        agendaAlunoInstance.mudarMes(direcao);
    }
}

function limparFormulario() {
    if (agendaAlunoInstance) {
        agendaAlunoInstance.limparFormulario();
    }
}

// =================================================================
// INICIALIZAÇÃO
// =================================================================

function initAgendaAluno() {
    console.log('Inicializando agenda do aluno...');
    agendaAlunoInstance = new AgendaAluno();
}

// Expor funções globalmente
window.initAgendaAluno = initAgendaAluno;
window.agendaAlunoInstance = agendaAlunoInstance;
window.voltar = voltar;
window.mudarMesAluno = mudarMesAluno;
window.limparFormulario = limparFormulario;

// Auto-inicializar se elementos existirem
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgendaAluno);
} else {
    setTimeout(initAgendaAluno, 100);
}
