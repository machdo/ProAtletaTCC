// Dados de peneiras do ProAtleta: busca nas duas fontes, normaliza e desenha os cartões.
// Fontes:
//  1. API do ProAtleta (peneiras publicadas por escolinhas, clubes e instituições)  -> api/peneiras.php
//  2. API no Render (notícias de peneiras coletadas da internet)                   -> /peneiras
(function () {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);

  const CONFIG = {
    api: window.PROATLETA_API || (local ? 'http://localhost:8000' : 'https://proatleta.site/api'),
    render: 'https://api-proatleta.onrender.com/peneiras',
    cacheRenderMin: 30,
  };

  // Ícones monoline (stroke 1.75, currentColor)
  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONES = {
    calendario: svg('<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
    relogio: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    pino: svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    mapa: svg('<path d="m9 4-6 2.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>'),
    seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    externo: svg('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    fechar: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    verificada: svg('<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
    grupo: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>'),
    check: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'),
    lixeira: svg('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'),
    olho: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    busca: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    instagram: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
    email: svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/>'),
    noticia: svg('<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5"/>'),
  };

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function lerData(valor) {
    if (!valor) return null;
    const d = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(valor + 'T12:00:00') : new Date(valor);
    return isNaN(d) ? null : d;
  }

  function formatarData(valor) {
    const d = lerData(valor);
    if (!d) return { dia: '--', mes: '', extenso: 'Data a confirmar' };
    const semana = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    return {
      dia: String(d.getDate()).padStart(2, '0'),
      mes: MESES[d.getMonth()],
      extenso: `${semana}, ${d.getDate()} de ${d.toLocaleDateString('pt-BR', { month: 'long' })}`,
      curta: d.toLocaleDateString('pt-BR'),
    };
  }

  function diasAte(valor) {
    const d = lerData(valor);
    if (!d) return null;
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    return Math.round((d - hoje) / 86400000);
  }

  function quandoTexto(valor) {
    const dias = diasAte(valor);
    if (dias === null) return '';
    if (dias === 0) return 'É hoje';
    if (dias === 1) return 'É amanhã';
    if (dias > 1 && dias <= 30) return `Faltam ${dias} dias`;
    return '';
  }

  function enderecoCompleto(p) {
    return [p.endereco, p.cidade, p.estado].filter(Boolean).join(', ');
  }

  // Google Maps sem chave de API: o embed por busca funciona em qualquer site.
  function urlMapaEmbed(p) {
    const q = p.latitude && p.longitude ? `${p.latitude},${p.longitude}` : enderecoCompleto(p);
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
  }
  function urlComoChegar(p) {
    const destino = p.latitude && p.longitude ? `${p.latitude},${p.longitude}` : enderecoCompleto(p);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
  }

  async function buscarJSON(url, { tempo = 15000, tentativas = 1, ...opcoes } = {}) {
    let ultimoErro;
    for (let i = 0; i <= tentativas; i++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), tempo);
      try {
        const resp = await fetch(url, { ...opcoes, signal: ctrl.signal });
        const dados = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          const erro = new Error(dados.message || `Erro ${resp.status}`);
          erro.status = resp.status;
          erro.dados = dados;
          throw erro;
        }
        return dados;
      } catch (e) {
        ultimoErro = e;
        // Erros de validação (4xx) não melhoram tentando de novo.
        if (e.status && e.status < 500) break;
        if (i < tentativas) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      } finally {
        clearTimeout(timer);
      }
    }
    throw ultimoErro;
  }

  // --- Fonte 1: peneiras das instituições ---
  async function peneirasInstituicoes(filtros = {}) {
    const qs = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();
    const dados = await buscarJSON(`${CONFIG.api}/peneiras.php${qs ? '?' + qs : ''}`, { tempo: 12000, tentativas: 1 });
    return (dados.peneiras || []).map((p) => ({ ...p, origem: 'instituicao' }));
  }

  // --- Fonte 2: notícias da API no Render ---
  // O Render "dorme" quando ninguém usa; a primeira resposta pode levar quase um minuto.
  // Por isso: mostramos o cache na hora e atualizamos por trás (stale-while-revalidate).
  function lerCacheRender() {
    try {
      const salvo = JSON.parse(localStorage.getItem('pa:render') || 'null');
      return salvo && Array.isArray(salvo.dados) ? salvo : null;
    } catch { return null; }
  }

  function normalizarNoticia(n, i) {
    return {
      id: n.id || n._id || `r${i}`,
      origem: 'render',
      titulo: n.titulo || n.title || 'Peneira',
      resumo: n.resumo || n.descricao || n.description || '',
      data: n.dataPublicacao || n.data || n.date || null,
      link: n.link || n.url || null,
    };
  }

  async function noticiasRender({ forcar = false } = {}) {
    const cache = lerCacheRender();
    const fresco = cache && Date.now() - cache.t < CONFIG.cacheRenderMin * 60000;
    if (cache && fresco && !forcar) return { dados: cache.dados, doCache: true };

    const bruto = await buscarJSON(CONFIG.render, { tempo: 60000, tentativas: 1 });
    const lista = Array.isArray(bruto) ? bruto : bruto.peneiras || bruto.data || [];
    const dados = lista.map(normalizarNoticia);
    try { localStorage.setItem('pa:render', JSON.stringify({ t: Date.now(), dados })); } catch { /* sem espaço ou modo privado */ }
    return { dados, doCache: false };
  }

  // --- Desenho ---
  function cartaoHTML(p, { selo = '' } = {}) {
    const data = formatarData(p.data_peneira);
    const quando = quandoTexto(p.data_peneira);
    const cats = (p.categorias || []).slice(0, 4).map((c) => `<span class="chip">${escapar(c)}</span>`).join('');
    return `
      <article class="cartao" data-id="${p.id}" tabindex="0" role="button" aria-label="Ver detalhes: ${escapar(p.titulo)}">
        ${selo ? `<span class="cartao__selo rotulo">${escapar(selo)}</span>` : ''}
        <div class="cartao__topo">
          <div class="cartao__data" aria-hidden="true"><span class="dia">${data.dia}</span><span class="mes">${data.mes}</span></div>
          <div>
            <h3 class="cartao__titulo">${escapar(p.titulo)}</h3>
            <p class="cartao__org">${escapar(p.instituicao)}${p.verificada ? `<span class="verificada" title="Instituição verificada">${ICONES.verificada}<span class="visualmente-oculto">verificada</span></span>` : ''}</p>
          </div>
        </div>
        <div class="chips"><span class="chip chip--escuro">${escapar(p.esporte)}</span>${cats}</div>
        <ul class="cartao__info">
          <li>${ICONES.calendario}<span>${escapar(data.extenso)}${p.hora ? ` às ${escapar(p.hora)}` : ''}</span></li>
          <li>${ICONES.pino}<span>${escapar(p.cidade)} · ${escapar(p.endereco)}</span></li>
        </ul>
        <div class="cartao__rodape">
          <span class="rotulo">${escapar(quando || (p.gratuita ? 'Gratuita' : ''))}</span>
          <span class="cartao__mapa">${ICONES.mapa}Ver no mapa</span>
        </div>
      </article>`;
  }

  function noticiaHTML(n) {
    const data = formatarData(n.data);
    return `
      <article class="cartao cartao-noticia">
        <div class="cartao__topo">
          <div class="cartao__data" aria-hidden="true"><span class="dia">${data.dia}</span><span class="mes">${data.mes}</span></div>
          <h3 class="cartao__titulo">${escapar(n.titulo)}</h3>
        </div>
        <p>${escapar(n.resumo)}</p>
        ${n.link ? `<div class="cartao__rodape"><span class="rotulo">Notícia</span><a class="link-seta" href="${escapar(n.link)}" target="_blank" rel="noopener noreferrer">Ler mais ${ICONES.externo}</a></div>` : ''}
      </article>`;
  }

  function esqueletos(qtd) {
    return Array.from({ length: qtd }, () => '<div class="esqueleto" aria-hidden="true"></div>').join('');
  }

  // Diálogo de detalhes com o mapa do local
  function abrirDetalhe(p) {
    let dlg = document.getElementById('dlg-peneira');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'dlg-peneira';
      dlg.className = 'modal';
      dlg.setAttribute('aria-labelledby', 'dlg-peneira-titulo');
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => { if (e.target === dlg) fecharModal(dlg); });
      dlg.addEventListener('cancel', (e) => { e.preventDefault(); fecharModal(dlg); });
    }
    const data = formatarData(p.data_peneira);
    dlg.innerHTML = `
      <div class="modal__cabeca">
        <div>
          <p class="rotulo" style="color:var(--laranja-forte)">${escapar(p.esporte)} · ${escapar(p.instituicao)}</p>
          <h2 id="dlg-peneira-titulo">${escapar(p.titulo)}</h2>
        </div>
        <button class="fechar" type="button" aria-label="Fechar">${ICONES.fechar}</button>
      </div>
      <div class="modal__corpo">
        <div class="mapa">
          <div class="mapa-fundo">${ICONES.pino}<span>${escapar(enderecoCompleto(p))}</span></div>
          <iframe title="Mapa do local da peneira" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${urlMapaEmbed(p)}"></iframe>
        </div>
        <dl class="detalhes">
          <div><dt>Quando</dt><dd>${escapar(data.extenso)}${p.hora ? ` às ${escapar(p.hora)}` : ''}</dd></div>
          <div><dt>Onde</dt><dd>${escapar(enderecoCompleto(p))}</dd></div>
          ${(p.categorias || []).length ? `<div><dt>Categorias</dt><dd>${p.categorias.map(escapar).join(', ')}</dd></div>` : ''}
          ${(p.posicoes || []).length ? `<div><dt>Posições</dt><dd>${p.posicoes.map(escapar).join(', ')}</dd></div>` : ''}
          ${p.vagas ? `<div><dt>Vagas</dt><dd>${p.vagas}</dd></div>` : ''}
          <div><dt>Inscrição</dt><dd>${p.gratuita ? 'Gratuita' : 'Com taxa, veja com a instituição'}</dd></div>
        </dl>
        ${p.descricao ? `<p style="margin-bottom:var(--e5)">${escapar(p.descricao)}</p>` : ''}
        <div class="modal__acoes">
          <a class="btn" href="${urlComoChegar(p)}" target="_blank" rel="noopener noreferrer">${ICONES.pino}Como chegar</a>
          ${p.link_inscricao ? `<a class="btn btn--escuro" href="${escapar(p.link_inscricao)}" target="_blank" rel="noopener noreferrer">Fazer inscrição ${ICONES.externo}</a>` : ''}
        </div>
      </div>`;
    dlg.querySelector('.fechar').addEventListener('click', () => fecharModal(dlg));
    abrirModal(dlg);
  }

  // Abertura e fechamento com Motion (spring curta); sem Motion ou com movimento reduzido, instantâneo.
  function semMovimento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.Motion;
  }
  function abrirModal(dlg) {
    dlg.showModal();
    if (semMovimento()) return;
    Motion.animate(dlg, { opacity: [0, 1], transform: ['translateY(24px) scale(.97)', 'translateY(0) scale(1)'] }, { duration: 0.32, easing: [0.16, 1, 0.3, 1] });
  }
  function fecharModal(dlg) {
    if (semMovimento()) return dlg.close();
    Motion.animate(dlg, { opacity: [1, 0], transform: ['translateY(0) scale(1)', 'translateY(12px) scale(.98)'] }, { duration: 0.18, easing: [0.7, 0, 0.84, 0] })
      .then(() => dlg.close());
  }

  // Liga cartões a abrir o detalhe (clique e Enter/Espaço)
  function ligarCartoes(container, lista) {
    const porId = new Map(lista.map((p) => [String(p.id), p]));
    container.querySelectorAll('.cartao[data-id]').forEach((el) => {
      const abrir = () => { const p = porId.get(el.dataset.id); if (p) abrirDetalhe(p); };
      el.addEventListener('click', abrir);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } });
    });
  }

  window.ProAtleta = Object.assign(window.ProAtleta || {}, {
    CONFIG, ICONES, escapar, formatarData, diasAte, quandoTexto, enderecoCompleto, urlMapaEmbed, urlComoChegar,
    buscarJSON, peneirasInstituicoes, noticiasRender, lerCacheRender, cartaoHTML, noticiaHTML, esqueletos,
    abrirDetalhe, abrirModal, fecharModal, ligarCartoes,
  });
})();
