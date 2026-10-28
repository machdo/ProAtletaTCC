// Tela de peneiras do app.
// Abre na hora com o que está salvo no aparelho e atualiza por trás (as duas APIs).
// Puxar para baixo atualiza; voltar para o app depois de um tempo também atualiza.
(function () {
  const PP = window.ProAtletaPeneiras;
  if (!PP) {
    console.error('proatleta-peneiras.js não carregado');
    return;
  }

  const estado = { todas: [], esporte: '', cidade: '', q: '', carregando: false };
  let el = {};

  function pegarElementos(pagina) {
    const q = (id) => pagina.querySelector('#' + id);
    el = {
      pagina,
      conteudo: pagina.querySelector('.page-content'),
      status: q('pnStatus'),
      busca: q('pnBusca'),
      esportes: q('pnEsportes'),
      cidades: q('pnCidades'),
      blocoDestaques: q('pnBlocoDestaques'),
      destaques: q('pnDestaques'),
      lista: q('pnLista'),
      contagem: q('pnContagem'),
      noticias: q('pnNoticias'),
      noticiasStatus: q('pnNoticiasStatus'),
      atualizar: q('pnAtualizar'),
    };
  }

  const esc = PP.escapar;
  const normalizar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const hora = (t) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // ---------- Desenho ----------
  function cartao(p, { escuro = false, selo = '' } = {}) {
    const d = PP.formatarData(p.data_peneira);
    const quando = PP.quandoTexto(p.data_peneira);
    return `
      <article class="pa-card ${escuro ? 'pa-card--escuro' : ''}" data-id="${p.id}" role="button" tabindex="0">
        ${selo ? `<span class="pa-selo">${esc(selo)}</span>` : ''}
        <div class="pa-card__topo">
          <div class="pa-data"><b>${d.dia}</b><span>${d.mes}</span></div>
          <div class="pa-card__titulos">
            <h3>${esc(p.titulo)}</h3>
            <p>${esc(p.instituicao)}${p.verificada ? ' <i class="mdi mdi-check-decagram pa-verificada" aria-label="verificada"></i>' : ''}</p>
          </div>
        </div>
        <div class="pa-tags"><span class="pa-tag pa-tag--forte">${esc(p.esporte)}</span>${(p.categorias || []).slice(0, 3).map((c) => `<span class="pa-tag">${esc(c)}</span>`).join('')}</div>
        <p class="pa-linha"><i class="ri-map-pin-2-line"></i>${esc(p.cidade)} · ${esc(p.endereco)}</p>
        <div class="pa-card__rodape">
          <span>${esc(quando || (p.hora ? 'às ' + p.hora : ''))}</span>
          <span class="pa-mapa"><i class="ri-map-2-line"></i>Ver no mapa</span>
        </div>
      </article>`;
  }

  function noticia(n) {
    const d = PP.formatarData(n.data);
    return `
      <article class="pa-card pa-noticia" ${n.link ? `data-link="${esc(n.link)}" role="link" tabindex="0"` : ''}>
        <div class="pa-card__topo">
          <div class="pa-data pa-data--claro"><b>${d.dia}</b><span>${d.mes}</span></div>
          <div class="pa-card__titulos"><h3>${esc(n.titulo)}</h3></div>
        </div>
        ${n.resumo ? `<p class="pa-resumo">${esc(n.resumo)}</p>` : ''}
        ${n.link ? '<div class="pa-card__rodape"><span>Notícia</span><span class="pa-mapa">Ler mais<i class="ri-external-link-line"></i></span></div>' : ''}
      </article>`;
  }

  const esqueletos = (n, classe = '') => Array.from({ length: n }, () => `<div class="pa-esqueleto ${classe}"></div>`).join('');

  function vazio(icone, titulo, texto, botao) {
    return `<div class="pa-vazio"><i class="${icone}"></i><h3>${titulo}</h3><p>${texto}</p>${botao ? `<button type="button" class="pa-btn" data-acao="${botao.acao}">${botao.texto}</button>` : ''}</div>`;
  }

  function chips(container, valores, atual, rotuloTodos, aoEscolher) {
    if (valores.length < 2) { container.innerHTML = ''; return; }
    container.innerHTML = [['', rotuloTodos], ...valores.map((v) => [v, v])]
      .map(([v, r]) => `<button type="button" class="pa-chip" data-valor="${esc(v)}" aria-pressed="${v === atual}">${esc(r)}</button>`).join('');
    container.querySelectorAll('.pa-chip').forEach((b) => b.addEventListener('click', () => {
      container.querySelectorAll('.pa-chip').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      aoEscolher(b.dataset.valor);
    }));
  }

  function filtrar() {
    const q = normalizar(estado.q.trim());
    return estado.todas.filter((p) => {
      if (estado.esporte && p.esporte !== estado.esporte) return false;
      if (estado.cidade && p.cidade !== estado.cidade) return false;
      return !q || normalizar([p.titulo, p.instituicao, p.cidade, ...(p.categorias || []), ...(p.posicoes || [])].join(' ')).includes(q);
    });
  }

  function desenharPeneiras({ animar = false } = {}) {
    const lista = filtrar();
    const filtrando = estado.esporte || estado.cidade || estado.q.trim();

    const top = [...estado.todas].sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 5);
    el.blocoDestaques.hidden = !!filtrando || !top.length;
    if (!el.blocoDestaques.hidden) {
      el.destaques.innerHTML = top.map((p, i) => cartao(p, { escuro: true, selo: i === 0 ? 'Mais procurada' : '' })).join('');
    }

    el.contagem.textContent = estado.todas.length ? `${lista.length}` : '';
    el.lista.innerHTML = lista.length
      ? lista.map((p) => cartao(p)).join('')
      : estado.todas.length
        ? vazio('ri-filter-off-line', 'Nada com esses filtros', 'Tente outro esporte ou cidade.', { acao: 'limpar', texto: 'Limpar filtros' })
        : vazio('ri-calendar-close-line', 'Nenhuma peneira publicada', 'Assim que uma escolinha ou clube publicar, ela aparece aqui.');

    if (animar && window.paCascata) window.paCascata([...el.destaques.children, ...[...el.lista.children].slice(0, 6)]);
  }

  function montarFiltros() {
    const unicos = (campo) => [...new Set(estado.todas.map((p) => p[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    chips(el.esportes, unicos('esporte'), estado.esporte, 'Todos', (v) => { estado.esporte = v; desenharPeneiras(); });
    chips(el.cidades, unicos('cidade'), estado.cidade, 'Todas as cidades', (v) => { estado.cidade = v; desenharPeneiras(); });
  }

  function desenharNoticias(lista) {
    el.noticias.innerHTML = lista.length
      ? lista.slice(0, 20).map(noticia).join('')
      : vazio('ri-newspaper-line', 'Sem notícias novas', 'Quando sair peneira na imprensa, ela aparece aqui.');
  }

  // ---------- Detalhe com mapa ----------
  function abrirDetalhe(p) {
    const d = PP.formatarData(p.data_peneira);
    const info = [
      ['ri-calendar-event-line', 'Quando', `${d.extenso}${p.hora ? ' às ' + p.hora : ''}`],
      ['ri-map-pin-2-line', 'Onde', PP.enderecoCompleto(p)],
      (p.categorias || []).length && ['ri-team-line', 'Categorias', p.categorias.join(', ')],
      (p.posicoes || []).length && ['ri-football-line', 'Posições', p.posicoes.join(', ')],
      p.vagas && ['ri-user-add-line', 'Vagas', String(p.vagas)],
      ['ri-price-tag-3-line', 'Inscrição', p.gratuita ? 'Gratuita' : 'Com taxa'],
    ].filter(Boolean);

    const popup = app.popup.create({
      swipeToClose: 'to-bottom',
      content: `
        <div class="popup pa-popup">
          <div class="pa-popup__mapa">
            <div class="pa-popup__mapa-fundo"><i class="ri-map-pin-2-fill"></i><span>${esc(PP.enderecoCompleto(p))}</span></div>
            <iframe title="Mapa do local" loading="lazy" src="${PP.urlMapaEmbed(p)}"></iframe>
            <button type="button" class="pa-icone pa-popup__fechar popup-close" aria-label="Fechar"><i class="ri-close-line"></i></button>
          </div>
          <div class="page-content pa-popup__corpo">
            <p class="pa-popup__org">${esc(p.esporte)} · ${esc(p.instituicao)}</p>
            <h2>${esc(p.titulo)}</h2>
            <ul class="pa-info">${info.map(([i, t, v]) => `<li><i class="${i}"></i><div><small>${t}</small>${esc(v)}</div></li>`).join('')}</ul>
            ${p.descricao ? `<p class="pa-resumo">${esc(p.descricao)}</p>` : ''}
            <div class="pa-acoes">
              <button type="button" class="pa-btn" data-ir="${esc(PP.urlComoChegar(p))}"><i class="ri-direction-line"></i>Como chegar</button>
              ${p.link_inscricao ? `<button type="button" class="pa-btn pa-btn--escuro" data-ir="${esc(p.link_inscricao)}"><i class="ri-edit-box-line"></i>Inscrever-se</button>` : ''}
            </div>
          </div>
        </div>`,
      on: {
        opened(pp) {
          pp.el.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => PP.abrirExterno(b.dataset.ir)));
        },
        closed(pp) { pp.destroy(); },
      },
    });
    popup.open();
  }

  // ---------- Dados ----------
  function mostrarStatus(texto, tipo = '') {
    el.status.textContent = texto;
    el.status.dataset.tipo = tipo;
  }

  async function atualizar({ forcar = false, animar = false } = {}) {
    if (estado.carregando) return;
    estado.carregando = true;
    el.atualizar.classList.add('girando');

    const cacheInst = PP.cache.ler('instituicoes');
    const cacheRender = PP.cache.ler('render');

    // 1) Mostra o que já existe no aparelho, na hora
    if (cacheInst) {
      estado.todas = cacheInst.dados;
      montarFiltros();
      desenharPeneiras({ animar });
    } else {
      el.destaques.innerHTML = esqueletos(2, 'pa-esqueleto--largo');
      el.lista.innerHTML = esqueletos(3);
    }
    if (cacheRender) desenharNoticias(cacheRender.dados);
    else el.noticias.innerHTML = esqueletos(2);

    // 2) Busca o que está velho (ou tudo, se a pessoa pediu)
    const tarefas = [];
    if (forcar || PP.cache.velho('instituicoes')) {
      mostrarStatus('Atualizando peneiras...');
      tarefas.push(PP.peneirasInstituicoes().then((dados) => {
        estado.todas = dados;
        montarFiltros();
        desenharPeneiras({ animar: !cacheInst });
        mostrarStatus(`Atualizado às ${hora(Date.now())}`);
      }).catch((e) => {
        console.warn('API ProAtleta:', e);
        if (cacheInst) {
          mostrarStatus(`Sem conexão. Mostrando dados salvos às ${hora(cacheInst.t)}.`, 'aviso');
        } else {
          mostrarStatus('');
          el.blocoDestaques.hidden = true;
          el.lista.innerHTML = vazio('ri-wifi-off-line', 'Não carregou', 'Confira sua internet e tente de novo.', { acao: 'tentar', texto: 'Tentar de novo' });
        }
      }));
    } else if (cacheInst) {
      mostrarStatus(`Atualizado às ${hora(cacheInst.t)}`);
    }

    if (forcar || PP.cache.velho('render')) {
      el.noticiasStatus.textContent = cacheRender ? 'Buscando notícias novas...' : 'Buscando notícias. Na primeira vez do dia pode levar até 1 minuto.';
      tarefas.push(PP.noticiasRender().then((dados) => {
        desenharNoticias(dados);
        el.noticiasStatus.textContent = '';
      }).catch((e) => {
        console.warn('API Render:', e);
        if (cacheRender) {
          el.noticiasStatus.textContent = `Notícias salvas às ${hora(cacheRender.t)}. O servidor de notícias não respondeu.`;
        } else {
          el.noticiasStatus.textContent = '';
          el.noticias.innerHTML = vazio('ri-cloud-off-line', 'Notícias fora do ar', 'O servidor de notícias não respondeu agora.', { acao: 'tentar', texto: 'Tentar de novo' });
        }
      }));
    } else {
      el.noticiasStatus.textContent = '';
    }

    await Promise.allSettled(tarefas);
    estado.carregando = false;
    el.atualizar.classList.remove('girando');
  }

  // ---------- Ligações ----------
  function ligar() {
    let tempoBusca;
    el.busca.addEventListener('input', () => {
      clearTimeout(tempoBusca);
      tempoBusca = setTimeout(() => { estado.q = el.busca.value; desenharPeneiras(); }, 180);
    });

    el.atualizar.addEventListener('click', () => atualizar({ forcar: true }));

    // Puxar para atualizar (Framework7)
    el.conteudo.addEventListener('ptr:refresh', async () => {
      await atualizar({ forcar: true });
      app.ptr.done(el.conteudo);
    });

    // Um ouvinte só para todos os cartões e botões da tela
    el.pagina.addEventListener('click', (e) => {
      const acao = e.target.closest('[data-acao]');
      if (acao) {
        if (acao.dataset.acao === 'limpar') {
          Object.assign(estado, { esporte: '', cidade: '', q: '' });
          el.busca.value = '';
          montarFiltros();
          desenharPeneiras();
        } else {
          atualizar({ forcar: true });
        }
        return;
      }
      const card = e.target.closest('.pa-card[data-id]');
      if (card) {
        const p = estado.todas.find((x) => String(x.id) === card.dataset.id);
        if (p) abrirDetalhe(p);
        return;
      }
      const link = e.target.closest('.pa-noticia[data-link]');
      if (link) PP.abrirExterno(link.dataset.link);
    });
    el.pagina.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.pa-card')) { e.preventDefault(); e.target.click(); }
    });
  }

  // Voltar para o app depois de um tempo: atualiza o que estiver velho
  document.addEventListener('resume', () => {
    if (el.pagina && document.body.contains(el.pagina)) atualizar();
  }, false);

  function carregarPeneiras() {
    const pagina = document.querySelector('.page[data-name="peneiras"]:not(.page-previous)') || document.querySelector('.page[data-name="peneiras"]');
    if (!pagina || pagina.dataset.iniciada) return;
    pagina.dataset.iniciada = '1';
    pegarElementos(pagina);
    ligar();
    atualizar({ animar: true });
  }

  window.carregarPeneiras = carregarPeneiras;
  window.abrirLink = (event, url) => { event?.preventDefault(); PP.abrirExterno(url); };

  // Se o script chegou depois do pageAfterIn, inicia sozinho
  carregarPeneiras();
})();
