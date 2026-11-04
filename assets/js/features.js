/* Interactive features: reveal, office picker, chat assistant, accessibility toolbar */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var lang = ((root.getAttribute('lang') || 'en').slice(0, 2).toLowerCase() === 'es') ? 'es' : 'en';

  var T = {
    en: {
      pickTitle: 'Choose your office', close: 'Close',
      call: 'Call', book: 'Schedule Now', directions: 'Get directions',
      chatToggle: 'Ask a question', chatTitle: 'Ask Dentistry & Implants',
      chatGreeting: 'Hi. Ask me anything about Dentistry & Implants and I will answer from this website.',
      chatPlaceholder: 'Type your question', chatLabel: 'Your question', send: 'Send',
      chatFoot: 'Answers come from this website. For anything urgent, please call.',
      thinking: 'Thinking...',
      chatError: 'Sorry, I could not reach our assistant just then. Please call us and we will help.',
      handoff: 'Want us to get back to you? Leave your name and the best number or email.',
      chatClose: 'Close chat',
      chatPick: 'Which location works best for you?', chatPicked: 'The {o} office works best for me.',
      chatOffice: '{o} office: {a}. Call {p} or book online any time. What can I help you with?',
      perMonth: 'a month',
      a11yToggle: 'Accessibility', a11yLarge: 'Larger text', a11yContrast: 'High contrast',
      a11yUnderline: 'Underline links', a11yReset: 'Reset'
    },
    es: {
      pickTitle: 'Elija su consultorio', close: 'Cerrar',
      call: 'Llamar', book: 'Reserve ahora', directions: 'Cómo llegar',
      chatToggle: 'Haga una pregunta', chatTitle: 'Pregunte a Dentistry & Implants',
      chatGreeting: 'Hola. Pregúnteme lo que quiera sobre Dentistry & Implants y le responderé con la información de este sitio.',
      chatPlaceholder: 'Escriba su pregunta', chatLabel: 'Su pregunta', send: 'Enviar',
      chatFoot: 'Las respuestas provienen de este sitio. Para algo urgente, llame por favor.',
      thinking: 'Un momento...',
      chatError: 'Lo sentimos, no pudimos comunicarnos con nuestro asistente en este momento. Llámenos y le ayudaremos.',
      handoff: '¿Quiere que nos comuniquemos con usted? Déjenos su nombre y el mejor número o correo electrónico.',
      chatClose: 'Cerrar chat',
      chatPick: '¿Qué consultorio le queda mejor?', chatPicked: 'Me queda mejor el consultorio de {o}.',
      chatOffice: 'Consultorio de {o}: {a}. Llame al {p} o reserve en línea cuando quiera. ¿En qué le puedo ayudar?',
      perMonth: 'al mes',
      a11yToggle: 'Accesibilidad', a11yLarge: 'Texto más grande', a11yContrast: 'Alto contraste',
      a11yUnderline: 'Subrayar enlaces', a11yReset: 'Restablecer'
    }
  }[lang];

  var OFFICES = [
    { name: 'Mount Kisco, NY', addr: '39 Smith Ave, Rear LL, Mount Kisco, NY 10549', tel: '9146665225', disp: '914-666-5225', book: 'https://www.flexbook.me/mtkisco/googlereserve/1' },
    { name: 'Kent, CT', addr: '70 Maple St, Kent, CT 06757', tel: '8609273577', disp: '860-927-3577', book: 'https://www.flexbook.me/kentdent/googlereserve/1' },
    { name: 'Stamford, CT', addr: '800 E Main St, Stamford, CT 06902', tel: '2038834451', disp: '203-883-4451', book: 'https://www.flexbook.me/bookcsds/googlereserve/1' }
  ];

  var CHAT_ENDPOINT = 'https://pszuxvna48.execute-api.us-east-2.amazonaws.com/site-assistant';
  var CHAT_KEY = '2b768ea6e36846d68158b82da8f5968f';
  var STORE_KEY = 'di-a11y';

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  root.classList.add('di-js');

  /* 1. Scroll reveal */
  function initReveal() {
    var items = doc.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(n) { n.classList.add('di-in'); }
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, show);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  /* 2. Office picker */
  var dialog = null, dialogList = null, lastTrigger = null;

  function buildDialog() {
    dialog = el('dialog', 'di-office-dialog');
    dialog.setAttribute('aria-labelledby', 'di-office-title');
    var head = el('div', 'di-office-head');
    var h = el('h2', 'di-office-title', T.pickTitle);
    h.id = 'di-office-title';
    var x = el('button', 'di-office-close', '×');
    x.type = 'button';
    x.setAttribute('aria-label', T.close);
    x.addEventListener('click', closeDialog);
    head.appendChild(h);
    head.appendChild(x);
    dialogList = el('ul', 'di-office-list');
    dialog.appendChild(head);
    dialog.appendChild(dialogList);
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('close', function () {
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    });
    doc.body.appendChild(dialog);
  }

  function closeDialog() {
    if (!dialog) return;
    if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
  }

  function directionsUrl(o) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Dentistry & Implants, ' + o.addr);
  }

  function openPicker(kind, trigger) {
    if (!dialog) buildDialog();
    lastTrigger = trigger;
    while (dialogList.firstChild) dialogList.removeChild(dialogList.firstChild);
    OFFICES.forEach(function (o) {
      var li = el('li', 'di-office-row');
      var info = el('div');
      info.appendChild(el('span', 'di-office-name', o.name));
      info.appendChild(el('span', 'di-office-addr', o.addr));
      var a = el('a', 'di-office-action');
      if (kind === 'call') {
        a.href = 'tel:' + o.tel;
        a.textContent = T.call + ' ' + o.disp;
      } else if (kind === 'book') {
        a.href = o.book;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = T.book;
      } else {
        a.href = directionsUrl(o);
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = T.directions;
      }
      li.appendChild(info);
      li.appendChild(a);
      dialogList.appendChild(li);
    });
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function initOffices() {
    doc.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-office]') : null;
      if (!t) return;
      var kind = t.getAttribute('data-office');
      if (kind !== 'call' && kind !== 'book' && kind !== 'directions') return;
      e.preventDefault();
      openPicker(kind, t);
    });
  }

  /* 3. Chat assistant */
  var chatPanel = null, chatToggle = null, a11yPanel = null, a11yToggle = null;

  function initChat() {
    var wrap = el('div', 'di-chat di-widget');
    wrap.id = 'di-chat';
    chatPanel = el('div', 'di-chat-panel');
    chatPanel.id = 'di-chat-panel';
    chatPanel.setAttribute('role', 'region');
    chatPanel.setAttribute('aria-label', T.chatTitle);
    chatPanel.hidden = true;

    var head = el('div', 'di-chat-head');
    head.appendChild(el('span', 'di-chat-title', T.chatTitle));
    var close = el('button', 'di-chat-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', T.chatClose);
    head.appendChild(close);

    var log = el('div', 'di-chat-log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    log.appendChild(el('p', 'di-chat-msg di-chat-bot', T.chatGreeting));
    log.appendChild(el('p', 'di-chat-msg di-chat-bot', T.chatPick));
    var picks = el('div', 'di-chat-picks');
    OFFICES.forEach(function (o) {
      var b = el('button', 'di-chat-pick', o.name);
      b.type = 'button';
      b.addEventListener('click', function () { pickOffice(o); });
      picks.appendChild(b);
    });
    log.appendChild(picks);

    var form = el('form', 'di-chat-form');
    var input = el('input');
    input.type = 'text';
    input.id = 'di-chat-input';
    input.placeholder = T.chatPlaceholder;
    input.autocomplete = 'off';
    input.setAttribute('aria-label', T.chatLabel);
    var send = el('button', null, T.send);
    send.type = 'submit';
    form.appendChild(input);
    form.appendChild(send);

    chatPanel.appendChild(head);
    chatPanel.appendChild(log);
    chatPanel.appendChild(form);
    chatPanel.appendChild(el('p', 'di-chat-foot', T.chatFoot));

    chatToggle = el('button', 'di-chat-toggle', T.chatToggle);
    chatToggle.type = 'button';
    chatToggle.setAttribute('aria-controls', 'di-chat-panel');
    chatToggle.setAttribute('aria-expanded', 'false');

    wrap.appendChild(chatPanel);
    wrap.appendChild(chatToggle);
    doc.body.appendChild(wrap);

    var history = [];
    var busy = false;

    function setOpen(state) {
      if (state) {
        chatPanel.hidden = false;
        setA11yOpen(false);
        input.focus();
      } else {
        chatPanel.hidden = true;
      }
      chatToggle.setAttribute('aria-expanded', String(state));
    }
    chatToggle.addEventListener('click', function () { setOpen(chatPanel.hidden); });
    close.addEventListener('click', function () { setOpen(false); chatToggle.focus(); });
    chatPanel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); chatToggle.focus(); }
    });

    function bubble(text, who) {
      var p = el('p', 'di-chat-msg ' + (who === 'user' ? 'di-chat-user' : 'di-chat-bot'), text);
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
      return p;
    }

    function pickOffice(o) {
      if (picks.parentNode) picks.parentNode.removeChild(picks);
      var said = T.chatPicked.replace('{o}', o.name);
      bubble(o.name, 'user');
      var reply = T.chatOffice.replace('{o}', o.name).replace('{a}', o.addr).replace('{p}', o.disp);
      var p = bubble(reply, 'bot');
      var links = el('span', 'di-chat-links');
      var call = el('a', null, T.call + ' ' + o.disp);
      call.href = 'tel:' + o.tel;
      var book = el('a', null, T.book);
      book.href = o.book; book.target = '_blank'; book.rel = 'noopener';
      links.appendChild(call); links.appendChild(book);
      p.appendChild(links);
      history.push({ role: 'user', content: said });
      history.push({ role: 'assistant', content: reply });
      input.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = (input.value || '').trim();
      if (!q || busy) return;
      input.value = '';
      bubble(q, 'user');
      history.push({ role: 'user', content: q });
      busy = true;
      var pending = bubble(T.thinking, 'bot');
      fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_key: CHAT_KEY, messages: history.slice(-10), page: location.pathname })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var answer = (d && d.reply) || T.chatError;
          pending.textContent = answer;
          history.push({ role: 'assistant', content: answer });
          if (d && d.handoff) {
            bubble(T.handoff, 'bot').setAttribute('data-handoff', '1');
          }
        })
        .catch(function () { pending.textContent = T.chatError; })
        .then(function () { busy = false; });
    });
  }

  /* 4. Accessibility toolbar */
  var PREFS = [
    { key: 'large', cls: 'di-large-text', label: 'a11yLarge' },
    { key: 'contrast', cls: 'di-high-contrast', label: 'a11yContrast' },
    { key: 'underline', cls: 'di-underline-links', label: 'a11yUnderline' }
  ];

  function loadPrefs() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var v = raw ? JSON.parse(raw) : {};
      return (v && typeof v === 'object') ? v : {};
    } catch (err) { return {}; }
  }
  function savePrefs(p) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (err) { /* storage blocked */ }
  }

  function setA11yOpen(state) {
    if (!a11yPanel) return;
    a11yPanel.classList.toggle('di-open', state);
    a11yToggle.setAttribute('aria-expanded', String(state));
  }

  function initA11y() {
    var prefs = loadPrefs();
    var wrap = el('div', 'di-a11y di-widget');
    wrap.id = 'di-a11y';
    a11yPanel = el('div', 'di-a11y-panel');
    a11yPanel.id = 'di-a11y-panel';
    a11yPanel.setAttribute('role', 'group');
    a11yPanel.setAttribute('aria-label', T.a11yToggle);
    var buttons = {};

    function apply() {
      PREFS.forEach(function (p) {
        var on = !!prefs[p.key];
        root.classList.toggle(p.cls, on);
        buttons[p.key].setAttribute('aria-pressed', String(on));
      });
    }

    PREFS.forEach(function (p) {
      var b = el('button', null, T[p.label]);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        prefs[p.key] = !prefs[p.key];
        savePrefs(prefs);
        apply();
      });
      buttons[p.key] = b;
      a11yPanel.appendChild(b);
    });
    var reset = el('button', null, T.a11yReset);
    reset.type = 'button';
    reset.addEventListener('click', function () {
      prefs = {};
      savePrefs(prefs);
      apply();
    });
    a11yPanel.appendChild(reset);

    a11yToggle = el('button', null, T.a11yToggle);
    a11yToggle.type = 'button';
    a11yToggle.setAttribute('aria-expanded', 'false');
    a11yToggle.setAttribute('aria-controls', 'di-a11y-panel');
    a11yToggle.addEventListener('click', function () {
      var open = !a11yPanel.classList.contains('di-open');
      if (open && chatPanel && !chatPanel.hidden) {
        chatPanel.hidden = true;
        chatToggle.setAttribute('aria-expanded', 'false');
      }
      setA11yOpen(open);
    });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setA11yOpen(false); a11yToggle.focus(); }
    });

    wrap.appendChild(a11yPanel);
    wrap.appendChild(a11yToggle);
    doc.body.appendChild(wrap);
    apply();
  }

  /* 5. Payment calculator (0% plans): <form data-calc> */
  function initCalc() {
    var forms = doc.querySelectorAll('form[data-calc]');
    Array.prototype.forEach.call(forms, function (f) {
      var out = f.querySelector('output');
      function money(n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      function update() {
        var amt = parseFloat(f.elements.amount.value) || 0;
        var m = f.querySelector('input[name="months"]:checked');
        var months = m ? parseInt(m.value, 10) : 12;
        out.textContent = money(Math.max(amt, 0) / months);
      }
      f.addEventListener('input', update);
      f.addEventListener('change', update);
      f.addEventListener('submit', function (e) { e.preventDefault(); });
      update();
    });
  }

  /* "Which office is closest to me?": rank the offices from a ZIP, town or the visitor's location
     (straight-line miles from Census centroids in assets/data/places.json), then show the real drive
     time on the map. The typed text goes to the map as the starting point, so a full address works too. */
  function initFinder() {
    var F = {
      en: { empty: 'Enter your address, town or ZIP code.', away: '{n} mi away', closest: 'Closest',
            ranked: 'Closest to you: {o}. Miles are a straight line; the map shows your real drive time. Tap another office to compare.',
            unranked: 'The map shows your drive time to {o}. Tap another office to compare.',
            here: 'your location', locating: 'Finding your location...',
            noLocate: 'We could not get your location. Please type your address, town or ZIP code.' },
      es: { empty: 'Escriba su dirección, ciudad o código postal.', away: 'a {n} millas', closest: 'El más cercano',
            ranked: 'El más cercano a usted: {o}. Las millas son en línea recta; el mapa muestra su tiempo real en auto. Toque otro consultorio para comparar.',
            unranked: 'El mapa muestra su tiempo en auto a {o}. Toque otro consultorio para comparar.',
            here: 'su ubicación', locating: 'Buscando su ubicación...',
            noLocate: 'No pudimos obtener su ubicación. Escriba su dirección, ciudad o código postal.' }
    }[lang];
    var STATES = { 'new york': 'ny', 'connecticut': 'ct', 'new jersey': 'nj', 'massachusetts': 'ma', 'pennsylvania': 'pa' };
    Array.prototype.forEach.call(doc.querySelectorAll('[data-finder]'), function (w) {
      var form = w.querySelector('[data-finder-form]');
      var input = form.elements.from;
      var list = w.querySelector('[data-finder-list]');
      var map = w.querySelector('[data-finder-map]');
      var open = w.querySelector('[data-finder-open]');
      var status = w.querySelector('[data-finder-status]');
      var hl = w.getAttribute('data-hl') === 'es' ? '&hl=es' : '';
      var places = null;
      var origin = '';
      function offices() { return Array.prototype.slice.call(list.querySelectorAll('[data-finder-office]')); }
      function current() { return list.querySelector('[aria-pressed="true"]') || offices()[0]; }
      function show(btn) {
        offices().forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        var to = btn.getAttribute('data-addr');
        map.src = origin
          ? 'https://maps.google.com/maps?saddr=' + encodeURIComponent(origin) + '&daddr=' + encodeURIComponent(to) + '&dirflg=d&output=embed' + hl
          : 'https://maps.google.com/maps?q=' + encodeURIComponent(to) + '&z=14&output=embed' + hl;
        open.href = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + encodeURIComponent(to) +
          (origin ? '&origin=' + encodeURIComponent(origin) : '');
      }
      function miles(a, b) {
        var r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
        var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 7917.6 * Math.asin(Math.sqrt(x));
      }
      function lookup(text) {
        if (!places) return null;
        var zips = text.match(/\b\d{5}\b/g);
        if (zips && places.zip[zips[zips.length - 1]]) return places.zip[zips[zips.length - 1]];
        var t = text.toLowerCase().replace(/\b\d{5}(-\d{4})?\b/g, ' ').replace(/\bmt\.?\s/g, 'mount ').replace(/\s+/g, ' ');
        Object.keys(STATES).forEach(function (k) { t = t.replace(new RegExp('\\b' + k + '\\b', 'g'), STATES[k]); });
        var st = (t.match(/\b(ny|ct|nj|ma|pa)\b\s*,?\s*$/) || t.match(/,\s*(ny|ct|nj|ma|pa)\b/) || [])[1];
        var parts = t.split(',').map(function (p) { return p.replace(/\b(ny|ct|nj|ma|pa|usa?)\b/g, '').replace(/[^a-z' .-]/g, '').trim(); })
          .filter(Boolean).reverse();
        var order = st ? [st] : ['ny', 'ct', 'nj', 'ma', 'pa'];
        for (var i = 0; i < parts.length; i++) {
          for (var j = 0; j < order.length; j++) {
            var hit = places.town[parts[i] + '|' + order[j]];
            if (hit) return hit;
          }
        }
        return null;
      }
      function rank(at) {
        offices().forEach(function (b) {
          var d = b.querySelector('[data-finder-dist]');
          var badge = b.querySelector('.di-finder-badge');
          if (badge) badge.parentNode.removeChild(badge);
          if (!at) { d.textContent = ''; return; }
          b._mi = miles(at, [parseFloat(b.getAttribute('data-lat')), parseFloat(b.getAttribute('data-lng'))]);
          d.textContent = F.away.replace('{n}', Math.max(1, Math.round(b._mi)));
        });
        if (!at) return null;
        var sorted = offices().sort(function (a, b) { return a._mi - b._mi; });
        sorted.forEach(function (b) { list.appendChild(b.parentNode); });
        sorted[0].insertBefore(el('span', 'di-finder-badge', F.closest), sorted[0].firstChild);
        return sorted[0];
      }
      function run(at) {
        var best = rank(at);
        var target = best || current();
        show(target);
        status.textContent = (best ? F.ranked : F.unranked).replace('{o}', target.getAttribute('data-name'));
      }
      function withPlaces(fn) {
        if (places) return fn();
        fetch(w.getAttribute('data-places')).then(function (r) { return r.json(); })
          .then(function (d) { places = d; }).catch(function () {}).then(fn);
      }
      list.addEventListener('click', function (e) {
        var b = e.target.closest('[data-finder-office]');
        if (b) show(b);
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input.value.trim();
        if (!text) { status.textContent = F.empty; input.focus(); return; }
        origin = text;
        withPlaces(function () { run(lookup(text)); });
      });
      var locate = w.querySelector('[data-finder-locate]');
      if (!navigator.geolocation) { locate.hidden = true; return; }
      locate.addEventListener('click', function () {
        status.textContent = F.locating;
        navigator.geolocation.getCurrentPosition(function (pos) {
          var at = [pos.coords.latitude, pos.coords.longitude];
          origin = at[0].toFixed(5) + ',' + at[1].toFixed(5);
          input.value = '';
          input.placeholder = F.here;
          run(at);
        }, function () { status.textContent = F.noLocate; }, { timeout: 10000, maximumAge: 600000 });
      });
    });
  }

  function start() {
    initReveal();
    initCalc();
    initFinder();
    initOffices();
    initChat();
    initA11y();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})();
