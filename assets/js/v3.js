/* v3 "silver glass" behaviour. Loaded (defer) from the end of the v3 fragment, after site.js, features.js and motion.js.
   Progressive enhancement only; honours prefers-reduced-motion.
   Liquid Glass (per the v3 handoff): glass lives only on floating controls. One pointermove listener sets --mx / --my (cursor light)
   and --ang (rim highlight direction) on the closest glass control; CSS does the rest. No idle animation on glass.
   Public API: window.v3 = { openChat, REDDIT_URL }. */
(function () {
  'use strict';

  /* Dr. Kwon's Reddit profile. Leave empty until the account exists: every [data-reddit] slot stays hidden. */
  var REDDIT_URL = '';

  var doc = document, root = doc.documentElement;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCRIPT = (doc.currentScript && doc.currentScript.src) || '';
  var EMAIL = 'nyctdentistryimplants@gmail.com';


  var SERVICES = [
    ['dental-implants', 'Dental Implants', 'ba-4-after.webp'],
    ['single-tooth-implants', 'Single Implants', 'ba-4-composite.webp'],
    ['same-day-implants', 'Same-Day Implants', 'ba-8-after.webp'],
    ['full-arch-implants', 'All-on-X', 'xray-1-after.webp'],
    ['cosmetic-dentistry', 'Smile Makeovers', 'ba-5-after.webp'],
    ['porcelain-veneers', 'Veneers', 'ba-7-after.webp'],
    ['dental-crowns', 'Crowns', 'ba-3-after.webp'],
    ['restorative-dentistry', 'Restorative', null],
    ['invisalign', 'Clear Aligners', null],
    ['teeth-whitening', 'Whitening', 'ba-6-after.webp'],
    ['preventive-care', 'Cleanings', 'ba-1-after.webp'],
    ['root-canal-treatment', 'Root Canals', null],
    ['tooth-extractions', 'Extractions', null],
    ['periodontal-care', 'Gum Care', null],
    ['dentures', 'Dentures', null],
    ['emergency-dentistry', 'Emergency Care', null]
  ];
  /* Spanish menu labels (the service pages themselves are English, so links stay the same) */
  var SERVICES_ES = {
    'dental-implants': 'Implantes dentales', 'single-tooth-implants': 'Implantes unitarios', 'same-day-implants': 'Implantes en el mismo día',
    'full-arch-implants': 'All-on-X', 'cosmetic-dentistry': 'Rediseño de sonrisa', 'porcelain-veneers': 'Carillas', 'dental-crowns': 'Coronas',
    'restorative-dentistry': 'Restauraciones', 'invisalign': 'Alineadores transparentes', 'teeth-whitening': 'Blanqueamiento', 'preventive-care': 'Limpiezas',
    'root-canal-treatment': 'Conductos', 'tooth-extractions': 'Extracciones', 'periodontal-care': 'Encías', 'dentures': 'Dentaduras', 'emergency-dentistry': 'Emergencias'
  };
  var TOOTH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M7 3.2C4.6 3.2 3 5.1 3 7.6c0 2 .8 3.5 1.5 5 .6 1.4.9 3 1.2 4.8.3 1.8.9 3.4 1.9 3.4 1.3 0 1.6-2 2-3.8.3-1.3.8-2.4 2.4-2.4s2.1 1.1 2.4 2.4c.4 1.8.7 3.8 2 3.8 1 0 1.6-1.6 1.9-3.4.3-1.8.6-3.4 1.2-4.8.7-1.5 1.5-3 1.5-5 0-2.5-1.6-4.4-4-4.4-2 0-3 1-5 1s-3-1-5-1z"/></svg>';

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function store(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  function recall(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function img(name) { try { return new URL('../img/' + name, SCRIPT || location.href).href; } catch (e) { return 'assets/img/' + name; } }

  root.classList.add('v3-js');
  /* Scroll-driven animations (Chrome/Edge 115+, Safari 26+): the browser runs the scroll-linked motion on the compositor, locked to the
     scroll itself, so nothing lags or jitters. JS only measures the start/end points (on load and resize). Other browsers use the JS path. */
  var SDA = !RM && !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()') && CSS.supports('animation-range: 0px 100px'));
  if (SDA) root.classList.add('v3-sda');
  function docTop(n) { var y = 0; while (n) { y += n.offsetTop; n = n.offsetParent; } return y; }
  function docLeft(n) { var x = 0; while (n) { x += n.offsetLeft; n = n.offsetParent; } return x; }

  /* Language root prefix taken from the header's Services link ("services.html" or "../services.html"). */
  var svcLink = $all('#primary-nav a').filter(function (a) { return /(^|\/)services\.html$/.test(a.getAttribute('href') || ''); })[0] || null;
  var LROOT = svcLink ? svcLink.getAttribute('href').replace(/services\.html$/, '') : '';
  /* Site root: service detail pages and the v3 home exist only in English, so Spanish pages (one folder down) reach them through ../ */
  var ES = (root.getAttribute('lang') || '').slice(0, 2) === 'es';
  var SROOT = LROOT + (ES ? '../' : '');

  /* ---------- 1. Header: v2 links + services flyout ---------- */
  function iconList() {
    var ul = el('ul', 'v3-icons');
    SERVICES.forEach(function (s, i) {
      var li = el('li');
      li.style.setProperty('--v3-i', String(i));
      var a = el('a');
      a.href = SROOT + 'services/' + s[0] + '.html';
      var ic = el('span', 'v3-icon-img');
      ic.setAttribute('aria-hidden', 'true');
      if (s[2]) {
        var im = el('img');
        im.src = img(s[2]); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
        ic.appendChild(im);
      } else {
        ic.innerHTML = TOOTH;
      }
      a.appendChild(ic);
      a.appendChild(el('span', 'v3-icon-label', (ES && SERVICES_ES[s[0]]) || s[1]));
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }
  function footRow() {
    var foot = el('div', 'v3-flyout-foot');
    var all = el('a', 'v3-link');
    all.href = LROOT + 'services.html';
    all.appendChild(el('span', null, ES ? 'Todos los servicios' : 'All services'));
    var book = el('a', 'v3-flyout-cta', ES ? 'Reserve ahora' : 'Schedule Now');
    book.href = LROOT + 'locations.html';
    book.setAttribute('data-office', 'book');
    foot.appendChild(all); foot.appendChild(book);
    return foot;
  }

  function initHeader() {
    var brand = $('.site-header .brand');
    if (brand && !ES) brand.setAttribute('href', LROOT + 'index.html');
    var fbrand = $('.site-footer .footer-brand');
    if (fbrand && !ES) fbrand.setAttribute('href', LROOT + 'index.html');
    initMenuLang();
    if (!svcLink) return;

    svcLink.setAttribute('href', LROOT + 'services.html');
    if (/v3-services\.html$/.test(location.pathname)) svcLink.setAttribute('aria-current', 'page');
    svcLink.classList.add('v3-has-flyout');
    svcLink.setAttribute('aria-haspopup', 'true');
    svcLink.setAttribute('aria-expanded', 'false');

    var header = $('.site-header');
    var flyout = el('div', 'v3-flyout');
    flyout.id = 'v3-flyout';
    flyout.setAttribute('role', 'region');
    flyout.setAttribute('aria-label', ES ? 'Servicios' : 'Services');
    var inner = el('div', 'v3-flyout-inner');
    inner.appendChild(el('p', 'v3-flyout-head', ES ? 'Servicios (páginas en inglés)' : 'Services'));
    inner.appendChild(iconList());
    inner.appendChild(footRow());
    flyout.appendChild(inner);
    header.appendChild(flyout);

    var scrim = el('div', 'v3-scrim');
    scrim.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(scrim);

    var sheet = el('div', 'v3-sheet');
    sheet.id = 'v3-sheet';
    sheet.appendChild(iconList());
    sheet.appendChild(footRow());
    svcLink.insertAdjacentElement('afterend', sheet);

    var mq = window.matchMedia('(max-width: 1080px)');
    var timer = null;
    function phone() { return mq.matches; }
    function isOpen() { return phone() ? sheet.classList.contains('is-open') : flyout.classList.contains('is-open'); }
    function setOpen(state, focusFirst) {
      clearTimeout(timer);
      var panel = phone() ? sheet : flyout;
      svcLink.setAttribute('aria-controls', panel.id);
      flyout.classList.toggle('is-open', state && !phone());
      scrim.classList.toggle('is-open', state && !phone());
      sheet.classList.toggle('is-open', state && phone());
      svcLink.setAttribute('aria-expanded', String(!!state));
      if (state && focusFirst) { var f = $('a', panel); if (f) f.focus(); }
    }
    function later(state, ms) { clearTimeout(timer); timer = setTimeout(function () { setOpen(state); }, ms); }

    svcLink.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !phone()) later(true, 70); });
    svcLink.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !phone()) later(false, 450); });
    flyout.addEventListener('pointerenter', function () { clearTimeout(timer); });
    flyout.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') later(false, 450); });

    svcLink.addEventListener('click', function (e) {
      if (phone()) {
        e.preventDefault(); e.stopPropagation();
        setOpen(!isOpen(), false);
        return;
      }
      /* desktop: first click (or Enter) opens; a click while open follows the link to the services page */
      if (!isOpen()) { e.preventDefault(); setOpen(true, e.detail === 0); }
    });
    scrim.addEventListener('click', function () { setOpen(false); });
    doc.addEventListener('click', function (e) {
      if (!isOpen() || phone()) return;
      if (flyout.contains(e.target) || svcLink.contains(e.target)) return;
      setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); svcLink.focus(); }
    });
    flyout.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (to && !flyout.contains(to) && to !== svcLink) setOpen(false);
    });
    var toggle = $('.menu-toggle');
    if (toggle) toggle.addEventListener('click', function () { sheet.classList.remove('is-open'); svcLink.setAttribute('aria-expanded', 'false'); });
    var onChange = function () { setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }

  /* phone and tablet menu: the header's EN / ES switch is hidden below 1080px, so the menu carries its own (CSS shows it only there) */
  function initMenuLang() {
    var nav = $('#primary-nav'), lang = $('.site-header .di-lang');
    if (!nav || !lang || $('.v3-menu-lang', nav)) return;
    var box = el('div', 'v3-menu-lang');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', ES ? 'Idioma' : 'Language');
    $all('a', lang).forEach(function (a) {
      var l = (a.getAttribute('lang') || '').slice(0, 2);
      var c = el('a', null, l === 'es' ? 'Español' : 'English');
      c.href = a.getAttribute('href');
      c.setAttribute('lang', l);
      if (a.getAttribute('aria-current')) c.setAttribute('aria-current', 'true');
      box.appendChild(c);
    });
    nav.appendChild(box);
  }

  /* filter pills: [data-v3-filter="#grid"] holds buttons with data-filter; items in #grid carry data-treatment="a b".
     "all" shows everything. Hidden items get the hidden attribute, so the grid reflows. */
  function initFilters() {
    $all('[data-v3-filter]').forEach(function (bar) {
      var grid = $(bar.getAttribute('data-v3-filter'));
      if (!grid) return;
      var items = $all('[data-treatment]', grid), btns = $all('button[data-filter]', bar);
      var status = $('[data-v3-filter-status]', bar);
      function apply(f) {
        var n = 0;
        items.forEach(function (it) {
          var show = f === 'all' || (' ' + it.getAttribute('data-treatment') + ' ').indexOf(' ' + f + ' ') > -1;
          it.hidden = !show; if (show) n++;
        });
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f)); });
        if (status) status.textContent = n + (n === 1 ? ' case shown' : ' cases shown');
      }
      btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); }); });
      apply('all');
    });
  }

  /* ---------- 3. Reddit slot ---------- */
  function initReddit() {
    if (!REDDIT_URL) return;
    root.classList.add('v3-reddit');
    function arm(a) { a.href = REDDIT_URL; a.target = '_blank'; a.rel = 'noopener'; }
    $all('[data-reddit]').forEach(function (n) {
      n.hidden = false;
      if (n.tagName === 'A') arm(n);
      $all('a[data-reddit-link]', n).forEach(arm);
    });
    var panel = doc.getElementById('di-chat-panel');
    if (panel && !$('.v3-reddit-row', panel)) {
      var row = el('a', 'v3-reddit-row', 'Talk to us on Reddit');
      row.setAttribute('data-reddit', '');
      arm(row);
      panel.appendChild(row);
    }
    var block = $('.site-footer .footer-brand-block');
    if (block && !$('.v3-footer-reddit', block)) {
      var p = el('p', 'v3-footer-reddit');
      p.setAttribute('data-reddit', '');
      var a = el('a', null, 'Talk to us on Reddit');
      arm(a); p.appendChild(a); block.appendChild(p);
    }
  }

  /* ---------- 4. Chat: open (and optionally send) through the features.js widget ---------- */
  function openChat(prefill, opts) {
    opts = opts || {};
    var wrap = doc.getElementById('di-chat');
    var panel = doc.getElementById('di-chat-panel');
    var input = doc.getElementById('di-chat-input');
    var toggle = wrap && $('.di-chat-toggle', wrap);
    if (!wrap || !panel || !input || !toggle) {
      if (prefill) {
        location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(opts.subject || 'Website message') +
          '&body=' + encodeURIComponent(prefill);
      }
      return false;
    }
    if (panel.hidden) toggle.click();
    if (prefill) {
      input.value = prefill;
      if (opts.send !== false) {
        var form = input.form;
        if (form && form.requestSubmit) form.requestSubmit();
        else if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
    input.focus();
    return true;
  }

  function initChatHooks() {
    /* any element with data-v3-chat opens the chat; a non-empty value is sent as the first message */
    doc.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-v3-chat]') : null;
      if (!t) return;
      e.preventDefault();
      var msg = t.getAttribute('data-v3-chat');
      openChat(msg || null, { send: !!msg });
    });
    /* forms with data-v3-chat-form compose a message from data-v3-template ({fieldName}) and send it */
    $all('form[data-v3-chat-form]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (f.reportValidity && !f.reportValidity()) return;
        var tpl = f.getAttribute('data-v3-template') || '';
        var msg = tpl.replace(/\{([a-zA-Z0-9_-]+)\}/g, function (_, k) {
          var field = f.elements[k];
          return field ? String(field.value || '').trim() : '';
        });
        if (!msg) return;
        var sent = openChat(msg, { subject: f.getAttribute('data-v3-subject') || 'Website message' });
        var status = $('[data-v3-status]', f);
        if (status && sent) {
          status.textContent = f.getAttribute('data-v3-sent') || 'Thank you. Your message is in the chat window, and the team will follow up.';
        }
        if (sent) f.reset();
      });
    });
  }

  /* ---------- 5. Motion: reveal + pointer tilt ---------- */
  function initReveal() {
    $all('[data-v3-stagger]').forEach(function (g) {
      var kids = $all(':scope > *', g);
      kids.forEach(function (k, i) {
        if (!k.hasAttribute('data-v3-reveal')) k.setAttribute('data-v3-reveal', g.getAttribute('data-v3-stagger') || '');
        k.style.setProperty('--v3-i', String(i % 8));
      });
    });
    var items = $all('[data-v3-reveal]');
    if (RM || !('IntersectionObserver' in window)) { items.forEach(function (n) { n.classList.add('v3-in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.classList.add('v3-in'); io.unobserve(t);
        setTimeout(function () { t.classList.add('v3-done'); }, 1700);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  function initTilt() {
    if (RM) return;
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    $all('[data-v3-tilt]').forEach(function (n) {
      var max = parseFloat(n.getAttribute('data-v3-tilt')) || 6;
      var raf = 0, px = 0.5, py = 0.5;
      function paint() {
        raf = 0;
        n.style.setProperty('--v3-ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        n.style.setProperty('--v3-rx', ((0.5 - py) * 2 * max * 0.8).toFixed(2) + 'deg');
        n.style.setProperty('--v3-mx', (px * 100).toFixed(1) + '%');
        n.style.setProperty('--v3-my', (py * 100).toFixed(1) + '%');
      }
      if (fine) {
        n.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          var r = n.getBoundingClientRect();
          px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
          if (!raf) raf = requestAnimationFrame(paint);
        });
        n.addEventListener('pointerleave', function () { px = 0.5; py = 0.5; if (!raf) raf = requestAnimationFrame(paint); });
      }
    });
  }

  /* ---------- 6. Liquid Glass: cursor light + rim direction on floating controls ---------- */
  var GLASS = '.v3-btn, .v3-ask, .header-cta, .header-call, .menu-toggle, .v3-flyout-cta, .office-row-actions .button, .cta-dock a, #di-chat .di-chat-toggle';
  function tagGlass() { $all(GLASS).forEach(function (n) { n.setAttribute('data-glass', '1'); }); }
  function initGlassLight() {
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (RM || !fine) return;
    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var n = e.target && e.target.closest ? e.target.closest('[data-glass]') : null;
      if (!n) return;
      var r = n.getBoundingClientRect();
      n.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      n.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      n.style.setProperty('--ang', (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI + 90 - 112).toFixed(0) + 'deg');
    }, { passive: true });
  }

  /* touch widths: hide the bottom dock while the hero's own Schedule Now / Call Now are on screen (one set of CTAs at a time) */
  function initHeroDock() {
    var btn = $('.v3-hero .v3-btn-schedule');
    if (!btn || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { root.classList.toggle('v3-hero-visible', e.isIntersecting); });
    }, { threshold: 0 });
    io.observe(btn);
  }

  /* chat: "Ask us anything" lives in the hero; once it scrolls out of view the chat docks as the bottom-left pill */
  function initChatDock() {
    var btn = $('.v3h-ask .v3-ask');
    if (!btn) { root.classList.add('v3-chat-docked'); return; }
    var raf = 0;
    function check() { raf = 0; root.classList.toggle('v3-chat-docked', btn.getBoundingClientRect().bottom < 90); }
    function queue() { if (!raf) raf = requestAnimationFrame(check); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    check();
  }

  /* header Call Now / Schedule Now: absent while the hero's own buttons are on screen, float up into the bar once they scroll away */
  function initHeaderCtas() {
    var btn = $('.v3-hero .v3-btn-schedule');
    if (!btn) { root.classList.add('v3-ctas-docked'); return; }
    var raf = 0;
    function check() { raf = 0; root.classList.toggle('v3-ctas-docked', btn.getBoundingClientRect().bottom < 64); }
    function queue() { if (!raf) raf = requestAnimationFrame(check); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    check();
  }

  /* office banner: crossfade through the photos every 5s, dots and caption follow; pauses when the tab is hidden */
  function initBanner() {
    $all('.v3-banner').forEach(function (b) {
      var imgs = $all('.v3-banner-stage img', b), dots = $all('.v3-banner-dot', b), cap = $('[data-v3-cap]', b);
      if (imgs.length < 2) return;
      var i = 0, t = null;
      function show(n) {
        i = (n + imgs.length) % imgs.length;
        imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
        dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
        if (cap) cap.textContent = imgs[i].getAttribute('data-cap') || '';
      }
      function play() { clearInterval(t); if (!RM) t = setInterval(function () { if (!doc.hidden) show(i + 1); }, 5000); }
      dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); play(); }); });
      play();
    });
  }

  /* ---------- scroll-linked motion ----------
     Every scroll-driven animation reads a progress value that FOLLOWS the scroll target with a time-based ease
     (frame-rate independent), instead of snapping to it. Wheel and trackpad steps then glide instead of jump.
     Positions of fixed elements still read live layout each frame, so nothing drifts from the page. */
  function follow(apply, k) {
    var cur = null, tgt = 0, raf = 0, last = 0;
    function step(now) {
      raf = 0;
      var dt = last ? Math.min(64, now - last) : 16.7; last = now;
      cur += (tgt - cur) * (1 - Math.pow(1 - k, dt / 16.7));
      if (Math.abs(tgt - cur) < 0.0006) cur = tgt;
      apply(cur);
      if (cur !== tgt) raf = requestAnimationFrame(step); else last = 0;
    }
    return function (v, instant) {
      tgt = v;
      if (cur === null || instant || RM) { cur = v; apply(cur); return; }
      if (!raf) raf = requestAnimationFrame(step);
    };
  }
  function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function onScroll(fn) {
    var raf = 0;
    function q() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; fn(); }); }
    window.addEventListener('scroll', q, { passive: true });
    window.addEventListener('resize', q);
    fn(true);
  }

  /* offers: each card rises and fades in as the strip scrolls up into view (--s 0..1, staggered per card) */
  var collapseOn = false;
  function initOffersScroll() {
    var wrap = $('.v3-offers[data-v3-scroll]');
    if (!wrap || SDA) return;
    var cards = $all('.v3-card', wrap);
    var set = follow(function (base) {
      cards.forEach(function (c, i) {
        if (c.hasAttribute('data-v3-all') && collapseOn) return;
        c.style.setProperty('--s', RM ? '1' : sm(base - i * 0.18).toFixed(4));
      });
    }, 0.12);
    onScroll(function (first) {
      var vh = window.innerHeight;
      set((vh - wrap.getBoundingClientRect().top) / (vh * 0.24), first);
    });
  }

  /* logo flies from the hero into the header's top-left as you scroll; the locations line starts in that top-left spot
     and slides out of the logo's way (to the top right on wide screens, away entirely on narrower ones). */
  function initFly() {
    var header = $('.site-header'), brand = $('.site-header .brand'), inner = $('.site-header .header-inner');
    var slot = $('.v3-hero .v3-hero-logo');
    if (!header || !brand || !slot || RM) return;
    var fly = slot.cloneNode(true);
    fly.classList.add('v3-fly'); fly.removeAttribute('aria-label'); fly.setAttribute('aria-hidden', 'true'); fly.tabIndex = -1;
    /* live inside the header's stacking context: above its frosted bar, below the Services flyout */
    header.appendChild(fly);
    var loc = el('p', 'v3-navloc', 'Mount Kisco, NY · Kent, CT · Stamford, CT');
    header.appendChild(loc);
    root.classList.add('v3-fly-on');
    var m = {};
    function measure() {
      var sy = window.scrollY || 0, hr = header.getBoundingClientRect(), ir = inner.getBoundingClientRect(), br = brand.getBoundingClientRect();
      var r = slot.getBoundingClientRect();
      m.w = r.width; m.h = r.height; m.x0 = r.left; m.y0 = r.top + sy;
      fly.style.width = m.w + 'px'; fly.style.height = m.h + 'px';
      m.s1 = br.width / m.w; m.x1 = br.left; m.y1 = hr.top + hr.height / 2 - m.h * m.s1 / 2;
      m.D = Math.max(1, m.y0 - m.y1);
      var lw = loc.offsetWidth, lh = loc.offsetHeight;
      m.lx0 = br.left; m.ly = hr.top + hr.height / 2 - lh / 2;
      m.wide = window.innerWidth >= 1380;
      m.lx1 = ir.right - 22 - lw;
    }
    var t = 0;
    function paint(te) {
      t = te;
      var e = sm(te), sy = window.scrollY || 0;
      var x = m.x0 + (m.x1 - m.x0) * e, y = m.y0 - Math.min(sy, m.D), s = 1 + (m.s1 - 1) * e;
      fly.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
      var out = sm(te / 0.42), back = m.wide ? sm((te - 0.58) / 0.42) : 0, lx, lo;
      if (te < 0.5 || !m.wide) { lx = m.lx0 + 80 * out; lo = 1 - out; }
      else { lx = m.lx1 + 60 * (1 - back); lo = back; }
      loc.style.transform = 'translate3d(' + lx.toFixed(2) + 'px,' + m.ly.toFixed(2) + 'px,0)';
      loc.style.opacity = lo.toFixed(3);
    }
    if (SDA) {
      var px = function (v) { return v.toFixed(2) + 'px'; };
      var apply = function () {
        measure();
        var sy = window.scrollY || 0;
        fly.style.transform = '';
        fly.style.setProperty('--fx0', px(m.x0)); fly.style.setProperty('--fy0', px(m.y0));
        fly.style.setProperty('--fx1', px(m.x1)); fly.style.setProperty('--fy1', px(m.y1));
        fly.style.setProperty('--fs1', m.s1.toFixed(4)); fly.style.setProperty('--fD', px(m.D));
        loc.style.transform = ''; loc.style.opacity = '';
        loc.style.setProperty('--lx0', px(m.lx0)); loc.style.setProperty('--lx1', px(m.lx1)); loc.style.setProperty('--ly', px(m.ly)); loc.style.setProperty('--fD', px(m.D));
        loc.classList.toggle('is-narrow', !m.wide);
      };
      window.addEventListener('resize', apply);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(apply);
      window.addEventListener('load', apply);
      apply();
      return;
    }
    var set = follow(paint, 0.16);
    function target() { return Math.min(window.scrollY || 0, m.D) / m.D; }
    function remeasure() { var sy = window.scrollY; if (sy) window.scrollTo(0, 0); measure(); if (sy) window.scrollTo(0, sy); set(target(), true); }
    window.addEventListener('scroll', function () { set(target()); paint(t); }, { passive: true });
    window.addEventListener('resize', remeasure);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(remeasure);
    window.addEventListener('load', remeasure);
    measure(); set(target(), true);
  }

  /* services carousel -> one pill -> the third offer card: scroll-linked. Phase 1 (u) the pills slide together and shrink into a single
     pill; phase 2 (v) that pill floats down into the third card's place, where the card takes over. Desktop only. */
  function initCollapse() {
    var mq = $('.v3-marquee'), card = $('[data-v3-all]'), wrap = $('.v3-offers[data-v3-scroll]');
    if (!mq || !card || !wrap || RM || window.innerWidth < 1000) return;
    collapseOn = true;
    var pill = el('a', 'v3-allpill');
    pill.href = LROOT + 'services.html'; pill.setAttribute('aria-hidden', 'true'); pill.tabIndex = -1;
    var faces = el('span', 'v3-allpill-faces');
    ['ba-4-after.webp', 'ba-5-after.webp', 'ba-7-after.webp'].forEach(function (n) { var im = el('img'); im.src = img(n); im.alt = ''; faces.appendChild(im); });
    pill.appendChild(faces); pill.appendChild(el('span', null, ES ? 'Ver todos los servicios' : 'View all of our services'));
    doc.body.appendChild(pill);
    if (SDA) {
      pill.classList.add('is-sda');
      var applyC = function () {
        var vh = window.innerHeight, vw = doc.documentElement.clientWidth;
        var mT = docTop(mq), mH = mq.offsetHeight;
        var c0 = mT - 0.58 * vh, c1 = mT - 0.32 * vh, v0 = c1, v1 = mT + 0.02 * vh;
        var pw = pill.offsetWidth, ph = pill.offsetHeight;
        var ax = vw / 2 - pw / 2, ay = mT + mH / 2 - ph / 2;
        var bx = docLeft(card) + card.offsetWidth / 2 - pw / 2, by = docTop(card) + card.offsetHeight * 0.36 - ph / 2;
        var P = function (v) { return Math.max(0, v).toFixed(1) + 'px'; };
        mq.style.setProperty('--c0', P(c0)); mq.style.setProperty('--c1', P(c1));
        pill.style.setProperty('--ax', ax.toFixed(1) + 'px'); pill.style.setProperty('--ay', ay.toFixed(1) + 'px');
        pill.style.setProperty('--bx', bx.toFixed(1) + 'px'); pill.style.setProperty('--by', by.toFixed(1) + 'px');
        pill.style.setProperty('--p0', P(c0 + 0.55 * (c1 - c0))); pill.style.setProperty('--p1', P(v1));
        card.style.setProperty('--h0', P(v0 + 0.3 * (v1 - v0))); card.style.setProperty('--h1', P(v0 + 0.75 * (v1 - v0)));
        mq.classList.add('v3-sda-collapse');
      };
      window.addEventListener('resize', applyC);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(applyC);
      window.addEventListener('load', applyC);
      applyC();
      return;
    }
    var pills = $all('.v3-pill', mq), frozen = false;
    function freeze() {
      var cx = window.innerWidth / 2;
      mq.classList.remove('is-collapsing');
      pills.forEach(function (p) { var r = p.getBoundingClientRect(); p.style.setProperty('--dx', (cx - (r.left + r.width / 2)).toFixed(1) + 'px'); });
      mq.classList.add('is-collapsing'); frozen = true;
    }
    /* z = how far the carousel has scrolled up, in viewport heights; u and v are both read from the eased z */
    function paint(z) {
      var u = Math.max(0, Math.min(1, (z - 0.42) / 0.26)), v = Math.max(0, Math.min(1, (z - 0.68) / 0.34));
      if (u > 0 && !frozen) freeze();
      if (u === 0 && frozen) { mq.classList.remove('is-collapsing'); frozen = false; pills.forEach(function (p) { p.style.removeProperty('--dx'); }); }
      mq.style.setProperty('--u', u.toFixed(4));
      var mr = mq.getBoundingClientRect(), cr = card.getBoundingClientRect();
      var sx = window.innerWidth / 2, sy = mr.top + mr.height / 2;
      var tx = cr.left + cr.width / 2, ty = cr.top + cr.height * 0.36;
      var e = sm(v), x = sx + (tx - sx) * e, y = sy + (ty - sy) * e;
      var hand = sm((v - 0.72) / 0.28), appear = sm((u - 0.55) / 0.45);
      pill.style.opacity = (appear * (1 - hand)).toFixed(3);
      pill.style.transform = 'translate3d(' + (x - pill.offsetWidth / 2).toFixed(2) + 'px,' + (y - pill.offsetHeight / 2).toFixed(2) + 'px,0) scale(' + (1 - 0.1 * e).toFixed(4) + ')';
      card.style.setProperty('--s', hand.toFixed(4));
    }
    var z = 0;
    var set = follow(function (zz) { z = zz; paint(zz); }, 0.14);
    onScroll(function (first) {
      var vh = window.innerHeight;
      set(1 - mq.getBoundingClientRect().top / vh, first);
      paint(z);
    });
  }

  /* mission sentence types itself out once on load (layout is reserved: every character is in place, just hidden) */
  function initType() {
    var p = $('.v3-hero .v3h-mission');
    if (!p || RM || p.getAttribute('data-typed')) return;
    var text = p.textContent.replace(/\s+/g, ' ').trim();
    p.setAttribute('aria-label', text); p.setAttribute('data-typed', '1');
    p.textContent = '';
    var chars = [];
    text.split('').forEach(function (ch) { var s = el('span', 'v3-ch', ch); s.setAttribute('aria-hidden', 'true'); p.appendChild(s); chars.push(s); });
    p.classList.add('v3-in', 'v3-done', 'v3-typing');
    var i = 0, prev = null;
    function tick() {
      if (prev) prev.classList.remove('is-caret');
      var c = chars[i]; c.classList.add('on', 'is-caret'); prev = c; i++;
      if (i < chars.length) {
        var ch = c.textContent, d = ch === ' ' ? 34 : (/[,.]/.test(ch) ? 190 : 20 + Math.random() * 22);
        setTimeout(tick, d);
      } else {
        setTimeout(function () { p.classList.add('v3-typed'); }, 1800);
      }
    }
    setTimeout(tick, 650);
  }

  /* Reddit pill beside the docked "Ask a question": links to Dr. Kwon's Reddit (subreddit / answers) once REDDIT_URL is set.
     Until then it shows "Coming soon" and does nothing. */
  function initRedditPill() {
    if (!REDDIT_URL) return;
    var pill = el('a', 'v3-reddit-pill');
    pill.innerHTML = '<span class="v3-reddit-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#ff4500"/><ellipse cx="12" cy="14.2" rx="6.4" ry="4.3" fill="#fff"/><circle cx="6.6" cy="10.6" r="1.5" fill="#fff"/><circle cx="17.4" cy="10.6" r="1.5" fill="#fff"/><circle cx="9.7" cy="13.7" r="1.05" fill="#ff4500"/><circle cx="14.3" cy="13.7" r="1.05" fill="#ff4500"/><path d="M9.6 16.2c1.4.9 3.4.9 4.8 0" stroke="#ff4500" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M12 9.9l.9-3.6 2.7.6" stroke="#fff" stroke-width=".9" fill="none" stroke-linecap="round"/><circle cx="16.4" cy="7.1" r="1.1" fill="#fff"/></svg></span><span class="v3-reddit-txt"><span class="v3-reddit-main">Ask us on Reddit</span><span class="v3-reddit-sub" hidden>Coming soon</span></span>';
    if (REDDIT_URL) { pill.href = REDDIT_URL; pill.target = '_blank'; pill.rel = 'noopener'; }
    else { pill.title = ES ? 'Reddit, muy pronto' : 'Ask us on Reddit, coming soon'; pill.classList.add('is-soon'); var sub = pill.querySelector('.v3-reddit-sub'); if (sub) sub.hidden = false; pill.setAttribute('aria-disabled', 'true'); pill.setAttribute('role', 'link'); pill.addEventListener('click', function (e) { e.preventDefault(); }); }
    doc.body.appendChild(pill);
    function place() {
      var t = $('#di-chat .di-chat-toggle');
      if (!t) return;
      var r = t.getBoundingClientRect();
      if (!r.width) return;
      pill.style.left = (r.right + 12) + 'px';
      pill.style.top = (r.top + r.height / 2) + 'px';
    }
    var raf = 0;
    function q() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; place(); }); }
    window.addEventListener('resize', q);
    window.addEventListener('scroll', q, { passive: true });
    setTimeout(place, 700); setTimeout(place, 1500);
    var chat = $('#di-chat');
    if (chat && window.MutationObserver) new MutationObserver(q).observe(chat, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class', 'style'] });
  }

  /* services carousel: duplicate the pill track once so the marquee loops without a seam */
  function initMarquee() {
    $all('.v3-marquee-track').forEach(function (t) {
      if (t.getAttribute('data-ready')) return;
      Array.prototype.slice.call(t.children).forEach(function (c) { var d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); $all('a', d).forEach(function (a) { a.tabIndex = -1; }); t.appendChild(d); });
      t.setAttribute('data-ready', '1');
    });
  }

  /* cursor emphasis: each .v3-em word gets --p (0..1 proximity) and --ex/--ey (pointer position inside the word) */
  function initEmphasis() {
    var words = $all('.v3-em');
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!words.length || RM || !fine) return;
    var mx = -1e4, my = -1e4, raf = 0;
    function paint() {
      raf = 0;
      words.forEach(function (w) {
        var r = w.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var d = Math.sqrt(Math.pow(mx - cx, 2) + Math.pow(my - cy, 2));
        var reach = Math.max(1100, window.innerWidth * .9);
        var p = Math.max(0, Math.min(1, 1 - d / reach));
        w.style.setProperty('--p', Math.pow(p, .55).toFixed(3));
        w.style.setProperty('--ex', Math.max(0, Math.min(100, (mx - r.left) / r.width * 100)).toFixed(1) + '%');
        w.style.setProperty('--ey', Math.max(0, Math.min(100, (my - r.top) / r.height * 100)).toFixed(1) + '%');
      });
    }
    function queue() { if (!raf) raf = requestAnimationFrame(paint); }
    doc.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; queue(); } }, { passive: true });
    doc.addEventListener('pointerleave', function () { mx = my = -1e4; queue(); });
    window.addEventListener('scroll', queue, { passive: true });
  }

  function start() {
    initHeader();
    initReddit();
    initChatHooks();
    initFilters();
    initReveal();
    initTilt();
    tagGlass();
    initGlassLight();
    initHeroDock();
    initChatDock();
    initHeaderCtas();
    initMarquee();
    initBanner();
    initOffersScroll();
    initCollapse();
    initFly();
    initEmphasis();
    initType();
    setTimeout(initRedditPill, 650);
    /* the chat widget is injected by features.js; tag its launcher once it exists */
    setTimeout(tagGlass, 600);
  }

  window.v3 = { openChat: openChat, REDDIT_URL: REDDIT_URL };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})();
