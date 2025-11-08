(function () {
  if (window.__chatAlunoBound__) return;
  window.__chatAlunoBound__ = true;

  function getAny(keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = localStorage.getItem(keys[i]);
      if (!v || String(v).trim() === '') v = sessionStorage.getItem(keys[i]);
      if (v && String(v).trim() !== '') return v;
    }
    return null;
  }

  function parseQuery() {
    var out = {};
    try {
      var q = (location.search || '').replace(/^\?/, '');
      if (!q) return out;
      q.split('&').forEach(function (p) {
        if (!p) return;
        var kv = p.split('=');
        var k = decodeURIComponent(kv[0] || '');
        var v = decodeURIComponent(kv[1] || '');
        if (k) out[k] = v;
      });
    } catch (e) {}
    return out;
  }

  function resolveProfContext(pageDetail) {
    var query = (pageDetail && pageDetail.route && pageDetail.route.query) || parseQuery();

    var id = null;
    var qIdKeys = ['id','profId','professor_id','id_professor','idProfessor','professorId'];
    for (var i = 0; i < qIdKeys.length && !id; i++) if (query && query[qIdKeys[i]] != null) id = parseInt(query[qIdKeys[i]], 10);
    if (!id || isNaN(id)) {
      var raw = getAny(['chatProfessorId','chatWithId','profId','id_professor','idProfessor','professor_id','professorId','idProfPerfil','id']);
      id = raw ? parseInt(raw, 10) : null;
    }

    function pick(qKeys, sKeys, def) {
      var val = null;
      for (var i = 0; !val && i < qKeys.length; i++) if (query && query[qKeys[i]]) val = query[qKeys[i]];
      if (!val) val = getAny(sKeys);
      return val || def || '';
    }

    var nome = pick(['profNome','nome_professor','nomeProfessor','nome'], ['chatProfNome','profNome','nome_professor','nomeProfessor'], 'Professor');
    var email = pick(['profEmail','email_professor','email'], ['chatProfEmail','profEmail','email_professor'], '');
    var foto = pick(['profFoto','foto_prof','fotoProfessor','foto'], ['chatProfFoto','profFoto','foto_prof','fotoProfessor'], 'img/user.jpg');
    var escolinha = pick(['profEscolinha','escolinha','escola','academia'], ['chatProfEscolinha','profEscolinha'], '');

    if (id && !isNaN(id)) {
      localStorage.setItem('chatProfessorId', String(id));
      if (nome) localStorage.setItem('chatProfNome', nome);
      if (email) localStorage.setItem('chatProfEmail', email);
      if (foto) localStorage.setItem('chatProfFoto', foto);
      if (escolinha) localStorage.setItem('chatProfEscolinha', escolinha);
      return { id:id, nome:nome, email:email, foto:foto, escolinha:escolinha };
    }
    return null;
  }

  function boot(el, pageDetail) {
    if (!el) return;

    var form = el.querySelector('#chatForm');
    if (form) {
      form.setAttribute('action', 'javascript:void(0)');
      form.setAttribute('onsubmit', 'return false');
      var btn = form.querySelector('button') || form.querySelector('[type="submit"]');
      if (btn) btn.type = 'button';
    }

    var nomeEl = el.querySelector('#profNome');
    var emailEl = el.querySelector('#profEmail');
    var fotoEl = el.querySelector('#profFoto');
    var escEl = el.querySelector('#profEscolinha');
    var listEl = el.querySelector('#chatMessages');

    function applyProfToUI(ctx) {
      if (nomeEl) nomeEl.textContent = ctx.nome || 'Professor';
      if (emailEl) emailEl.textContent = ctx.email || '';
      if (fotoEl) fotoEl.src = ctx.foto || 'img/user.jpg';
      if (escEl) escEl.textContent = ctx.escolinha || '';
    }

    async function startChatWithContext(ctx) {
      if (!ctx || !ctx.id) return;
      if (el.__switching) return;
      el.__switching = true;

      if (window.ChatCore && ChatCore.teardown) ChatCore.teardown();
      if (listEl) listEl.innerHTML = '<div style="color:#777;font-size:13px;">Carregando conversa...</div>';

      applyProfToUI(ctx);
      el.__chatCtxId = Number(ctx.id);

      var meuId = parseInt(localStorage.getItem('userId') || sessionStorage.getItem('userId'), 10);
      if (!meuId || isNaN(meuId)) { el.__switching = false; return; }

      try {
        if (window.ChatCore && ChatCore.init) {
          await ChatCore.init({ professorId: ctx.id, alunoId: meuId, meuId: meuId, meRole: 'aluno', pageEl: el });
        }
      } finally {
        el.__switching = false;
      }
    }

    function ensureContextAndStart() {
      var ctx = resolveProfContext(pageDetail);
      if (!ctx || !ctx.id) return;
      if (el.__chatCtxId && Number(el.__chatCtxId) === Number(ctx.id)) return;
      startChatWithContext(ctx);
    }

    ensureContextAndStart();

    if (el.__profWatcherInterval) clearInterval(el.__profWatcherInterval);
    el.__profWatcherInterval = setInterval(function () {
      var currentId = el.__chatCtxId || null;
      var rawId = getAny(['chatProfessorId','chatWithId','profId','id_professor','idProfessor','professor_id','professorId','idProfPerfil','id']);
      var newId = rawId ? parseInt(rawId, 10) : null;
      if (newId && Number(newId) !== Number(currentId)) {
        var ctx = resolveProfContext(pageDetail);
        if (ctx && ctx.id) startChatWithContext(ctx);
      }
    }, 600);

    el.__chatCleanup = function () {
      if (el.__profWatcherInterval) { clearInterval(el.__profWatcherInterval); el.__profWatcherInterval = null; }
      if (window.ChatCore && ChatCore.teardown) ChatCore.teardown();
      el.__chatCtxId = null;
      el.__switching = false;
    };
  }

  document.addEventListener('page:init', function (e) {
    var d = e && e.detail;
    if (!d || d.name !== 'chat_aluno') return;
    boot(d.el || e.target, d);
  });
  document.addEventListener('page:reinit', function (e) {
    var d = e && e.detail;
    if (!d || d.name !== 'chat_aluno') return;
    boot(d.el || e.target, d);
  });
  document.addEventListener('page:beforeout', function (e) {
    var d = e && e.detail;
    if (!d || d.name !== 'chat_aluno') return;
    var el = d.el || e.target;
    if (el && el.__chatCleanup) el.__chatCleanup();
  });

  function bootStandalone() {
    var el = document.querySelector('[data-name="chat_aluno"]');
    if (!el) return;
    boot(el, { route: { query: parseQuery() } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootStandalone);
  else setTimeout(bootStandalone, 0);
})();