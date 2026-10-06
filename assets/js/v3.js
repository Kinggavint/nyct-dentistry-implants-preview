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
    ['same-day-implants', 'Same-Day Implants', 'ba-8-after.webp'],
    ['full-arch-implants', 'All-on-X', 'xray-1-after.webp'],
    ['cosmetic-dentistry', 'Smile Makeovers', 'ba-5-after.webp'],
    ['porcelain-veneers', 'Veneers', 'ba-7-after.webp'],
    ['dental-crowns', 'Crowns', 'ba-3-after.webp'],
    ['invisalign', 'Clear Aligners', null],
    ['teeth-whitening', 'Whitening', 'ba-6-after.webp'],
    ['preventive-care', 'Cleanings', 'ba-1-after.webp'],
    ['root-canal-treatment', 'Root Canals', null],
    ['tooth-extractions', 'Extractions', null],
    ['periodontal-care', 'Gum Care', null],
    ['dentures', 'Dentures', null],
    ['emergency-dentistry', 'Emergency Care', null]
  ];
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

  /* Language root prefix taken from the header's Services link ("services.html" or "../services.html"). */
  var svcLink = $all('#primary-nav a').filter(function (a) { return /(^|\/)services\.html$/.test(a.getAttribute('href') || ''); })[0] || null;
  var LROOT = svcLink ? svcLink.getAttribute('href').replace(/services\.html$/, '') : '';

  /* ---------- 1. Header: v2 links + services flyout ---------- */
  function iconList() {
    var ul = el('ul', 'v3-icons');
    SERVICES.forEach(function (s, i) {
      var li = el('li');
      li.style.setProperty('--v3-i', String(i));
      var a = el('a');
      a.href = LROOT + 'services/' + s[0] + '.html';
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
      a.appendChild(el('span', 'v3-icon-label', s[1]));
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }
  function footRow() {
    var foot = el('div', 'v3-flyout-foot');
    var all = el('a', 'v3-link');
    all.href = LROOT + 'v2-services.html';
    all.appendChild(el('span', null, 'All services'));
    var book = el('a', 'v3-flyout-cta', 'Schedule Now');
    book.href = LROOT + 'locations.html';
    book.setAttribute('data-office', 'book');
    foot.appendChild(all); foot.appendChild(book);
    return foot;
  }

  function initHeader() {
    var brand = $('.site-header .brand');
    if (brand) brand.setAttribute('href', LROOT + 'v3.html');
    var fbrand = $('.site-footer .footer-brand');
    if (fbrand) fbrand.setAttribute('href', LROOT + 'v3.html');
    if (!svcLink) return;

    svcLink.setAttribute('href', LROOT + 'v2-services.html');
    if (/v3-services\.html$/.test(location.pathname)) svcLink.setAttribute('aria-current', 'page');
    svcLink.classList.add('v3-has-flyout');
    svcLink.setAttribute('aria-haspopup', 'true');
    svcLink.setAttribute('aria-expanded', 'false');

    var header = $('.site-header');
    var flyout = el('div', 'v3-flyout');
    flyout.id = 'v3-flyout';
    flyout.setAttribute('role', 'region');
    flyout.setAttribute('aria-label', 'Services');
    var inner = el('div', 'v3-flyout-inner');
    inner.appendChild(el('p', 'v3-flyout-head', 'Services'));
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
    svcLink.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !phone()) later(false, 240); });
    flyout.addEventListener('pointerenter', function () { clearTimeout(timer); });
    flyout.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') later(false, 240); });

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

  /* ---------- 6. Liquid Glass: refraction lens, pointer highlight, header over the dark section ---------- */
  var GLASS = '.lg, .lg-under, .v3-glass, .v3-frame, .v3-btn-schedule, .header-cta, .v3-flyout-cta, #di-chat .di-chat-toggle';

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
    initReveal();
    initTilt();
    tagGlass();
    initGlassLight();
    initHeroDock();
    initChatDock();
    initHeaderCtas();
    initMarquee();
    initBanner();
    initEmphasis();
    /* the chat widget is injected by features.js; tag its launcher once it exists */
    setTimeout(tagGlass, 600);
  }

  window.v3 = { openChat: openChat, REDDIT_URL: REDDIT_URL };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})();
