(function () {
  'use strict';

  if (window.__notificacao_inited) return;
  window.__notificacao_inited = true;

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function loadNotifications() {
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem('inapp_notifications') || '[]'); } catch (e) { arr = []; }
    if (!Array.isArray(arr)) arr = [];
    arr = arr.map(function (it) { if (typeof it.read === 'undefined') it.read = false; return it; });
    return arr;
  }

  // recalcula baseado no array e persiste contador
  function _recalcAndPersistUnread(arr) {
    try {
      var unread = (arr || []).filter(function (x) { return !x.read; }).length;
      localStorage.setItem('inapp_unread_count', String(Math.max(0, parseInt(unread || 0, 10))));
      try { window.dispatchEvent(new CustomEvent('notificacao:updated', { detail: { unread: unread } })); } catch (e) { }
    } catch (e) { /* ignore */ }
    try { updateBadge(); } catch (e) { /* ignore */ }
  }

  function saveNotifications(arr) {
    try { localStorage.setItem('inapp_notifications', JSON.stringify(arr || [])); } catch (e) { /* ignore */ }
    _recalcAndPersistUnread(arr);
  }

  // remove spans antigos e atualiza atributo datacount
  function updateBadge() {
    try {
      var saved = parseInt(localStorage.getItem('inapp_unread_count') || '', 10);
      var unread = (isNaN(saved) ? null : saved);
      if (unread === null) {
        var arrFallback = loadNotifications();
        unread = arrFallback.filter(function (x) { return !x.read; }).length;
      }

      // remover spans criadas por versões antigas
      var oldSpans = document.querySelectorAll('.noti-badge');
      Array.prototype.forEach.call(oldSpans, function (s) { try { s.parentNode && s.parentNode.removeChild(s); } catch (e) { } });

      var btns = document.querySelectorAll('.btn-noti');
      if (!btns || btns.length === 0) return;
      Array.prototype.forEach.call(btns, function (btn) {
        try { btn.setAttribute('datacount', String(unread)); } catch (e) { }
      });
    } catch (e) { /* ignore */ }
  }

  function render() {
    var list = document.getElementById('notifsList');
    if (!list) return;
    list.innerHTML = '';
    var arr = loadNotifications();
    if (!arr.length) {
      // mensagem centralizada com ícone (SVG) para indicar ausência de notificações
      list.innerHTML =
        '<div class="no-notifs">' +
        '<div class="no-notifs-inner">' +
        '<svg class="no-notifs-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M15 17H9a3 3 0 0 1-3-3V11c0-2.76 2.24-5 5-5 .74 0 1.44.16 2.06.46" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M11.99 4c2.76 0 5 2.24 5 5v3c0 .88.36 1.73.98 2.34L19 16H5l.03-.66A3.5 3.5 0 0 0 6 12V9c0-2.76 2.24-5 5-5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M3 3l18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<h3>Nenhuma notificação</h3>' +
        '<p>Você não tem notificações no momento.</p>' +
        '</div>' +
        '</div>';
      return;
    }

    arr.forEach(function (n) {
      var classes = 'block block-strong notification-item';
      if (!n.read) classes += ' unread';
      var div = document.createElement('div');
      div.className = classes;
      div.setAttribute('data-id', String(n.id || ''));

      var when = new Date(n.receivedAt || Date.now()).toLocaleString();
      var extraHtml = '';

      try {
        var raw = n.data || {};
        var meta = n._meta || {};
        var type = (n.type || (raw && (raw.type || raw.tipo)) || '').toString().toLowerCase();

        if (type.indexOf('treino') !== -1 || meta._treino_nome) {
          var treinoNome = meta._treino_nome || raw.nome_treino || raw.treino_nome || n.title;
          extraHtml += '<div style="font-weight:600;margin-bottom:6px;">Treino: ' + escapeHtml(treinoNome) + '</div>';
          if (raw.treino_id || raw.treinoId) extraHtml += '<div style="color:var(--text-muted);margin-bottom:6px;">ID: ' + escapeHtml(String(raw.treino_id || raw.treinoId)) + '</div>';
        } else if (type.indexOf('chat') !== -1 || type === 'chat_message') {
          var who = raw.from_name || raw.from || raw.remetente || '';
          extraHtml += '<div style="font-weight:600;margin-bottom:6px;">Chat com: ' + escapeHtml(who || 'Contato') + '</div>';
        } else if (type.indexOf('evento') !== -1 || meta._event_name || raw.nome_evento || raw.event_name) {
          var evName = meta._event_name || raw.nome_evento || raw.event_name || n.title;
          var evDate = meta._event_date || raw.data || raw.data_inicio || raw.date || raw.start || '';
          extraHtml += '<div style="font-weight:600;margin-bottom:6px;">' + escapeHtml(evName) + '</div>';
          if (evDate) extraHtml += '<div style="color:var(--text-muted);margin-bottom:6px;">' + escapeHtml(String(evDate)) + '</div>';
        }
      } catch (e) { /* ignore */ }

      div.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
        '<strong>' + escapeHtml(n.title || 'Notificação') + '</strong>' +
        '<small style="opacity:.6">' + escapeHtml(when) + '</small>' +
        '</div>' +
        extraHtml +
        '<div style="margin-bottom:8px;">' + escapeHtml(n.body || '') + '</div>' +
        '<div style="display:flex;gap:8px;">' +
        '<button class="button button-small button-outline btn-remove" data-id="' + escapeHtml(String(n.id || '')) + '">Remover</button>' +
        '</div>';
      list.appendChild(div);
    });

    list.querySelectorAll('.btn-remove').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        removeNotification(id);
      });
    });

    // aplicar destaque (se veio de um intent) depois de renderizar
    _applyHighlightFromStorage();
  }

  function _applyHighlightFromStorage() {
    try {
      var hid = localStorage.getItem('inapp_highlight_id');
      if (!hid) return;
      var el = document.querySelector('.notification-item[data-id="' + hid + '"]');
      if (!el) {
        // tentar limpar se não existir
        localStorage.removeItem('inapp_highlight_id');
        return;
      }
      // estilo rápido de destaque
      el.style.boxShadow = '0 0 0 3px rgba(255,160,0,0.15)';
      el.style.transition = 'box-shadow 300ms ease';
      // rolar até o elemento
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { el.scrollIntoView(); }
      // remove o destaque após 4s e limpa flag
      setTimeout(function () {
        try { el.style.boxShadow = ''; } catch (e) { }
        localStorage.removeItem('inapp_highlight_id');
      }, 4000);
    } catch (e) { /* ignore */ }
  }

  function removeNotification(id) {
    var arr = loadNotifications();
    arr = arr.filter(function (x) { return String(x.id) !== String(id); });
    saveNotifications(arr);
    render();
  }

  function clearAll() {
    saveNotifications([]);
    render();
  }

  function markAllRead() {
    var arr = loadNotifications();
    var changed = false;
    arr.forEach(function (x) { if (!x.read) { x.read = true; changed = true; } });
    if (changed) saveNotifications(arr);
  }

  // extrator robusto de tipo/ids — PRIORIDADE: evento -> treino -> chat
  function _extractTypeAndIds(n) {
    var raw = (n && n.data) || {};
    var meta = n && n._meta || {};
    function get(o, keys) {
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (o && (typeof o[k] !== 'undefined') && o[k] !== null) return o[k];
      }
      return null;
    }

    var titleBody = String(n.title || '') + ' ' + String(n.body || '');

    var eventoId = get(raw, ['evento_id', 'eventoId', 'event_id', 'eventId']);
    var eventName = meta._event_name || get(raw, ['nome_evento', 'event_name', 'nomeEvento']);

    var treinoIdCandidate = get(raw, ['treino_id', 'treinoId', 'treino', 'treino_id_str']);
    var treinoNome = get(raw, ['nome_treino', 'treino_nome']) || meta._treino_nome || '';

    var fromId = get(raw, ['from_id', 'fromId', 'professor_id', 'aluno_id', 'remetente']);

    var explicitType = (n.type || get(raw, ['type', 'tipo']) || '').toString().toLowerCase();

    var type = explicitType || '';

    if (!type) {
      if (eventoId || eventName) {
        type = 'evento';
      } else {
        if (/\b(novo\s+)?evento\b/i.test(titleBody) && !/\btreino\b/i.test(titleBody)) {
          type = 'evento';
        } else if (treinoNome && String(treinoNome).trim() !== '') {
          type = 'treino';
        } else if (treinoIdCandidate && String(treinoIdCandidate).trim() !== '') {
          if (/treino/i.test(String(treinoIdCandidate))) type = 'treino';
          else type = '';
        } else if (fromId || /chat|mensagem|mensagens/i.test(titleBody)) {
          type = 'chat';
        } else {
          type = '';
        }
      }
    }

    var treinoId = treinoIdCandidate ? String(treinoIdCandidate) : '';

    return {
      type: String(type || '').toLowerCase(),
      treinoId: treinoId,
      eventoId: eventoId ? String(eventoId) : '',
      fromId: fromId ? String(fromId) : '',
      nomeTreino: String(treinoNome || ''),
      eventName: String(eventName || '')
    };
  }

  // listener robusto para evento inapp:notification — garante persistência e incremento do contador
  window.addEventListener('inapp:notification', function (ev) {
    try {
      var d = ev && ev.detail ? ev.detail : {};
      var arr = loadNotifications();

      var incomingId = (d.id || d.notificationId || d._id || (d.data && (d.data.id || d.data.notificationId)) || Date.now());
      incomingId = String(incomingId);

      var exists = arr.find(function (x) { return String(x.id) === incomingId; });
      if (!exists) {
        var newNot = {
          id: incomingId,
          title: d.title || d.titulo || (d.data && d.data.title) || 'Notificação',
          body: d.body || d.mensagem || (d.data && d.data.body) || '',
          data: d.data || d.payload || {},
          _meta: d._meta || {},
          receivedAt: Date.now(),
          read: false,
          type: (d.type || d.tipo || '').toString()
        };
        arr.unshift(newNot);
        if (arr.length > 300) arr.length = 300;
        saveNotifications(arr);
      } else {
        _recalcAndPersistUnread(arr);
      }

      try { render(); } catch (e) { /* ignore */ }
      try { updateBadge(); } catch (e) { /* ignore */ }

      try {
        if (window.app && app.toast) app.toast.create({ text: (d.title || 'Nova notificação') + ': ' + (d.body || ''), closeTimeout: 2500 }).open();
      } catch (e) { /* ignore */ }
    } catch (e) { /* ignore */ }
  });

  function initPage() {
    render();
    // opcional: não marcar todas como lidas automaticamente
    // markAllRead();
    updateBadge();
  }

  // sincroniza notificações do servidor para garantir lista mesmo sem tap na push
  async function syncFromServerNotifications() {
    try {
      var usuario_id = parseInt(localStorage.getItem('userId') || '0', 10);
      if (!usuario_id) return;
      var url = 'https://proatleta.site/get_notificacoes_usuario.php?usuario_id=' + encodeURIComponent(String(usuario_id));
      var resp = await fetch(url, { method: 'GET', credentials: 'omit' });
      if (!resp || !resp.ok) return;
      var json = await resp.json();
      if (!Array.isArray(json) || json.length === 0) return;

      var existing = loadNotifications();

      json.forEach(function (it) {
        try {
          var item = Object.assign({}, it);
          var raw = item.data || item;
          if (typeof raw === 'string' && raw.trim() !== '') {
            try { raw = JSON.parse(raw); } catch (_) { }
          }
          item.data = raw || {};
          item._meta = item._meta || {
            _treino_nome: (raw && (raw.nome_treino || raw.treino_nome)) || '',
            _event_name: (raw && (raw.nome_evento || raw.event_name)) || ''
          };
          item.receivedAt = item.receivedAt || (item.data && item.data.receivedAt) || new Date().toISOString();
          if (!item.id) item.id = 's' + Date.now() + Math.floor(Math.random() * 1000);
          var exists = existing.some(function (x) { return String(x.id) === String(item.id); });
          if (!exists) {
            existing.unshift({
              id: String(item.id),
              title: item.title || item.titulo || (item.data && item.data.title) || 'Notificação',
              body: item.body || item.mensagem || (item.data && (item.data.body || item.data.mensagem)) || '',
              data: item.data || {},
              _meta: item._meta || {},
              receivedAt: new Date(item.receivedAt).toISOString(),
              read: !!item.read,
              type: (item.type || item.tipo || '').toString()
            });
          }
        } catch (e) { /* ignore item errors */ }
      });

      if (existing.length > 0) {
        if (existing.length > 300) existing.length = 300;
        saveNotifications(existing);
        try { render(); } catch (e) { }
        try { updateBadge(); } catch (e) { }
      }
    } catch (e) { /* ignore network/errors */ }
  }

  // Se app foi aberto via notificação (cold start), mostrar banner e destacar item na listagem
  function _checkInitialIntentAndShow() {
    try {
      // prioridade: payload JSON salvo (push.js pode salvar o payload completo)
      var rawPayload = localStorage.getItem('inapp_last_initial_payload');
      var shownKey = 'inapp_initial_shown_v2';
      if (rawPayload && !localStorage.getItem(shownKey)) {
        try {
          var p = JSON.parse(rawPayload);
          _showInitialNotificationBanner({
            id: p.id || (p.data && p.data.notificationId) || ('ini' + Date.now()),
            title: p.title || p.notification && p.notification.title || p._meta && p._meta._event_name || 'Notificação',
            body: p.body || p.notification && p.notification.body || p._meta && p._meta._event_date || '',
            data: p.data || p
          });
          localStorage.setItem(shownKey, '1');
          // salvar na lista se não existir
          try {
            var arr = loadNotifications();
            var exists = arr.some(function (x) { return String(x.id) === String(p.id || (p.data && p.data.notificationId)); });
            if (!exists) {
              var n = {
                id: p.id || ('init' + Date.now()),
                title: p.title || 'Notificação',
                body: p.body || '',
                data: p.data || {},
                _meta: p._meta || {},
                receivedAt: Date.now(),
                read: false,
                type: (p.type || '').toString()
              };
              arr.unshift(n);
              saveNotifications(arr);
            }
          } catch (e) { }
          return;
        } catch (e) { /* ignore parse errors */ }
      }

      // fallback: id only (push.js pode setar inapp_last_open_intent)
      var lastIntentId = localStorage.getItem('inapp_last_open_intent');
      if (lastIntentId && !localStorage.getItem(shownKey)) {
        var arr2 = loadNotifications();
        var found = arr2.find(function (x) { return String(x.id) === String(lastIntentId); });
        if (found) {
          _showInitialNotificationBanner(found);
          // set highlight para página notificacao
          localStorage.setItem('inapp_highlight_id', String(found.id));
          localStorage.setItem(shownKey, '1');
        }
      }
    } catch (e) { /* ignore */ }
  }

  function _showInitialNotificationBanner(notif) {
    try {
      if (!notif) return;
      if (document.getElementById('initial-notif-banner')) return; // já mostrado

      var container = document.createElement('div');
      container.id = 'initial-notif-banner';
      container.style.position = 'fixed';
      container.style.left = '10px';
      container.style.right = '10px';
      container.style.top = 'calc(env(safe-area-inset-top, 0px) + 70px)';
      container.style.zIndex = 12000;
      container.style.background = 'linear-gradient(90deg, #fff, #fff)';
      container.style.border = '1px solid rgba(0,0,0,0.07)';
      container.style.borderRadius = '10px';
      container.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
      container.style.padding = '12px';
      container.style.display = 'flex';
      container.style.alignItems = 'flex-start';
      container.style.gap = '10px';
      container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
      container.style.maxWidth = '720px';
      container.style.margin = '0 auto';

      var left = document.createElement('div');
      left.style.width = '44px';
      left.style.height = '44px';
      left.style.borderRadius = '8px';
      left.style.background = 'var(--color-primary, #ff3b30)';
      left.style.color = '#fff';
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.justifyContent = 'center';
      left.style.fontWeight = '700';
      left.style.fontSize = '18px';
      left.textContent = (notif.title || '').charAt(0).toUpperCase() || 'N';

      var body = document.createElement('div');
      body.style.flex = '1';
      body.style.minWidth = '0';
      var t = document.createElement('div');
      t.style.fontWeight = '600';
      t.style.marginBottom = '4px';
      t.textContent = notif.title || 'Notificação';
      var b = document.createElement('div');
      b.style.color = 'var(--text-muted,#666)';
      b.style.fontSize = '13px';
      b.style.maxHeight = '56px';
      b.style.overflow = 'hidden';
      b.textContent = notif.body || (notif.data && notif.data.nome_treino) || '';

      body.appendChild(t);
      body.appendChild(b);

      var actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.flexDirection = 'column';
      actions.style.gap = '8px';

      var openBtn = document.createElement('button');
      openBtn.className = 'button';
      openBtn.style.padding = '6px 10px';
      openBtn.textContent = 'Abrir';
      openBtn.addEventListener('click', function () {
        try {
          // marcar id para destaque e navegar para página de notificações
          if (notif.id) localStorage.setItem('inapp_highlight_id', String(notif.id));
          if (window.app && window.app.views && window.app.views.main) {
            try { app.views.main.router.navigate('/notificacao/'); } catch (e) { window.location.hash = '#/notificacao/'; }
          } else {
            window.location = 'notificacao.html';
          }
          _removeInitialBanner();
        } catch (e) { }
      });

      var closeBtn = document.createElement('button');
      closeBtn.className = 'button button-outline';
      closeBtn.style.padding = '6px 10px';
      closeBtn.textContent = 'Fechar';
      closeBtn.addEventListener('click', function () {
        _removeInitialBanner();
      });

      actions.appendChild(openBtn);
      actions.appendChild(closeBtn);

      container.appendChild(left);
      container.appendChild(body);
      container.appendChild(actions);

      document.body.appendChild(container);

      // auto remover após 10s
      setTimeout(function () { _removeInitialBanner(); }, 10000);
    } catch (e) { /* ignore */ }
  }

  function _removeInitialBanner() {
    try {
      var el = document.getElementById('initial-notif-banner');
      if (el) el.parentNode.removeChild(el);
    } catch (e) { }
  }

  // inicializações e hooks
  document.addEventListener('page:init', function (ev) {
    try {
      var page = ev && ev.detail && ev.detail.page;
      var name = page && page.name;
      if (name === 'notificacao' || (ev && ev.target && ev.target.querySelector && ev.target.querySelector('#notifsList'))) {
        // sincroniza ao entrar na página para garantir lista atualizada
        try { syncFromServerNotifications(); } catch (e) { }
        initPage();
      }
      updateBadge();
      _checkInitialIntentAndShow();
    } catch (e) { }
  });

  document.addEventListener('DOMContentLoaded', function () {
    try { updateBadge(); _checkInitialIntentAndShow(); } catch (e) { }
  });

  document.addEventListener('deviceready', function () {
    try {
      // sincroniza ao abrir app (cold start)
      try { syncFromServerNotifications(); } catch (e) { }
      updateBadge();
      _checkInitialIntentAndShow();
      try {
        if (typeof window.initPush === 'function') {
          try { window.initPush(); } catch (_) { }
        }
      } catch (e) { }
    } catch (e) { /* ignore */ }
  }, false);

  document.addEventListener('resume', function () {
    try {
      try { syncFromServerNotifications(); } catch (e) { }
      updateBadge(); _checkInitialIntentAndShow();
    } catch (e) { /* ignore */ }
  }, false);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      try { updateBadge(); _checkInitialIntentAndShow(); } catch (e) { /* ignore */ }
    }
  });

  // expor API
  window.notificacao = {
    render: render,
    loadNotifications: loadNotifications,
    clearAll: clearAll,
    markAllRead: markAllRead,
    syncFromServerNotifications: syncFromServerNotifications
  };

})();