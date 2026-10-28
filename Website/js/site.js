// Interações e motion do site do ProAtleta.
// GSAP + ScrollTrigger: coreografia de scroll. Motion: micro-interações (botões, cartões, diálogos).
// Lenis: rolagem suave. Tudo desliga com "reduzir movimento" do sistema.
(function () {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const temGSAP = !!(window.gsap && window.ScrollTrigger);
  const comMotion = () => !reduzido.matches;

  if (temGSAP && comMotion()) document.documentElement.classList.add('js-motion');
  if (temGSAP) gsap.registerPlugin(ScrollTrigger);

  // ---------- Rolagem suave ----------
  let lenis = null;
  if (window.Lenis && temGSAP && comMotion()) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ProAtleta = Object.assign(window.ProAtleta || {}, { lenis });

  // Links internos (#secao) respeitando o cabeçalho fixo
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const alvo = document.querySelector(a.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    fecharMenu();
    if (lenis) lenis.scrollTo(alvo, { offset: -70 });
    else alvo.scrollIntoView({ behavior: comMotion() ? 'smooth' : 'auto' });
    history.replaceState(null, '', a.getAttribute('href'));
  });

  // ---------- Cabeçalho ----------
  const topo = document.querySelector('.topo');
  let ultimoY = 0;
  function atualizarTopo() {
    const y = window.scrollY;
    if (!topo) return;
    topo.classList.toggle('topo--solido', y > 40);
    const menuAberto = document.querySelector('.menu-movel.aberto');
    topo.classList.toggle('topo--escondido', !menuAberto && y > 400 && y > ultimoY + 4);
    if (y < ultimoY - 4 || y < 400) topo.classList.remove('topo--escondido');
    ultimoY = y;
  }
  window.addEventListener('scroll', atualizarTopo, { passive: true });
  atualizarTopo();

  // Link ativo conforme a seção visível
  const linksNav = [...document.querySelectorAll('.nav a[href^="#"]')];
  if (linksNav.length) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        linksNav.forEach((l) => l.toggleAttribute('aria-current', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    linksNav.forEach((l) => { const s = document.querySelector(l.getAttribute('href')); if (s) obs.observe(s); });
  }

  // ---------- Menu do celular ----------
  const btnMenu = document.querySelector('.btn-menu');
  const menu = document.getElementById('menu-movel');
  function abrirMenu() {
    menu.classList.add('aberto');
    topo?.classList.add('topo--menu');
    btnMenu.setAttribute('aria-expanded', 'true');
    btnMenu.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    if (temGSAP && comMotion()) {
      gsap.fromTo(menu, { clipPath: 'circle(0% at 92% 4%)' }, { clipPath: 'circle(150% at 92% 4%)', duration: 0.55, ease: 'power3.out' });
      gsap.fromTo(menu.querySelectorAll('li, .btn'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, delay: 0.12, ease: 'power3.out' });
    }
    menu.querySelector('a')?.focus();
  }
  function fecharMenu() {
    if (!menu || !menu.classList.contains('aberto')) return;
    menu.classList.remove('aberto');
    topo?.classList.remove('topo--menu');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
    lenis?.start();
  }
  btnMenu?.addEventListener('click', () => (menu.classList.contains('aberto') ? (fecharMenu(), btnMenu.focus()) : abrirMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.classList.contains('aberto')) { fecharMenu(); btnMenu.focus(); } });
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) fecharMenu(); });

  // ---------- Micro-interações com Motion ----------
  // Botão: antecipação (encolhe), soltura com leve overshoot (energético) e assentamento em spring.
  function ligarBotoes(raiz = document) {
    if (!window.Motion) return;
    raiz.querySelectorAll('.btn, .pilula, .btn-icone, .fechar').forEach((el) => {
      if (el.dataset.motion) return;
      el.dataset.motion = '1';
      el.addEventListener('pointerdown', () => comMotion() && Motion.animate(el, { scale: 0.95 }, { duration: 0.08, easing: 'ease-out' }));
      const soltar = () => comMotion() && Motion.animate(el, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 14 });
      el.addEventListener('pointerup', soltar);
      el.addEventListener('pointerleave', soltar);
    });
  }
  function ligarCartoesHover(raiz = document) {
    if (!window.Motion) return;
    raiz.querySelectorAll('.cartao').forEach((el) => {
      if (el.dataset.motion) return;
      el.dataset.motion = '1';
      el.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && comMotion() && Motion.animate(el, { y: -6 }, { duration: 0.09, easing: 'ease-out' }));
      el.addEventListener('pointerleave', () => comMotion() && Motion.animate(el, { y: 0 }, { duration: 0.2, easing: [0.16, 1, 0.3, 1] }));
    });
  }
  // Entrada em cascata de itens que chegam depois (listas vindas da API)
  function entrarEmCascata(itens) {
    if (!window.Motion || !comMotion() || !itens.length) return;
    Motion.animate(itens, { opacity: [0, 1], y: [24, 0] }, { delay: Motion.stagger(0.05), duration: 0.42, easing: [0.16, 1, 0.3, 1] });
  }
  ligarBotoes();
  ligarCartoesHover();

  // ---------- Coreografia de scroll (GSAP) ----------
  function revelar() {
    if (!temGSAP || !comMotion()) return;
    ScrollTrigger.batch('[data-revelar]', {
      start: 'top 88%',
      once: true,
      onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
  }

  function heroEntrada() {
    const linhas = document.querySelectorAll('.hero__titulo .linha > span');
    if (!linhas.length || !temGSAP || !comMotion()) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(linhas, { yPercent: 110, rotate: 4, duration: 0.9, stagger: 0.09 })
      .from('.hero__texto, .hero__acoes, .hero__ao-vivo', { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
      .from('.hero__palco', { scale: 0.85, opacity: 0, duration: 1, ease: 'expo.out' }, 0.15);
  }

  function faixaComScroll() {
    const trilho = document.querySelector('.faixa__trilho');
    if (!trilho || !temGSAP || !comMotion()) return;
    gsap.fromTo(trilho, { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '.faixa', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  }

  // Linha de cal: desenha conforme o scroll
  function linhasDeCal() {
    document.querySelectorAll('.cal path').forEach((p) => {
      const total = p.getTotalLength();
      p.style.strokeDasharray = total;
      if (!temGSAP || !comMotion()) { p.style.strokeDashoffset = 0; return; }
      p.style.strokeDashoffset = total;
      gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.closest('[data-cal]') || p, start: 'top 75%', end: 'bottom 60%', scrub: 0.8 } });
    });
  }

  function paralaxeTelas() {
    if (!temGSAP || !comMotion()) return;
    gsap.utils.toArray('.telas img').forEach((img, i) => {
      gsap.fromTo(img, { y: 60 + i * 30 }, { y: i === 1 ? -40 : 0, ease: 'none', scrollTrigger: { trigger: '.telas', start: 'top bottom', end: 'center center', scrub: 0.6 } });
    });
  }

  // Números que contam até o valor real
  function contar(el, valor) {
    if (!temGSAP || !comMotion()) { el.textContent = valor; return; }
    const obj = { v: 0 };
    gsap.to(obj, { v: valor, duration: 1.2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } });
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.hidden = false;
    if (window.Motion && comMotion()) Motion.animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.25 });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 4200);
  }

  // ---------- Formulários ----------
  function erroCampo(input, msg) {
    const campo = input.closest('.campo');
    if (!campo) return;
    campo.toggleAttribute('data-erro', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const saida = campo.querySelector('.erro');
    if (saida) saida.textContent = msg || '';
    if (msg && window.Motion && comMotion()) Motion.animate(input, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.32 });
  }
  // Valida ao sair do campo; limpa o erro assim que a pessoa corrige
  function ligarValidacao(form, regras) {
    Object.entries(regras).forEach(([nome, regra]) => {
      const input = form.elements[nome];
      if (!input) return;
      input.addEventListener('blur', () => { if (input.value) erroCampo(input, regra(input.value, form)); });
      input.addEventListener('input', () => { if (input.closest('.campo')?.hasAttribute('data-erro') && !regra(input.value, form)) erroCampo(input, ''); });
    });
    return () => {
      let primeiro = null;
      Object.entries(regras).forEach(([nome, regra]) => {
        const input = form.elements[nome];
        if (!input) return;
        const msg = regra(input.value, form);
        erroCampo(input, msg);
        if (msg && !primeiro) primeiro = input;
      });
      primeiro?.focus();
      return !primeiro;
    };
  }
  function olhosDeSenha(raiz = document) {
    raiz.querySelectorAll('.olho button').forEach((b) => {
      b.addEventListener('click', () => {
        const input = b.parentElement.querySelector('input');
        const mostrar = input.type === 'password';
        input.type = mostrar ? 'text' : 'password';
        b.setAttribute('aria-label', mostrar ? 'Esconder senha' : 'Mostrar senha');
        b.setAttribute('aria-pressed', String(mostrar));
      });
    });
  }
  olhosDeSenha();

  const REGRAS = {
    nome: (v) => (v.trim().length < 3 ? 'Escreva seu nome completo.' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Confira o e-mail, ex.: nome@gmail.com' : ''),
    senha: (v) => (v.length < 8 || !/[A-Z]/.test(v) || !/\d/.test(v) ? 'Use 8 caracteres ou mais, com uma letra maiúscula e um número.' : ''),
    confirmar: (v, f) => (v !== f.elements.senha.value ? 'As senhas não são iguais.' : ''),
    mensagem: (v) => (v.trim().length < 5 ? 'Conte um pouco mais na mensagem.' : ''),
  };

  // Cadastro de atleta (mesmo endpoint usado antes pelo site)
  const dlgCadastro = document.getElementById('dlg-cadastro');
  if (dlgCadastro) {
    document.querySelectorAll('[data-abrir-cadastro]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); fecharMenu(); ProAtleta.abrirModal(dlgCadastro); }));
    dlgCadastro.querySelector('.fechar').addEventListener('click', () => ProAtleta.fecharModal(dlgCadastro));
    dlgCadastro.addEventListener('cancel', (e) => { e.preventDefault(); ProAtleta.fecharModal(dlgCadastro); });
    dlgCadastro.addEventListener('click', (e) => { if (e.target === dlgCadastro) ProAtleta.fecharModal(dlgCadastro); });
    const form = dlgCadastro.querySelector('form');
    const validar = ligarValidacao(form, { nome: REGRAS.nome, email: REGRAS.email, senha: REGRAS.senha, confirmar: REGRAS.confirmar });
    const aviso = form.querySelector('.form-aviso');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validar()) return;
      const btn = form.querySelector('[type=submit]');
      btn.setAttribute('aria-busy', 'true');
      aviso.className = 'form-aviso';
      aviso.textContent = '';
      try {
        const corpo = new URLSearchParams({ nome: form.nome.value.trim(), email: form.email.value.trim(), senha: form.senha.value });
        const resp = await fetch('https://proatleta.site/cadastro_site.php', { method: 'POST', body: corpo });
        const dados = await resp.json();
        if (!dados.success) throw new Error(dados.message || 'Não deu para cadastrar.');
        aviso.className = 'form-aviso form-aviso--ok';
        aviso.textContent = 'Pronto! Enviamos um link para o seu e-mail. Clique nele para ativar a conta e depois entre pelo app.';
        form.reset();
      } catch (err) {
        aviso.className = 'form-aviso form-aviso--erro';
        aviso.textContent = err.message && err.message !== 'Failed to fetch' ? err.message : 'Sem conexão com o servidor agora. Tente de novo em instantes.';
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  }

  // Fale conosco
  const formContato = document.getElementById('form-contato');
  if (formContato) {
    const celular = formContato.elements.celular;
    celular?.addEventListener('input', () => {
      let v = celular.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
      celular.value = v;
    });
    const validar = ligarValidacao(formContato, { nome: REGRAS.nome, email: REGRAS.email, mensagem: REGRAS.mensagem });
    formContato.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validar()) return;
      const btn = formContato.querySelector('[type=submit]');
      btn.setAttribute('aria-busy', 'true');
      try {
        const resp = await fetch('php/enviar.php', { method: 'POST', body: new FormData(formContato) });
        const texto = await resp.text();
        if (!resp.ok) throw new Error();
        toast(texto || 'Mensagem enviada!');
        formContato.reset();
      } catch {
        toast('Não conseguimos enviar agora. Escreva para proatleta1@gmail.com.');
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  }

  // Ano do rodapé
  document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  window.addEventListener('load', () => {
    heroEntrada();
    revelar();
    faixaComScroll();
    linhasDeCal();
    paralaxeTelas();
    if (temGSAP) ScrollTrigger.refresh();
  });

  // Se a pessoa ligar "reduzir movimento" com a página aberta, tudo vai para o estado final.
  reduzido.addEventListener?.('change', () => {
    if (!reduzido.matches || !temGSAP) return;
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.globalTimeline.clear();
    gsap.set('[data-revelar], .hero__titulo .linha > span, .hero__texto, .hero__acoes, .hero__palco', { clearProps: 'all' });
    document.documentElement.classList.remove('js-motion');
    document.querySelectorAll('.cal path').forEach((p) => { p.style.strokeDashoffset = 0; });
    lenis?.destroy();
  });

  Object.assign(window.ProAtleta, { ligarBotoes, ligarCartoesHover, entrarEmCascata, contar, toast, ligarValidacao, erroCampo, olhosDeSenha, REGRAS });
})();
