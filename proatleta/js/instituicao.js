// Tela de escolinha / clube / instituição no app: criar conta, entrar e publicar peneiras.
// Usa a mesma API do site (api/instituicoes.php e api/peneiras.php).
(function () {
  const PP = window.ProAtletaPeneiras;
  const API = PP.CONFIG.api;
  const CHAVE = 'pa:instituicao';

  const sessao = {
    ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch { return null; } },
    salvar(d) { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch { /* sem espaço */ } },
    limpar() { try { localStorage.removeItem(CHAVE); } catch { /* nada */ } },
  };

  function chamar(caminho, { metodo = 'GET', corpo, token } = {}) {
    const headers = {};
    if (corpo) headers['Content-Type'] = 'application/json';
    if (token) headers['X-Token'] = token;
    return PP.buscarJSON(`${API}/${caminho}`, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined, tentativas: metodo === 'GET' ? 1 : 0 });
  }

  function erroCampo(input, msg) {
    const campo = input.closest('.pa-campo');
    if (!campo) return;
    campo.classList.toggle('erro', !!msg);
    campo.querySelector('.pa-erro').textContent = msg || '';
    if (msg && window.Motion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Motion.animate(input, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.3 });
    }
  }

  function validar(form, regras) {
    let primeiro = null;
    Object.entries(regras).forEach(([nome, regra]) => {
      const input = form.elements[nome];
      const msg = regra(input.value);
      erroCampo(input, msg);
      if (msg && !primeiro) primeiro = input;
    });
    primeiro?.focus();
    return !primeiro;
  }

  // Limpa o erro assim que a pessoa corrige
  function limparAoDigitar(form) {
    form.addEventListener('input', (e) => {
      if (e.target.closest('.pa-campo.erro')) erroCampo(e.target, '');
    });
  }

  function aviso(form, texto, tipo) {
    const el = form.querySelector('.pa-aviso');
    el.className = `pa-aviso ${tipo ? 'pa-aviso--' + tipo : ''}`;
    el.textContent = texto;
  }

  function mensagemErro(form, err) {
    const campo = err.dados?.campo && form.elements[err.dados.campo];
    if (campo) { erroCampo(campo, err.message); campo.focus(); return; }
    aviso(form, err.message === 'Failed to fetch' ? 'Sem conexão com o servidor. Tente de novo.' : err.message, 'erro');
  }

  async function enviando(botao, tarefa) {
    botao.setAttribute('aria-busy', 'true');
    try { await tarefa(); } finally { botao.removeAttribute('aria-busy'); }
  }

  const REGRA_EMAIL = (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Confira o e-mail.' : '');
  const REGRA_SENHA = (v) => (v.length < 8 || !/[A-Z]/.test(v) || !/\d/.test(v) ? 'Use 8 caracteres, com uma maiúscula e um número.' : '');

  function iniciar(pagina) {
    if (pagina.dataset.iniciada) return;
    pagina.dataset.iniciada = '1';
    const $ = (id) => pagina.querySelector('#' + id);
    const entrada = $('inEntrada');
    const painel = $('inPainel');
    const formCriar = $('inCriar');
    const formEntrar = $('inEntrar');
    const formPeneira = $('inPeneira');
    [formCriar, formEntrar, formPeneira].forEach(limparAoDigitar);

    // Abas
    pagina.querySelectorAll('[data-aba]').forEach((aba) => aba.addEventListener('click', () => {
      pagina.querySelectorAll('[data-aba]').forEach((a) => {
        a.setAttribute('aria-selected', String(a === aba));
        $(a.dataset.aba).hidden = a !== aba;
      });
    }));

    function entrouComo(r) {
      sessao.salvar({ token: r.token, instituicao: r.instituicao });
      abrirPainel();
    }

    formCriar.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(formCriar, { nome: (v) => (v.trim().length < 3 ? 'Escreva o nome da instituição.' : ''), email: REGRA_EMAIL, senha: REGRA_SENHA })) return;
      aviso(formCriar, '');
      enviando(formCriar.querySelector('[type=submit]'), async () => {
        try {
          entrouComo(await chamar('instituicoes.php?acao=cadastrar', { metodo: 'POST', corpo: Object.fromEntries(new FormData(formCriar)) }));
          app.toast.create({ text: 'Conta criada! Publique sua primeira peneira.', closeTimeout: 2500, position: 'center' }).open();
        } catch (err) { mensagemErro(formCriar, err); }
      });
    });

    formEntrar.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(formEntrar, { email: REGRA_EMAIL, senha: (v) => (!v ? 'Digite sua senha.' : '') })) return;
      aviso(formEntrar, '');
      enviando(formEntrar.querySelector('[type=submit]'), async () => {
        try { entrouComo(await chamar('instituicoes.php?acao=entrar', { metodo: 'POST', corpo: Object.fromEntries(new FormData(formEntrar)) })); }
        catch (err) { mensagemErro(formEntrar, err); }
      });
    });

    // Publicar peneira
    const hoje = new Date().toISOString().slice(0, 10);
    formPeneira.elements.data_peneira.min = hoje;

    $('pVerMapa').addEventListener('click', () => {
      const d = Object.fromEntries(new FormData(formPeneira));
      if (!d.endereco.trim() || !d.cidade.trim()) {
        if (!d.endereco.trim()) erroCampo(formPeneira.elements.endereco, 'Coloque o endereço para ver no mapa.');
        if (!d.cidade.trim()) erroCampo(formPeneira.elements.cidade, 'Coloque a cidade.');
        return;
      }
      app.popup.create({
        swipeToClose: 'to-bottom',
        content: `<div class="popup pa-popup"><div class="pa-popup__mapa" style="height:100%">
          <div class="pa-popup__mapa-fundo"><i class="ri-map-pin-2-fill"></i><span>${PP.escapar(PP.enderecoCompleto(d))}</span></div>
          <iframe title="Mapa" src="${PP.urlMapaEmbed(d)}"></iframe>
          <button type="button" class="pa-icone pa-popup__fechar popup-close" aria-label="Fechar"><i class="ri-close-line"></i></button></div></div>`,
        on: { closed(p) { p.destroy(); } },
      }).open();
    });

    formPeneira.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = validar(formPeneira, {
        titulo: (v) => (v.trim().length < 5 ? 'Dê um título com esporte e categoria.' : ''),
        data_peneira: (v) => (!v ? 'Escolha a data.' : v < hoje ? 'Escolha uma data de hoje em diante.' : ''),
        endereco: (v) => (v.trim().length < 5 ? 'Coloque rua, número e bairro.' : ''),
        cidade: (v) => (!v.trim() ? 'Coloque a cidade.' : ''),
        link_inscricao: (v) => (v && !/^https?:\/\/.+\..+/.test(v) ? 'O link precisa começar com https://' : ''),
      });
      if (!ok) return;
      aviso(formPeneira, '');
      enviando(formPeneira.querySelector('[type=submit]'), async () => {
        try {
          await chamar('peneiras.php?acao=criar', { metodo: 'POST', corpo: Object.fromEntries(new FormData(formPeneira)), token: sessao.ler().token });
          formPeneira.reset();
          aviso(formPeneira, 'Peneira publicada! Já aparece para os atletas.', 'ok');
          // a lista de peneiras do app busca de novo na próxima abertura
          try { localStorage.removeItem('pa:instituicoes'); } catch { /* nada */ }
          carregarMinhas();
        } catch (err) {
          if (err.status === 401) { sair(); return; }
          mensagemErro(formPeneira, err);
        }
      });
    });

    async function carregarMinhas() {
      const lista = $('inMinhas');
      lista.innerHTML = '<div class="pa-esqueleto" style="height:60px"></div>';
      try {
        const r = await chamar('peneiras.php?acao=minhas', { token: sessao.ler().token });
        if (!r.peneiras.length) {
          lista.innerHTML = '<p class="pa-resumo">Nenhuma peneira publicada ainda.</p>';
          return;
        }
        lista.innerHTML = r.peneiras.map((p) => `
          <div class="pa-minha">
            <div><strong>${PP.escapar(p.titulo)}</strong><span>${PP.formatarData(p.data_peneira).curta} · ${PP.escapar(p.cidade)}${p.data_peneira < hoje ? ' · encerrada' : ''}</span></div>
            <button type="button" class="pa-icone" data-excluir="${p.id}" aria-label="Excluir"><i class="ri-delete-bin-6-line"></i></button>
          </div>`).join('');
        if (window.paCascata) window.paCascata([...lista.children]);
        lista.querySelectorAll('[data-excluir]').forEach((b) => b.addEventListener('click', () => {
          app.dialog.confirm('A peneira sai do app e do site.', 'Excluir peneira?', async () => {
            try {
              await chamar(`peneiras.php?acao=excluir&id=${b.dataset.excluir}`, { metodo: 'POST', token: sessao.ler().token });
              try { localStorage.removeItem('pa:instituicoes'); } catch { /* nada */ }
              carregarMinhas();
            } catch { app.dialog.alert('Não deu para excluir agora. Tente de novo.', 'Ops'); }
          });
        }));
      } catch (err) {
        if (err.status === 401) { sair(); return; }
        lista.innerHTML = '<p class="pa-resumo">Não deu para carregar suas peneiras agora.</p>';
      }
    }

    function abrirPainel() {
      const s = sessao.ler();
      entrada.hidden = true;
      painel.hidden = false;
      $('inOla').textContent = `Olá, ${s.instituicao.nome}`;
      carregarMinhas();
      if (window.paCascata) window.paCascata([...painel.children]);
    }

    function sair() {
      sessao.limpar();
      painel.hidden = true;
      entrada.hidden = false;
    }
    $('inSair').addEventListener('click', sair);

    if (sessao.ler()?.token) abrirPainel();
  }

  window.iniciarInstituicao = function () {
    const pagina = document.querySelector('.page[data-name="instituicao"]');
    if (pagina) iniciar(pagina);
  };
  window.iniciarInstituicao();
})();
