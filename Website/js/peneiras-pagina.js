// Página de peneiras: filtros, destaques, lista com mapa e notícias da API no Render.
(function () {
  const PA = window.ProAtleta;
  const el = {
    busca: document.getElementById('busca'),
    esportes: document.getElementById('filtro-esporte'),
    cidades: document.getElementById('filtro-cidade'),
    destaques: document.getElementById('destaques'),
    blocoDestaques: document.getElementById('bloco-destaques'),
    grade: document.getElementById('grade'),
    contagem: document.getElementById('contagem'),
    noticias: document.getElementById('noticias-grade'),
    noticiasStatus: document.getElementById('noticias-status'),
  };

  const params = new URLSearchParams(location.search);
  const estado = { todas: [], esporte: params.get('esporte') || '', cidade: params.get('cidade') || '', q: params.get('q') || '' };
  el.busca.value = estado.q;

  const normalizar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function pilulas(container, valores, atual, rotuloTodos, aoEscolher) {
    container.innerHTML = [['', rotuloTodos], ...valores.map((v) => [v, v])]
      .map(([v, r]) => `<button type="button" class="pilula" data-valor="${PA.escapar(v)}" aria-pressed="${v === atual}">${PA.escapar(r)}</button>`)
      .join('');
    container.querySelectorAll('.pilula').forEach((b) => b.addEventListener('click', () => {
      container.querySelectorAll('.pilula').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      aoEscolher(b.dataset.valor);
    }));
    PA.ligarBotoes(container);
  }

  function filtrar() {
    const q = normalizar(estado.q.trim());
    return estado.todas.filter((p) => {
      if (estado.esporte && p.esporte !== estado.esporte) return false;
      if (estado.cidade && p.cidade !== estado.cidade) return false;
      if (!q) return true;
      return normalizar([p.titulo, p.instituicao, p.cidade, ...(p.categorias || []), ...(p.posicoes || [])].join(' ')).includes(q);
    });
  }

  function atualizarURL() {
    const u = new URLSearchParams();
    if (estado.esporte) u.set('esporte', estado.esporte);
    if (estado.cidade) u.set('cidade', estado.cidade);
    if (estado.q) u.set('q', estado.q);
    history.replaceState(null, '', u.toString() ? `?${u}` : location.pathname);
  }

  function desenhar() {
    const lista = filtrar();
    const filtrando = estado.esporte || estado.cidade || estado.q.trim();
    atualizarURL();

    // Destaques só sem filtro: são "as melhores" do momento
    const top = [...estado.todas].sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 3);
    el.blocoDestaques.hidden = !!filtrando || !top.length;
    if (!el.blocoDestaques.hidden) {
      el.destaques.innerHTML = top.map((p, i) => PA.cartaoHTML(p, { selo: i === 0 ? 'Mais procurada' : 'Destaque' })).join('');
      PA.ligarCartoes(el.destaques, top);
      PA.ligarCartoesHover(el.destaques);
    }

    el.contagem.textContent = lista.length === 1 ? '1 peneira encontrada' : `${lista.length} peneiras encontradas`;
    if (!lista.length) {
      el.grade.innerHTML = `<div class="estado"><h3>Nenhuma peneira com esses filtros</h3><p>Tente outra cidade ou esporte, ou limpe a busca.</p><button class="btn" type="button" id="limpar">Limpar filtros</button></div>`;
      document.getElementById('limpar').addEventListener('click', limpar);
      PA.ligarBotoes(el.grade);
      return;
    }
    el.grade.innerHTML = lista.map((p) => PA.cartaoHTML(p)).join('');
    PA.ligarCartoes(el.grade, lista);
    PA.ligarCartoesHover(el.grade);
    PA.entrarEmCascata([...el.grade.children].slice(0, 9));
  }

  function limpar() {
    Object.assign(estado, { esporte: '', cidade: '', q: '' });
    el.busca.value = '';
    montarFiltros();
    desenhar();
  }

  function montarFiltros() {
    const unicos = (campo) => [...new Set(estado.todas.map((p) => p[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    pilulas(el.esportes, unicos('esporte'), estado.esporte, 'Todos os esportes', (v) => { estado.esporte = v; desenhar(); });
    pilulas(el.cidades, unicos('cidade'), estado.cidade, 'Todas as cidades', (v) => { estado.cidade = v; desenhar(); });
  }

  let tempoBusca;
  el.busca.addEventListener('input', () => {
    clearTimeout(tempoBusca);
    tempoBusca = setTimeout(() => { estado.q = el.busca.value; desenhar(); }, 180);
  });

  async function carregarPeneiras() {
    el.grade.innerHTML = PA.esqueletos(6);
    el.destaques.innerHTML = PA.esqueletos(3);
    try {
      estado.todas = await PA.peneirasInstituicoes();
      montarFiltros();
      desenhar();
    } catch (e) {
      console.warn(e);
      el.blocoDestaques.hidden = true;
      el.contagem.textContent = '';
      el.grade.innerHTML = `<div class="estado"><h3>Não carregou agora</h3><p>O servidor de peneiras não respondeu. Confira sua internet e tente de novo.</p><button class="btn" type="button" id="tentar">Tentar de novo</button></div>`;
      document.getElementById('tentar').addEventListener('click', carregarPeneiras);
      PA.ligarBotoes(el.grade);
    }
  }

  function desenharNoticias(lista) {
    if (!lista.length) {
      el.noticias.innerHTML = `<div class="estado"><h3>Sem notícias novas</h3><p>Assim que sair uma peneira na imprensa, ela aparece aqui.</p></div>`;
      return;
    }
    el.noticias.innerHTML = lista.map(PA.noticiaHTML).join('');
    PA.ligarCartoesHover(el.noticias);
  }

  async function carregarNoticias() {
    const cache = PA.lerCacheRender();
    if (cache) desenharNoticias(cache.dados);
    else el.noticias.innerHTML = PA.esqueletos(3);
    el.noticiasStatus.textContent = 'Buscando notícias novas. Na primeira vez do dia o servidor pode levar até um minuto para acordar.';
    try {
      const { dados } = await PA.noticiasRender({ forcar: !!cache });
      desenharNoticias(dados);
      el.noticiasStatus.textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`;
    } catch (e) {
      console.warn('API do Render indisponível:', e);
      if (cache) {
        el.noticiasStatus.textContent = `Mostrando as notícias salvas de ${new Date(cache.t).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}. O servidor de notícias não respondeu agora.`;
      } else {
        el.noticiasStatus.textContent = '';
        el.noticias.innerHTML = `<div class="estado"><h3>Notícias fora do ar</h3><p>O servidor de notícias não respondeu. As peneiras publicadas pelas instituições, acima, continuam valendo.</p><button class="btn" type="button" id="tentar-noticias">Tentar de novo</button></div>`;
        document.getElementById('tentar-noticias').addEventListener('click', carregarNoticias);
        PA.ligarBotoes(el.noticias);
      }
    }
  }

  carregarPeneiras();
  carregarNoticias();
})();
