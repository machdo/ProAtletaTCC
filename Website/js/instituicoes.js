// Área das instituições: criar conta, entrar, publicar peneira com prévia ao vivo e mapa.
(function () {
  const PA = window.ProAtleta;
  const API = PA.CONFIG.api;
  const CHAVE = 'pa:instituicao';

  const sessao = {
    ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch { return null; } },
    salvar(dados) { try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch { /* modo privado */ } },
    limpar() { try { localStorage.removeItem(CHAVE); } catch { /* nada */ } },
  };

  const $ = (id) => document.getElementById(id);
  const areaEntrada = $('area-entrada');
  const areaPainel = $('area-painel');

  async function chamar(caminho, { metodo = 'GET', corpo, token } = {}) {
    const headers = {};
    if (corpo) headers['Content-Type'] = 'application/json';
    if (token) headers['X-Token'] = token;
    return PA.buscarJSON(`${API}/${caminho}`, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined, tentativas: metodo === 'GET' ? 1 : 0 });
  }

  function mostrarErroServidor(form, err) {
    const aviso = form.querySelector('.form-aviso');
    const campo = err.dados?.campo && form.elements[err.dados.campo];
    if (campo) { PA.erroCampo(campo, err.message); campo.focus(); return; }
    aviso.className = 'form-aviso form-aviso--erro';
    aviso.textContent = err.name === 'AbortError' || err.message === 'Failed to fetch'
      ? 'Sem conexão com o servidor agora. Tente de novo em instantes.'
      : err.message;
  }

  // ---------- Abas ----------
  const abas = [$('aba-criar'), $('aba-entrar')];
  function trocarAba(alvo) {
    abas.forEach((a) => {
      const ativo = a === alvo;
      a.setAttribute('aria-selected', String(ativo));
      $(a.getAttribute('aria-controls')).hidden = !ativo;
    });
    $(alvo.getAttribute('aria-controls')).querySelector('input')?.focus();
  }
  abas.forEach((a, i) => {
    a.addEventListener('click', () => trocarAba(a));
    a.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); trocarAba(abas[(i + 1) % 2]); abas[(i + 1) % 2].focus(); }
    });
  });

  // ---------- Criar conta ----------
  const formCriar = $('form-criar');
  const validarCriar = PA.ligarValidacao(formCriar, {
    nome: (v) => (v.trim().length < 3 ? 'Escreva o nome da instituição.' : ''),
    email: PA.REGRAS.email,
    senha: PA.REGRAS.senha,
  });
  formCriar.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarCriar()) return;
    const btn = formCriar.querySelector('[type=submit]');
    btn.setAttribute('aria-busy', 'true');
    formCriar.querySelector('.form-aviso').textContent = '';
    try {
      const dados = Object.fromEntries(new FormData(formCriar));
      const r = await chamar('instituicoes.php?acao=cadastrar', { metodo: 'POST', corpo: dados });
      sessao.salvar({ token: r.token, instituicao: r.instituicao });
      PA.toast('Conta criada! Agora publique sua primeira peneira.');
      abrirPainel();
    } catch (err) {
      mostrarErroServidor(formCriar, err);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  // ---------- Entrar ----------
  const formEntrar = $('form-entrar');
  const validarEntrar = PA.ligarValidacao(formEntrar, { email: PA.REGRAS.email, senha: (v) => (!v ? 'Digite sua senha.' : '') });
  formEntrar.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarEntrar()) return;
    const btn = formEntrar.querySelector('[type=submit]');
    btn.setAttribute('aria-busy', 'true');
    formEntrar.querySelector('.form-aviso').textContent = '';
    try {
      const r = await chamar('instituicoes.php?acao=entrar', { metodo: 'POST', corpo: Object.fromEntries(new FormData(formEntrar)) });
      sessao.salvar({ token: r.token, instituicao: r.instituicao });
      abrirPainel();
    } catch (err) {
      mostrarErroServidor(formEntrar, err);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  // ---------- Painel ----------
  const formPeneira = $('form-peneira');
  const campoData = formPeneira.elements.data_peneira;
  campoData.min = new Date().toISOString().slice(0, 10);

  function dadosDoFormulario() {
    const d = Object.fromEntries(new FormData(formPeneira));
    const lista = (t) => String(t || '').split(',').map((s) => s.trim()).filter(Boolean);
    return {
      id: 'previa',
      titulo: d.titulo || 'Título da peneira',
      instituicao: sessao.ler()?.instituicao?.nome || 'Sua instituição',
      esporte: d.esporte,
      categorias: lista(d.categorias),
      posicoes: lista(d.posicoes),
      data_peneira: d.data_peneira || campoData.min,
      hora: d.hora || null,
      endereco: d.endereco || 'Endereço do local',
      cidade: d.cidade || 'Cidade',
      estado: (d.estado || 'SP').toUpperCase(),
      vagas: d.vagas ? Number(d.vagas) : null,
      gratuita: d.gratuita === '1',
      link_inscricao: d.link_inscricao || null,
      descricao: d.descricao || null,
    };
  }

  function atualizarPrevia() {
    const p = dadosDoFormulario();
    $('previa').innerHTML = PA.cartaoHTML(p);
    const c = $('previa').querySelector('.cartao');
    c.removeAttribute('role');
    c.removeAttribute('tabindex');
  }

  let tempoMapa;
  let ultimoEndereco = '';
  function atualizarMapa() {
    clearTimeout(tempoMapa);
    tempoMapa = setTimeout(() => {
      const d = dadosDoFormulario();
      const endereco = formPeneira.elements.endereco.value.trim() && formPeneira.elements.cidade.value.trim() ? PA.enderecoCompleto(d) : '';
      if (!endereco || endereco === ultimoEndereco) return;
      ultimoEndereco = endereco;
      const mapa = $('previa-mapa');
      let iframe = mapa.querySelector('iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.title = 'Mapa do local da peneira';
        mapa.appendChild(iframe);
      }
      mapa.querySelector('.mapa-fundo span').textContent = endereco;
      iframe.src = PA.urlMapaEmbed(d);
    }, 700);
  }
  formPeneira.addEventListener('input', () => { atualizarPrevia(); atualizarMapa(); });
  formPeneira.addEventListener('change', atualizarPrevia);

  const validarPeneira = PA.ligarValidacao(formPeneira, {
    titulo: (v) => (v.trim().length < 5 ? 'Dê um título que diga esporte e categoria.' : ''),
    data_peneira: (v) => (!v ? 'Escolha a data.' : v < campoData.min ? 'Escolha uma data de hoje em diante.' : ''),
    endereco: (v) => (v.trim().length < 5 ? 'Coloque rua, número e bairro.' : ''),
    cidade: (v) => (!v.trim() ? 'Coloque a cidade.' : ''),
    link_inscricao: (v) => (v && !/^https?:\/\/.+\..+/.test(v) ? 'O link precisa começar com https://' : ''),
  });

  formPeneira.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarPeneira()) return;
    const s = sessao.ler();
    const btn = formPeneira.querySelector('[type=submit]');
    const aviso = formPeneira.querySelector('.form-aviso');
    btn.setAttribute('aria-busy', 'true');
    aviso.textContent = '';
    try {
      const d = Object.fromEntries(new FormData(formPeneira));
      await chamar('peneiras.php?acao=criar', { metodo: 'POST', corpo: d, token: s.token });
      formPeneira.reset();
      ultimoEndereco = '';
      $('previa-mapa').querySelector('iframe')?.remove();
      $('previa-mapa').querySelector('.mapa-fundo span').textContent = 'Digite o endereço para ver o local no mapa';
      atualizarPrevia();
      aviso.className = 'form-aviso form-aviso--ok';
      aviso.textContent = 'Peneira publicada! Ela já aparece no site e no app.';
      carregarMinhas();
    } catch (err) {
      if (err.status === 401) { sair(); PA.toast(err.message); return; }
      mostrarErroServidor(formPeneira, err);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  async function carregarMinhas() {
    const s = sessao.ler();
    const lista = $('minhas');
    lista.innerHTML = '<div class="esqueleto" style="min-height:64px"></div>';
    try {
      const r = await chamar('peneiras.php?acao=minhas', { token: s.token });
      if (!r.peneiras.length) {
        lista.innerHTML = '<p style="color:var(--texto-suave)">Nenhuma peneira publicada ainda. A primeira fica aqui.</p>';
        return;
      }
      const hoje = new Date().toISOString().slice(0, 10);
      lista.innerHTML = r.peneiras.map((p) => `
        <div class="minha">
          <div><strong>${PA.escapar(p.titulo)}</strong><span>${PA.formatarData(p.data_peneira).curta} · ${PA.escapar(p.cidade)}${p.data_peneira < hoje ? ' · encerrada' : ''}</span></div>
          <button class="btn-icone" type="button" data-excluir="${p.id}" aria-label="Excluir ${PA.escapar(p.titulo)}">${PA.ICONES.lixeira}</button>
        </div>`).join('');
      PA.ligarBotoes(lista);
      PA.entrarEmCascata([...lista.children]);
      lista.querySelectorAll('[data-excluir]').forEach((b) => b.addEventListener('click', () => excluir(b)));
    } catch (err) {
      if (err.status === 401) { sair(); PA.toast(err.message); return; }
      lista.innerHTML = '<p style="color:var(--texto-suave)">Não deu para carregar suas peneiras agora.</p>';
    }
  }

  async function excluir(botao) {
    const item = botao.closest('.minha');
    const titulo = item.querySelector('strong').textContent;
    if (!confirm(`Excluir a peneira "${titulo}"? Ela sai do site e do app.`)) return;
    try {
      await chamar(`peneiras.php?acao=excluir&id=${botao.dataset.excluir}`, { metodo: 'POST', token: sessao.ler().token });
      PA.toast('Peneira excluída.');
      carregarMinhas();
    } catch {
      PA.toast('Não deu para excluir agora. Tente de novo.');
    }
  }

  function abrirPainel() {
    const s = sessao.ler();
    areaEntrada.hidden = true;
    areaPainel.hidden = false;
    $('ola').textContent = `Olá, ${s.instituicao.nome}`;
    atualizarPrevia();
    carregarMinhas();
    PA.ligarBotoes(areaPainel);
  }

  function sair() {
    sessao.limpar();
    areaPainel.hidden = true;
    areaEntrada.hidden = false;
  }
  $('sair').addEventListener('click', sair);

  if (sessao.ler()?.token) abrirPainel();
})();
