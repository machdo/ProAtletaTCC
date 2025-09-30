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
        this.emailAluno = '';
        this.fotoAluno = null;

        // Sistema de eventos do aluno
        this.eventos = {};
        this.eventosCarregados = {};

        // Referência de toast
        this._toastDeleteSuccess = null;

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

        if (!this.alunoId || !this.professorId) {
            console.error('Dados necessários não encontrados:', {
                alunoId: this.alunoId,
                professorId: this.professorId
            });
            this.mostrarErroCarregamento('Dados do aluno ou professor não encontrados');
            return;
        }

        this.atualizarProgresso(20);
        this.carregarDadosAluno();

        const elementos = ['diaAtualAluno', 'mesAtualAluno', 'anoAtualAluno', 'diasGridAluno'];
        const todosExistem = elementos.every(id => {
            const elemento = document.getElementById(id);
            if (!elemento) console.warn(`Elemento ${id} não encontrado`);
            return elemento;
        });

        if (!todosExistem) {
            console.log('Elementos não prontos, tentando novamente...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.atualizarProgresso(40);
        this.configurarFormulario();
        this.loadingSteps.formulario = true;
        this.atualizarProgresso(60);

        this.atualizarDisplay();
        this.gerarCalendario();
        this.loadingSteps.calendario = true;

        this.atualizarProgresso(80);
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
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
        if (!form) {
            console.warn('Formulário não encontrado');
            return;
        }
        console.log('Configurando formulário de eventos...');
        form.removeEventListener('submit', this.handleFormSubmit);
        this.handleFormSubmit = (e) => {
            e.preventDefault();
            this.salvarEvento();
        };
        form.addEventListener('submit', this.handleFormSubmit);
        this.definirHorariosDefault();
        this.loadingSteps.formulario = true;
        this.verificarCarregamentoCompleto();
        console.log('Formulário configurado com sucesso');
    }

    definirHorariosDefault() {
        const agora = new Date();
        const horaAtual = agora.getHours().toString().padStart(2, '0');
        const minutoAtual = agora.getMinutes().toString().padStart(2, '0');
        const inicioInput = document.getElementById('eventoHorarioInicio');
        const fimInput = document.getElementById('eventoHorarioFim');
        if (inicioInput && !inicioInput.value) inicioInput.value = `${horaAtual}:${minutoAtual}`;
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
        if (this.diaSelecionado > diasNoNovoMes) this.diaSelecionado = diasNoNovoMes;
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
        const mesAnterior = new Date(this.anoAtual, this.mesAtual, 0);
        const diasMesAnterior = mesAnterior.getDate();

        for (let i = diaSemanaInicio - 1; i >= 0; i--) {
            const dia = this.criarDia(diasMesAnterior - i, 'mes-anterior');
            diasGrid.appendChild(dia);
        }

        for (let dia = 1; dia <= diasNoMes; dia++) {
            const classes = [];
            const dataKey = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            if (dia === this.hoje.getDate() && this.mesAtual === this.hoje.getMonth() && this.anoAtual === this.hoje.getFullYear()) classes.push('hoje');
            if (dia === this.diaSelecionado) classes.push('selecionado');
            if (this.eventos[dataKey] && this.eventos[dataKey].length > 0) classes.push('com-evento');
            const diaElement = this.criarDia(dia, classes.join(' '));
            diaElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selecionarDia(dia, e.target);
            });
            diasGrid.appendChild(diaElement);
        }

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
        document.querySelectorAll('.dia.selecionado').forEach(el => el.classList.remove('selecionado'));
        if (elemento) elemento.classList.add('selecionado');
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
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                if (data.success) {
                    Object.keys(this.eventos).forEach(key => {
                        if (key.startsWith(mesChave)) delete this.eventos[key];
                    });
                    if (data.eventos && data.eventos.length > 0) {
                        data.eventos.forEach(evento => {
                            if (!this.eventos[evento.data]) this.eventos[evento.data] = [];
                            this.eventos[evento.data].push(evento);
                        });
                    }
                    this.eventosCarregados[mesChave] = true;
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
                this.mostrarEventos();
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
                <div class="evento-header">
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
                    <div class="evento-actions">
                        <button class="btn-deletar-evento" onclick="agendaAlunoInstance.deletarEvento(${evento.id}, '${evento.titulo.replace(/'/g, "\\'")}')" title="Deletar evento">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Nova confirmação com app.dialog e toast de sucesso
    deletarEvento(eventoId, tituloEvento) {
        if (typeof app !== 'undefined' && app.dialog) {
            app.dialog.create({
                title: 'Confirmar',
                text: `Tem certeza que deseja deletar o evento "<b>${tituloEvento}</b>"?`,
                buttons: [
                    { text: 'Cancelar' },
                    {
                        text: 'Deletar',
                        bold: true,
                        cssClass: 'color-danger',
                        onClick: () => this._executarDeleteEvento(eventoId, tituloEvento)
                    }
                ]
            }).open();
        } else {
            const confirmar = confirm(`Tem certeza que deseja deletar o evento "${tituloEvento}"?`);
            if (confirmar) this._executarDeleteEvento(eventoId, tituloEvento);
        }
    }

    _executarDeleteEvento(eventoId, tituloEvento) {
        console.log('Deletando evento ID:', eventoId);
        const btnDeletar = document.querySelector(`button[onclick*="${eventoId}"]`);
        if (btnDeletar) {
            btnDeletar.innerHTML = '<i class="ri-loader-4-line"></i>';
            btnDeletar.classList.add('carregando');
            btnDeletar.disabled = true;
        }

        const dados = {
            evento_id: eventoId,
            aluno_id: this.alunoId,
            professor_id: this.professorId
        };

        fetch('https://proatleta.site/deletar_evento_aluno.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                if (!data.success) throw new Error(data.message || 'Erro ao deletar evento');

                const dataKey = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${this.diaSelecionado.toString().padStart(2, '0')}`;
                if (this.eventos[dataKey]) {
                    this.eventos[dataKey] = this.eventos[dataKey].filter(evento => evento.id != eventoId);
                }
                this.gerarCalendario();
                this.mostrarEventos();

                if (typeof app !== 'undefined' && app.toast) {
                    if (!this._toastDeleteSuccess) {
                        this._toastDeleteSuccess = app.toast.create({
                            text: 'Evento deletado com sucesso!',
                            position: 'center',
                            closeTimeout: 2000,
                            cssClass: 'toast-success'
                        });
                    }
                    this._toastDeleteSuccess.open();
                } else {
                    console.log('Evento deletado com sucesso!');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar evento:', error);
                if (typeof app !== 'undefined' && app.dialog) {
                    app.dialog.alert('Erro ao deletar evento: ' + error.message, 'Erro');
                } else {
                    alert('Erro ao deletar evento: ' + error.message);
                }
                if (btnDeletar) {
                    btnDeletar.innerHTML = '<i class="ri-delete-bin-line"></i>';
                    btnDeletar.classList.remove('carregando');
                    btnDeletar.disabled = false;
                }
            });
    }

    salvarEvento() {
        console.log('Salvando evento...');
        const titulo = document.getElementById('eventoTitulo')?.value?.trim();
        const descricao = document.getElementById('eventoDescricao')?.value?.trim();
        const horaInicio = document.getElementById('eventoHorarioInicio')?.value;
        const horaFim = document.getElementById('eventoHorarioFim')?.value;
        const local = document.getElementById('eventoLocal')?.value?.trim();
        const tipo = 'treino';

        if (!titulo) { this.mostrarErro('Título é obrigatório'); return; }
        if (!horaInicio || !horaFim) { this.mostrarErro('Horários são obrigatórios'); return; }
        if (!local) { this.mostrarErro('Local é obrigatório'); return; }
        if (horaInicio >= horaFim) { this.mostrarErro('Hora de início deve ser menor que hora de fim'); return; }

        const dataEvento = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${this.diaSelecionado.toString().padStart(2, '0')}`;

        const dadosEvento = {
            aluno_id: parseInt(this.alunoId),
            professor_id: parseInt(this.professorId),
            titulo,
            descricao: descricao || '',
            data_evento: dataEvento,
            horario_inicio: horaInicio,
            horario_fim: horaFim,
            local,
            tipo
        };

        console.log('Dados do evento:', dadosEvento);

        const btnSalvar = document.querySelector('#formEvento button[type="submit"]');
        const textoOriginal = btnSalvar?.innerHTML;
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s linear infinite;"></i> Salvando...';
            btnSalvar.disabled = true;
        }

        fetch('https://proatleta.site/salvar_evento_aluno.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEvento)
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                if (data.success) {
                    this.limparFormulario();
                    this.eventos = {};
                    this.eventosCarregados = {};
                    this.carregarEventosAluno();
                    this.gerarCalendario();
                    if (typeof app !== 'undefined' && app.dialog) {
                        app.dialog.create({
                            title: 'Sucesso',
                            text: 'Evento salvo com sucesso!',
                            buttons: [{ text: 'OK', bold: true }]
                        }).open();
                    } else {
                        console.log('Evento salvo com sucesso!');
                    }
                } else {
                    throw new Error(data.message || 'Erro desconhecido');
                }
            })
            .catch(error => {
                console.error('Erro ao salvar evento:', error);
                this.mostrarErro('Erro ao salvar evento: ' + error.message);
            })
            .finally(() => {
                if (btnSalvar && textoOriginal) {
                    btnSalvar.innerHTML = textoOriginal;
                    btnSalvar.disabled = false;
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
    if (agendaAlunoInstance) agendaAlunoInstance.mudarMes(direcao);
}

function salvarEvento() {
    if (agendaAlunoInstance) agendaAlunoInstance.salvarEvento();
    else console.error('Instância da agenda não encontrada');
}

function limparFormulario() {
    if (agendaAlunoInstance) agendaAlunoInstance.limparFormulario();
}

function deletarEvento(eventoId, tituloEvento) {
    if (agendaAlunoInstance) agendaAlunoInstance.deletarEvento(eventoId, tituloEvento);
}

// =================================================================
// INICIALIZAÇÃO
// =================================================================
function initAgendaAluno() {
    console.log('Inicializando agenda do aluno...');
    agendaAlunoInstance = new AgendaAluno();
}

window.initAgendaAluno = initAgendaAluno;
window.agendaAlunoInstance = agendaAlunoInstance;
window.voltar = voltar;
window.mudarMesAluno = mudarMesAluno;
window.limparFormulario = limparFormulario;
window.salvarEvento = salvarEvento;
window.deletarEvento = deletarEvento;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgendaAluno);
} else {
    setTimeout(initAgendaAluno, 100);
}
