// ...existing code...
(function () {
  'use strict';

  function initPush() {
    try {
      if (!window.FirebasePlugin) return;

      if (window.device && device.platform && device.platform.toLowerCase() !== 'android') {
        // mantemos registro em outras plataformas também
      }

      function postarToken(token) {
        try {
          var usuario_id = parseInt(localStorage.getItem('userId') || '0', 10);
          var rawUserType = String(localStorage.getItem('userType') || '').toLowerCase().trim();
          var tipo_usuario = (rawUserType === 'prof' || rawUserType === 'professor') ? 'professor' : 'aluno';
          if (!usuario_id) return;
          fetch('https://proatleta.site/registrar_dispositivo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuario_id, tipo_usuario: tipo_usuario, token: token, plataforma: 'android' })
          }).catch(function () { /* ignore */ });
        } catch (e) { /* ignore */ }
      }

      try {
        window.FirebasePlugin.getToken(function (token) { postarToken(token); }, function () { /* ignore */ });
        window.FirebasePlugin.onTokenRefresh(function (token) { postarToken(token); });
      } catch (e) { /* ignore */ }

      function normalizeData(data) {
        if (!data || typeof data !== 'object') return {};
        var out = Object.assign({}, data);
        out._event_name = data.nome_evento || data.event_name || data.title || data.nome || '';
        out._event_date = data.data || data.data_inicio || data.date || data.data_treino || data.start || '';
        out._treino_nome = data.nome_treino || data.treino_nome || '';
        return out;
      }

      function isEventType(type) {
        if (!type) return false;
        var t = String(type).toLowerCase();
        return t === 'evento' || t === 'event' || t.indexOf('agenda') !== -1 || t.indexOf('calendar') !== -1 || t.indexOf('evento_novo') !== -1;
      }

      function shouldShowToast(type) {
        if (!type) return true;
        var t = String(type).toLowerCase();
        return t.indexOf('chat') !== -1 || t.indexOf('treino') !== -1 || t === 'novo_treino' || t === 'chat_message';
      }

      function mergeAndSaveNotifications(existing, incoming) {
        existing = Array.isArray(existing) ? existing.slice(0) : [];
        incoming = Array.isArray(incoming) ? incoming.slice(0) : [];
        var map = {};
        existing.forEach(function (it) { if (it && it.id) map[it.id] = it; });
        incoming.forEach(function (it) {
          if (!it) return;
          if (!it.id) it.id = 's' + (it.receivedAt ? new Date(it.receivedAt).getTime() : Date.now()) + Math.floor(Math.random() * 1000);
          if (!map[it.id]) map[it.id] = it;
        });
        var out = Object.keys(map).map(function (k) { return map[k]; });
        out.sort(function (a, b) { return (new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0)); });
        localStorage.setItem('inapp_notifications', JSON.stringify(out));
        try {
          var unread = out.filter(function (x) { return !x.read; }).length;
          localStorage.setItem('inapp_unread_count', String(unread));
        } catch (e) { /* ignore */ }
        return out;
      }

      function syncFromServer() {
        try {
          var usuario_id = parseInt(localStorage.getItem('userId') || '0', 10);
          if (!usuario_id) return;
          var url = 'https://proatleta.site/get_notificacoes_usuario.php';
          fetch(url + '?usuario_id=' + encodeURIComponent(String(usuario_id)), { method: 'GET', credentials: 'omit' })
            .then(function (r) {
              if (!r.ok) throw new Error('status ' + r.status);
              return r.json();
            })
            .then(function (json) {
              if (!json || !Array.isArray(json)) return;
              var normalized = (json || []).map(function (it) {
                var item = Object.assign({}, it);
                try {
                  var raw = item.data || item;
                  if (typeof raw === 'string' && raw.trim() !== '') {
                    try { raw = JSON.parse(raw); } catch (_) { }
                  }
                  var meta = normalizeData(raw || {});
                  item._meta = item._meta || meta;
                  item.data = raw;
                  var t = (item.type || (raw && (raw.type || raw.tipo)) || '').toString().toLowerCase();
                  if (!t) {
                    if (meta._treino_nome || raw && (raw.treino_id || raw.treinoId || raw.nome_treino)) t = 'treino';
                    else if (isEventType(meta._event_name || (raw && (raw.nome_evento || raw.event_name)))) t = 'evento';
                    else if ((raw && (raw.type || raw.tipo))) t = String(raw.type || raw.tipo).toLowerCase();
                  }
                  item.type = t || '';
                } catch (e) { /* ignore */ }
                item.receivedAt = item.receivedAt || new Date().toISOString();
                if (!item.id) item.id = 's' + Date.now() + Math.floor(Math.random() * 1000);
                return item;
              });
              var existing = [];
              try { existing = JSON.parse(localStorage.getItem('inapp_notifications') || '[]'); } catch (e) { existing = []; }
              mergeAndSaveNotifications(existing, normalized);
              try {
                normalized.forEach(function (it) {
                  window.dispatchEvent(new CustomEvent('inapp:notification', { detail: it }));
                });
              } catch (e) { }
            })
            .catch(function () { /* ignore */ });
        } catch (e) { /* ignore */ }
      }

      function tryInitialPluginPayload() {
        try {
          if (window.FirebasePlugin && typeof window.FirebasePlugin.getInitialPushPayload === 'function') {
            window.FirebasePlugin.getInitialPushPayload(function (payload) {
              if (payload) {
                var p = payload;
                if (typeof p === 'string') {
                  try { p = JSON.parse(p); } catch (e) { }
                }
                var notif = {
                  id: 'init' + Date.now(),
                  title: p.title || (p.notification && p.notification.title) || 'ProAtleta',
                  body: p.body || (p.notification && p.notification.body) || '',
                  data: p.data || p,
                  _meta: normalizeData(p.data || p),
                  receivedAt: new Date().toISOString(),
                  read: false,
                  type: (p.data && (p.data.type || p.data.tipo)) || ''
                };
                var existing = [];
                try { existing = JSON.parse(localStorage.getItem('inapp_notifications') || '[]'); } catch (e) { existing = []; }
                mergeAndSaveNotifications(existing, [notif]);

                // salvar payload para notificacao.js consumir no coldstart
                try { localStorage.setItem('inapp_last_initial_payload', JSON.stringify(notif)); } catch (e) {}
                // debug + salvar intent para cold start tap
                try { localStorage.setItem('inapp_debug_last_initial_payload', JSON.stringify(notif)); } catch (e) {}
                try { localStorage.setItem('inapp_last_open_intent', notif.id); } catch (e) {}

                try { window.dispatchEvent(new CustomEvent('inapp:notification', { detail: notif })); } catch (e) { }
              }
            }, function () { /* ignore */ });
          }
        } catch (e) { /* ignore */ }
      }

      document.addEventListener('deviceready', function () {
        try {
          syncFromServer();
          tryInitialPluginPayload();
        } catch (e) { /* ignore */ }
      }, false);

      document.addEventListener('resume', function () {
        try { syncFromServer(); } catch (e) { /* ignore */ }
      }, false);

      window.FirebasePlugin.onMessageReceived(function (msg) {
        try {
          try { localStorage.setItem('inapp_debug_last_raw', JSON.stringify(msg)); } catch (e) {}

          var title = (msg && msg.title) ? msg.title : ((msg && msg.notification && msg.notification.title) ? msg.notification.title : 'ProAtleta');
          var body = (msg && msg.body) ? msg.body : ((msg && msg.notification && msg.notification.body) ? msg.notification.body : '');
          var rawData = (msg && msg.data) ? msg.data : ((msg && msg.message && msg.message.data) ? msg.message.data : {});
          if (typeof rawData === 'string' && rawData.trim() !== '') {
            try { rawData = JSON.parse(rawData); } catch (e) { /* keep string */ }
          }
          var data = normalizeData(rawData);
          var type = (rawData && (rawData.type || rawData.tipo)) ? (rawData.type || rawData.tipo).toString().toLowerCase() : '';

          var notif = {
            id: 'n' + Date.now() + Math.floor(Math.random() * 1000),
            title: String(title || '').trim(),
            body: String(body || '').trim(),
            data: rawData,
            _meta: data,
            receivedAt: new Date().toISOString(),
            read: false,
            type: (function () {
              if (type) return type;
              if (data && data._treino_nome) return 'treino';
              if (rawData && (rawData.treino_id || rawData.treinoId || rawData.nome_treino)) return 'treino';
              if (isEventType(data && data._event_name)) return 'evento';
              return '';
            })()
          };

          var arr = [];
          try { arr = JSON.parse(localStorage.getItem('inapp_notifications') || '[]'); } catch (e) { arr = []; }
          mergeAndSaveNotifications(arr, [notif]);

          // se a notificação foi "tapped" (plugin pode indicar), salvar intent para consumo
          try {
            var wasTapped = false;
            if (typeof msg.tap !== 'undefined') wasTapped = !!msg.tap;
            if (typeof msg.wasTapped !== 'undefined') wasTapped = wasTapped || !!msg.wasTapped;
            if (typeof msg.clicked !== 'undefined') wasTapped = wasTapped || !!msg.clicked;
            if (wasTapped) {
              try { localStorage.setItem('inapp_last_open_intent', notif.id); } catch (e) {}
              try { localStorage.setItem('inapp_last_initial_payload', JSON.stringify(notif)); } catch (e) {}
            }
          } catch (e) { /* ignore */ }

          try { window.dispatchEvent(new CustomEvent('inapp:notification', { detail: notif })); } catch (e) { /* ignore */ }

          if (shouldShowToast(notif.type)) {
            try {
              if (window.app && app.toast) {
                app.toast.create({ text: (notif.title || '') + (notif.body ? (' — ' + notif.body) : ''), closeTimeout: 3000 }).open();
              }
            } catch (e) { /* ignore */ }
          }

        } catch (e) {
          try {
            var errlog = JSON.parse(localStorage.getItem('inapp_debug_errors') || '[]');
            errlog.unshift({ t: new Date().toISOString(), m: String(e && e.message ? e.message : e) });
            if (errlog.length > 200) errlog.length = 200;
            localStorage.setItem('inapp_debug_errors', JSON.stringify(errlog));
          } catch (ignore) { }
        }
      }, function () { /* onMessageReceived erro */ });

    } catch (e) { /* init erro */ }
  }

  document.addEventListener('deviceready', initPush, false);
  window.initPush = initPush;
})();