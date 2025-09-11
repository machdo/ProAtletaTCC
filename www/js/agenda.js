// =================================================================
// AGENDA.JS - Para uso com Framework7 Routes
// =================================================================

console.log('=== AGENDA.JS CARREGADO ===');

// Classe principal do calendário
class Calendario {
    constructor() {
        console.log('Inicializando classe Calendario...');

        this.hoje = new Date();
        this.mesAtual = this.hoje.getMonth();
        this.anoAtual = this.hoje.getFullYear();
        this.diaSelecionado = this.hoje.getDate();

        this.meses = [
            'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
            'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
        ];

        // Sistema de eventos - exemplo com alguns eventos
        this.eventos = {
            [`${this.hoje.getFullYear()}-${(this.hoje.getMonth() + 1).toString().padStart(2, '0')}-${this.hoje.getDate().toString().padStart(2, '0')}`]: [
                {
                    titulo: 'Treino de Futebol',
                    horario: '18:00 - 20:00',
                    local: 'Campo da Escola'
                }
            ]
        };

        console.log('Calendário configurado:', {
            hoje: this.hoje,
            mesAtual: this.mesAtual,
            anoAtual: this.anoAtual,
            diaSelecionado: this.diaSelecionado
        });

        // Inicializar após um pequeno delay para garantir DOM
        setTimeout(() => this.init(), 50);
    }

    init() {
        console.log('Inicializando calendário...');

        // Verificar se elementos essenciais existem
        const elementos = ['diaAtual', 'mesAtual', 'anoAtual', 'diasGrid', 'eventosContainer'];
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

        console.log('✅ Todos elementos encontrados, inicializando...');

        // Inicializar componentes
        this.atualizarDisplay();
        this.gerarCalendario();
        this.mostrarEventos();

        console.log('✅ Calendário inicializado com sucesso');
    }

    atualizarDisplay() {
        const diaElement = document.getElementById('diaAtual');
        const mesElement = document.getElementById('mesAtual');
        const anoElement = document.getElementById('anoAtual');

        if (diaElement && mesElement && anoElement) {
            // Forçar limpeza e atualização
            diaElement.innerHTML = '';
            mesElement.innerHTML = '';
            anoElement.innerHTML = '';

            // Pequeno delay para forçar repaint
            setTimeout(() => {
                diaElement.textContent = this.diaSelecionado.toString().padStart(2, '0');
                mesElement.textContent = this.meses[this.mesAtual];
                anoElement.textContent = this.anoAtual.toString();

                console.log('Display atualizado:', {
                    dia: this.diaSelecionado,
                    mes: this.meses[this.mesAtual],
                    ano: this.anoAtual
                });
            }, 10);
        } else {
            console.error('Elementos de display não encontrados');
        }
    }

    mudarMes(direcao) {
        console.log('Mudando mês:', direcao);

        this.mesAtual += direcao;

        if (this.mesAtual > 11) {
            this.mesAtual = 0;
            this.anoAtual++;
        } else if (this.mesAtual < 0) {
            this.mesAtual = 11;
            this.anoAtual--;
        }

        // Ajustar dia selecionado se necessário
        const diasNoNovoMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();
        if (this.diaSelecionado > diasNoNovoMes) {
            this.diaSelecionado = diasNoNovoMes;
        }

        this.atualizarDisplay();
        this.gerarCalendario();
        this.mostrarEventos();
    }

    gerarCalendario() {
        const diasGrid = document.getElementById('diasGrid');
        if (!diasGrid) {
            console.error('Elemento diasGrid não encontrado');
            return;
        }

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

            const diaElement = this.criarDia(dia, classes.join(' '));
            diaElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selecionarDia(dia, e.target);
            });
            diasGrid.appendChild(diaElement);
        }

        // Dias do próximo mês para completar o grid
        const totalCelulas = diasGrid.children.length;
        const celulasFaltantes = 42 - totalCelulas; // 6 semanas x 7 dias

        for (let dia = 1; dia <= Math.min(celulasFaltantes, 14); dia++) {
            const diaElement = this.criarDia(dia, 'proximo-mes');
            diasGrid.appendChild(diaElement);
        }
    }

    criarDia(numero, classes = '') {
        const dia = document.createElement('div');
        dia.className = `dia ${classes}`.trim();
        dia.textContent = numero;
        dia.style.display = 'flex';
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
        this.mostrarEventos();
    }

    mostrarEventos() {
        const container = document.getElementById('eventosContainer');
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
                </div>
            </div>
        `).join('');
    }

    adicionarEvento(titulo, horario, local) {
        const dataKey = `${this.anoAtual}-${(this.mesAtual + 1).toString().padStart(2, '0')}-${this.diaSelecionado.toString().padStart(2, '0')}`;

        if (!this.eventos[dataKey]) {
            this.eventos[dataKey] = [];
        }

        this.eventos[dataKey].push({
            titulo: titulo || 'Novo Evento',
            horario: horario || '10:00 - 11:00',
            local: local || 'Local do evento'
        });

        this.mostrarEventos();

        // Feedback visual
        const btn = document.querySelector('.add-evento-btn');
        if (btn) {
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

// =================================================================
// VARIÁVEIS GLOBAIS E INSTÂNCIA DO CALENDÁRIO
// =================================================================

// Instância global do calendário
let calendarioInstance = null;

// =================================================================
// FUNÇÕES GLOBAIS CHAMADAS PELOS BOTÕES HTML
// =================================================================

function voltar() {
    console.log('Voltando para página anterior');
    if (typeof app !== 'undefined' && app.views && app.views.main) {
        app.views.main.router.back();
    } else if (window.history.length > 1) {
        window.history.back();
    } else {
        console.log('Não há página anterior');
    }
}

function mudarMes(direcao) {
    console.log('Função mudarMes chamada:', direcao);
    if (calendarioInstance && typeof calendarioInstance.mudarMes === 'function') {
        calendarioInstance.mudarMes(direcao);
    } else {
        console.error('Calendário não inicializado');
        // Tentar reinicializar
        initCalendario();
        setTimeout(() => {
            if (calendarioInstance) {
                calendarioInstance.mudarMes(direcao);
            }
        }, 200);
    }
}

function toggleFiltros() {
    console.log('Toggle filtros');
    // Implementar modal de filtros aqui
    if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.alert('Filtros serão implementados em breve!', 'Filtros');
    } else {
        alert('Filtros serão implementados em breve!');
    }
}

function adicionarEvento() {
    console.log('Adicionar evento');

    if (typeof app !== 'undefined' && app.dialog) {
        // Usando Framework7 dialog
        app.dialog.prompt('Nome do evento:', 'Novo Evento', function (titulo) {
            if (titulo) {
                app.dialog.prompt('Horário (ex: 10:00 - 11:00):', 'Horário', function (horario) {
                    if (horario) {
                        app.dialog.prompt('Local:', 'Local', function (local) {
                            if (local && calendarioInstance) {
                                calendarioInstance.adicionarEvento(titulo, horario, local);
                            }
                        });
                    }
                });
            }
        });
    } else {
        // Fallback para prompt nativo
        const titulo = prompt('Nome do evento:') || 'Novo Evento';
        const horario = prompt('Horário (ex: 10:00 - 11:00):') || '10:00 - 11:00';
        const local = prompt('Local:') || 'A definir';

        if (calendarioInstance) {
            calendarioInstance.adicionarEvento(titulo, horario, local);
        }
    }
}

function irPara(rota) {
    console.log('Navegando para:', rota);
    if (typeof app !== 'undefined' && app.views && app.views.main) {
        app.views.main.router.navigate(rota);
    } else {
        console.log(`Tentativa de navegar para: ${rota}`);
    }
}

// =================================================================
// FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL
// =================================================================

function initCalendario() {
    console.log('=== INIT CALENDÁRIO CHAMADO ===');

    try {
        // Limpar instância anterior se existir
        calendarioInstance = null;

        // Verificar se elementos essenciais existem
        const elementosEssenciais = ['diaAtual', 'mesAtual', 'anoAtual', 'diasGrid'];
        const todosExistem = elementosEssenciais.every(id => {
            const elemento = document.getElementById(id);
            console.log(`Verificando elemento ${id}:`, elemento ? 'OK' : 'NÃO ENCONTRADO');
            return elemento;
        });

        if (!todosExistem) {
            console.log('❌ Elementos não encontrados, tentando novamente em 100ms...');
            setTimeout(initCalendario, 100);
            return;
        }

        // Criar nova instância do calendário
        console.log('✅ Criando nova instância do calendário...');
        calendarioInstance = new Calendario();

        console.log('✅ Calendário inicializado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao inicializar calendário:', error);

        // Tentar novamente após um delay
        setTimeout(() => {
            console.log('🔄 Tentativa de recuperação...');
            try {
                calendarioInstance = new Calendario();
            } catch (e) {
                console.error('❌ Erro persistente:', e);
            }
        }, 1000);
    }
}

// =================================================================
// FUNÇÃO PARA ATUALIZAR CALENDÁRIO EXISTENTE
// =================================================================

function updateCalendario() {
    console.log('=== UPDATE CALENDÁRIO CHAMADO ===');

    if (calendarioInstance) {
        console.log('📱 Atualizando calendário existente...');
        try {
            calendarioInstance.atualizarDisplay();
            calendarioInstance.gerarCalendario();
            calendarioInstance.mostrarEventos();
            console.log('✅ Calendário atualizado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao atualizar calendário:', error);
            // Se falhar, reinicializar
            initCalendario();
        }
    } else {
        console.log('📱 Calendário não existe, inicializando...');
        initCalendario();
    }
}

// =================================================================
// EXPOR FUNÇÕES PARA O WINDOW (FRAMEWORK7 PRECISA DISSO)
// =================================================================

window.initCalendario = initCalendario;
window.updateCalendario = updateCalendario;
window.calendarioInstance = calendarioInstance;
window.voltar = voltar;
window.mudarMes = mudarMes;
window.toggleFiltros = toggleFiltros;
window.adicionarEvento = adicionarEvento;
window.irPara = irPara;


// =================================================================
// AUTO-INICIALIZAÇÃO (MODIFICAÇÃO)
// =================================================================

// Verificar se está sendo carregado via rota ou diretamente
function shouldAutoInit() {
    // Se existe Framework7 app e estamos na rota agenda, não auto-inicializar
    if (typeof app !== 'undefined' && app.views && app.views.main) {
        const currentRoute = app.views.main.router.currentRoute;
        if (currentRoute && currentRoute.path === '/agenda/') {
            console.log('Script carregado via rota, aguardando inicialização manual...');
            return false;
        }
    }
    return true;
}

// Inicializar automaticamente apenas se apropriado
console.log('🚀 Script agenda.js carregado...');
if (shouldAutoInit()) {
    console.log('Auto-inicializando calendário...');
    setTimeout(() => {
        initCalendario();
    }, 100);
} else {
    console.log('Aguardando inicialização manual via rota...');
}

console.log('=== FIM AGENDA.JS ===');