// Página inicial: destaques, contador ao vivo, prévia do cartão e mapa de exemplo.
(function () {
  const PA = window.ProAtleta;
  const lista = document.getElementById('destaques-lista');
  const previa = document.getElementById('previa-cartao');

  // Cartão de exemplo para a seção de escolinhas quando ainda não há peneiras publicadas
  const EXEMPLO = {
    id: 'exemplo', titulo: 'Peneira Sub-13 e Sub-15', instituicao: 'Nome da sua escolinha', verificada: true,
    esporte: 'Futebol', categorias: ['Sub-13', 'Sub-15'], data_peneira: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    hora: '09:00', endereco: 'Endereço do seu campo', cidade: 'Sua cidade', gratuita: true,
  };

  function mostrarPrevia(p) {
    previa.innerHTML = PA.cartaoHTML(p, { selo: 'Destaque' });
    previa.querySelector('.cartao').removeAttribute('role');
    previa.querySelector('.cartao').removeAttribute('tabindex');
  }

  async function carregar() {
    lista.innerHTML = PA.esqueletos(3);
    try {
      const [destaques, todas] = await Promise.all([
        PA.peneirasInstituicoes({ destaques: 1 }),
        PA.peneirasInstituicoes(),
      ]);

      if (todas.length) {
        const aoVivo = document.getElementById('ao-vivo');
        aoVivo.hidden = false;
        PA.contar(aoVivo.querySelector('[data-total]'), todas.length);
      }

      if (!destaques.length) {
        lista.innerHTML = `<div class="estado"><h3>As primeiras peneiras estão chegando</h3><p>Escolinhas e clubes já podem publicar. Volte em breve ou cadastre a sua instituição.</p><a class="btn" href="instituicoes.html">Publicar uma peneira</a></div>`;
        mostrarPrevia(EXEMPLO);
        PA.ligarBotoes(lista);
        return;
      }

      lista.innerHTML = destaques.map((p, i) => PA.cartaoHTML(p, { selo: i === 0 ? 'Mais procurada' : '' })).join('');
      PA.ligarCartoes(lista, destaques);
      PA.ligarCartoesHover(lista);
      PA.entrarEmCascata([...lista.children]);
      mostrarPrevia({ ...destaques[0], id: 'previa' });

      // Mapa real da peneira mais bem colocada no passo 2
      const mapa = document.getElementById('mapa-exemplo');
      if (mapa) {
        const iframe = document.createElement('iframe');
        iframe.title = `Mapa: ${destaques[0].titulo}`;
        iframe.loading = 'lazy';
        iframe.src = PA.urlMapaEmbed(destaques[0]);
        mapa.appendChild(iframe);
      }
    } catch (e) {
      console.warn('Peneiras indisponíveis:', e);
      lista.innerHTML = `<div class="estado"><h3>Não carregou agora</h3><p>O servidor de peneiras não respondeu. Tente de novo em alguns segundos.</p><button class="btn" type="button" id="tentar-destaques">Tentar de novo</button></div>`;
      document.getElementById('tentar-destaques').addEventListener('click', carregar);
      PA.ligarBotoes(lista);
      mostrarPrevia(EXEMPLO);
    }
  }

  carregar();
})();
