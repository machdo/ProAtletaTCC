// Micro-interações do app com Motion: botões que afundam e voltam com mola,
// ícone da barra inferior que "pula" ao trocar de aba e entrada em cascata das telas.
// Respeita "reduzir movimento" do sistema.
(function () {
  if (!window.Motion) return;
  const { animate, stagger } = window.Motion;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pode = () => !reduzido.matches;

  const PRESSIONAVEIS = [
    '.btn-home a', '.tab-link', '.escolha-container', '.btn-voltar', '.btn-config', '.btn-noti',
    '.pa-btn', '.pa-card', '.pa-chip', '.pa-icone', '.button', 'button',
  ].join(',');

  let pressionado = null;
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest(PRESSIONAVEIS);
    if (!el || !pode()) return;
    pressionado = el;
    // cartões afundam menos que botões (massa maior)
    animate(el, { scale: el.classList.contains('pa-card') ? 0.98 : 0.94 }, { duration: 0.08, easing: 'ease-out' });
  }, { passive: true });

  function soltar() {
    if (!pressionado) return;
    const el = pressionado;
    pressionado = null;
    animate(el, { scale: 1 }, { type: 'spring', stiffness: 600, damping: 15 });
  }
  document.addEventListener('pointerup', soltar, { passive: true });
  document.addEventListener('pointercancel', soltar, { passive: true });
  document.addEventListener('scroll', soltar, { passive: true, capture: true });

  // Ícone da aba ativa dá um pulinho
  document.addEventListener('click', (e) => {
    const aba = e.target.closest('.tab-link');
    if (!aba || !pode()) return;
    const icone = aba.querySelector('i');
    if (icone) animate(icone, { y: [0, -7, 0], scale: [1, 1.18, 1] }, { duration: 0.42, easing: [0.16, 1, 0.3, 1] });
  });

  // Entrada em cascata dos blocos de cada tela (uma vez por tela)
  function entrada(pagina) {
    if (!pagina || pagina.dataset.entrou || !pode()) return;
    pagina.dataset.entrou = '1';
    const itens = pagina.querySelectorAll('.page-content > .block, .btn-home > a, .pa-anima');
    if (!itens.length) return;
    animate(itens, { opacity: [0, 1], y: [18, 0] }, { delay: stagger(0.05), duration: 0.38, easing: [0.16, 1, 0.3, 1] });
  }
  document.addEventListener('page:afterin', (e) => entrada(e.target.closest ? e.target.closest('.page') || e.target : null));
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => entrada(document.querySelector('.page-current, .page')), 2200));

  // Cascata para listas que chegam depois (usada pelas telas novas)
  window.paCascata = function (itens) {
    if (!pode() || !itens || !itens.length) return;
    animate(itens, { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.045), duration: 0.4, easing: [0.16, 1, 0.3, 1] });
  };
})();
