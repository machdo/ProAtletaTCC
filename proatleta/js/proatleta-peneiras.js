// Camada de dados de peneiras do app ProAtleta (carregada uma vez no index.html).
// Junta duas fontes:
//  1. API do ProAtleta: peneiras publicadas por escolinhas, clubes e instituições (api/peneiras.php)
//  2. API no Render: notícias de peneiras coletadas da internet (/peneiras)
// As duas ficam em cache no aparelho: a tela abre na hora com o que já tem e atualiza por trás.
(function () {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);

  const CONFIG = {
    api: window.PROATLETA_API || (local ? 'http://localhost:8000' : 'https://proatleta.site/api'),
    render: 'https://api-proatleta.onrender.com/peneiras',
    // Depois desse tempo o cache é considerado velho e a tela busca de novo sozinha
    validadeMin: { instituicoes: 5, render: 30 },
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
    if (!d) return { dia: '--', mes: '', extenso: 'Data a confirmar', curta: '' };
    return {
      dia: String(d.getDate()).padStart(2, '0'),
      mes: MESES[d.getMonth()],
      extenso: `${d.toLocaleDateString('pt-BR', { weekday: 'long' })}, ${d.getDate()} de ${d.toLocaleDateString('pt-BR', { month: 'long' })}`,
      curta: d.toLocaleDateString('pt-BR'),
    };
  }

  function quandoTexto(valor) {
    const d = lerData(valor);
    if (!d) return '';
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    const dias = Math.round((d - hoje) / 86400000);
    if (dias === 0) return 'É hoje';
    if (dias === 1) return 'É amanhã';
    if (dias > 1 && dias <= 30) return `Faltam ${dias} dias`;
    return '';
  }

  const enderecoCompleto = (p) => [p.endereco, p.cidade, p.estado].filter(Boolean).join(', ');
  const destinoMapa = (p) => (p.latitude && p.longitude ? `${p.latitude},${p.longitude}` : enderecoCompleto(p));
  const urlMapaEmbed = (p) => `https://www.google.com/maps?q=${encodeURIComponent(destinoMapa(p))}&z=15&output=embed`;
  const urlComoChegar = (p) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinoMapa(p))}`;

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
        if (e.status && e.status < 500) break; // erro de validação não melhora tentando de novo
        if (i < tentativas) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      } finally {
        clearTimeout(timer);
      }
    }
    if (ultimoErro && ultimoErro.name === 'AbortError') ultimoErro.message = 'O servidor demorou para responder.';
    throw ultimoErro;
  }

  // --- Cache no aparelho ---
  const cache = {
    ler(chave) {
      try {
        const salvo = JSON.parse(localStorage.getItem('pa:' + chave) || 'null');
        return salvo && Array.isArray(salvo.dados) ? salvo : null;
      } catch { return null; }
    },
    salvar(chave, dados) {
      try { localStorage.setItem('pa:' + chave, JSON.stringify({ t: Date.now(), dados })); } catch { /* sem espaço */ }
    },
    velho(chave) {
      const salvo = cache.ler(chave);
      return !salvo || Date.now() - salvo.t > CONFIG.validadeMin[chave] * 60000;
    },
  };

  async function peneirasInstituicoes() {
    const r = await buscarJSON(`${CONFIG.api}/peneiras.php`, { tempo: 12000, tentativas: 1 });
    const dados = (r.peneiras || []).map((p) => ({ ...p, origem: 'instituicao' }));
    cache.salvar('instituicoes', dados);
    return dados;
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

  // O Render "dorme" sem uso e pode levar quase um minuto para acordar: tempo limite longo.
  async function noticiasRender() {
    const bruto = await buscarJSON(CONFIG.render, { tempo: 60000, tentativas: 1 });
    const lista = Array.isArray(bruto) ? bruto : bruto.peneiras || bruto.data || [];
    const dados = lista.map(normalizarNoticia).sort((a, b) => (lerData(b.data) || 0) - (lerData(a.data) || 0));
    cache.salvar('render', dados);
    return dados;
  }

  // Abre link fora do app (Cordova InAppBrowser quando existir, navegador no resto)
  function abrirExterno(url) {
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;
    if (window.cordova && window.cordova.InAppBrowser) window.cordova.InAppBrowser.open(url, '_system', 'location=yes');
    else window.open(url, '_blank', 'noopener');
  }

  window.ProAtletaPeneiras = {
    CONFIG, cache, escapar, formatarData, quandoTexto, enderecoCompleto, urlMapaEmbed, urlComoChegar,
    buscarJSON, peneirasInstituicoes, noticiasRender, abrirExterno,
  };
})();
