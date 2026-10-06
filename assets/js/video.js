/* Video components: loop (.vd-loop), feature (.vd-feature), testimonials (.vd-testimonials).
   No third-party requests happen until a visitor clicks play on an embed. */
(function () {
  "use strict";
  var doc = document;
  var es = (doc.documentElement.lang || "").toLowerCase().indexOf("es") === 0;
  var T = es
    ? { play: "Reproducir video", pause: "Pausar", close: "Cerrar", all: "Todos", en: "Inglés", es: "Español", filter: "Filtrar por idioma", dialog: "Video" }
    : { play: "Play video", pause: "Pause", close: "Close", all: "All", en: "English", es: "Español", filter: "Filter by language", dialog: "Video" };
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function el(tag, cls, attrs) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }
  function icon(kind) {
    var s = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">';
    s += kind === "pause" ? '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>' : kind === "close" ? '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="square"/>' : '<path d="M8 5.5v13l11-6.5z"/>';
    return s + "</svg>";
  }

  /* Turn a YouTube or Vimeo link into a privacy-enhanced embed URL. */
  function embedUrl(link) {
    var u;
    try { u = new URL(link, location.href); } catch (e) { return null; }
    var h = u.hostname.replace(/^www\./, ""), id = null, m;
    if (h === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if ((m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/))) id = m[2];
      if (id && /^[\w-]{6,20}$/.test(id)) return "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      return null;
    } else if (/(^|\.)vimeo\.com$/.test(h)) {
      m = u.pathname.match(/(\d{5,})/);
      if (m) return "https://player.vimeo.com/video/" + m[1] + "?autoplay=1&dnt=1";
    }
    return null;
  }

  /* Build the playable element (video or iframe) for a source holder. */
  function buildMedia(d) {
    if (d.embed) {
      var src = embedUrl(d.embed);
      if (!src) return null;
      return el("iframe", "vd-media", { src: src, title: d.title || T.dialog, allow: "autoplay; fullscreen; picture-in-picture", allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin" });
    }
    if (!d.src) return null;
    var v = el("video", "vd-media", { controls: "", playsinline: "", preload: "metadata", "aria-label": d.title || T.dialog });
    if (d.poster) v.setAttribute("poster", d.poster);
    v.src = d.src;
    if (d.captions) {
      var t = el("track", null, { kind: "captions", src: d.captions, srclang: d.lang || (es ? "es" : "en"), label: d.lang === "es" ? "Español" : "English", default: "" });
      v.appendChild(t);
    }
    return v;
  }
  function data(node) {
    var s = node.dataset;
    return { src: s.src, embed: s.embed, poster: s.poster, title: s.title, captions: s.captions, duration: s.duration, lang: s.lang, orient: s.orient };
  }
  function posterImg(poster) {
    if (!poster) return null;
    var i = el("img", "vd-poster", { src: poster, alt: "", loading: "lazy", decoding: "async" });
    i.addEventListener("error", function () { i.remove(); });
    return i;
  }

  /* 1. Background loop ------------------------------------------------------ */
  function initLoop(fig) {
    var v = fig.querySelector("video");
    if (!v || fig.dataset.vdReady) return;
    fig.dataset.vdReady = "1";
    v.muted = true; v.defaultMuted = true; v.loop = true; v.setAttribute("playsinline", "");
    v.removeAttribute("controls"); v.setAttribute("aria-hidden", "true"); v.tabIndex = -1;
    var visible = false, userPaused = false, loaded = false;
    var btn = el("button", "vd-toggle", { type: "button" });
    function label(playing) {
      btn.innerHTML = icon(playing ? "pause" : "play");
      btn.setAttribute("aria-label", playing ? T.pause : T.play);
      btn.setAttribute("aria-pressed", playing ? "false" : "true");
    }
    function load() {
      if (loaded) return;
      loaded = true;
      var s = v.getAttribute("data-src") || v.dataset.src;
      if (s) { v.src = s; v.load(); }
    }
    function play() { load(); var p = v.play(); if (p && p.catch) p.catch(function () { label(false); }); }
    function sync() {
      if (visible && !userPaused && !reduce.matches) play(); else v.pause();
    }
    btn.addEventListener("click", function () {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener("play", function () { label(true); fig.classList.add("vd-playing"); });
    v.addEventListener("pause", function () { label(false); fig.classList.remove("vd-playing"); });
    label(false);
    fig.appendChild(btn);
    if (reduce.matches) userPaused = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0.25 }).observe(fig);
    }
    var onChange = function () { sync(); };
    if (reduce.addEventListener) reduce.addEventListener("change", onChange);
  }

  /* 2. Feature video -------------------------------------------------------- */
  function initFeature(fig) {
    if (fig.dataset.vdReady) return;
    fig.dataset.vdReady = "1";
    var d = data(fig);
    var title = d.title || T.dialog;
    var btn = el("button", "vd-start", { type: "button", "aria-label": T.play + ": " + title });
    var p = posterImg(d.poster);
    if (p) btn.appendChild(p);
    var ic = el("span", "vd-play"); ic.innerHTML = icon("play"); btn.appendChild(ic);
    if (d.duration) { var du = el("span", "vd-duration"); du.textContent = d.duration; btn.appendChild(du); }
    fig.insertBefore(btn, fig.firstChild);
    btn.addEventListener("click", function () {
      var m = buildMedia(d);
      if (!m) return;
      fig.classList.add("vd-active");
      btn.replaceWith(m);
      if (m.tagName === "VIDEO") { var pr = m.play(); if (pr && pr.catch) pr.catch(function () {}); }
      m.tabIndex = -1; m.focus({ preventScroll: true });
    });
  }

  /* 3. Testimonials --------------------------------------------------------- */
  var dlg, dlgBody, dlgTitle, lastTrigger;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = el("dialog", "vd-dialog", { "aria-labelledby": "vd-dialog-title" });
    var box = el("div", "vd-dialog-box");
    dlgTitle = el("p", "vd-dialog-title", { id: "vd-dialog-title" });
    var close = el("button", "vd-close", { type: "button", "aria-label": T.close });
    close.innerHTML = icon("close");
    dlgBody = el("div", "vd-dialog-body");
    box.appendChild(dlgTitle); box.appendChild(close); box.appendChild(dlgBody);
    dlg.appendChild(box);
    doc.body.appendChild(dlg);
    close.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () {
      var m = dlgBody.querySelector("video");
      if (m) m.pause();
      dlgBody.textContent = "";
      doc.documentElement.classList.remove("vd-lock");
      if (lastTrigger && doc.contains(lastTrigger)) lastTrigger.focus();
    });
    return dlg;
  }
  function openModal(d, trigger) {
    var m = buildMedia(d);
    if (!m) return;
    var dd = ensureDialog();
    lastTrigger = trigger;
    dlgBody.textContent = "";
    dlgBody.appendChild(m);
    dlgTitle.textContent = d.title || T.dialog;
    dd.classList.toggle("vd-portrait", d.orient === "portrait");
    doc.documentElement.classList.add("vd-lock");
    if (dd.showModal) dd.showModal(); else dd.setAttribute("open", "");
    if (m.tagName === "VIDEO") { var pr = m.play(); if (pr && pr.catch) pr.catch(function () {}); }
    dd.querySelector(".vd-close").focus();
  }
  function initTestimonials(grid) {
    if (grid.dataset.vdReady) return;
    grid.dataset.vdReady = "1";
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".vd-testimonial"));
    var langs = {};
    cards.forEach(function (card) {
      var d = data(card);
      var lang = (d.lang || (es ? "es" : "en")).toLowerCase().slice(0, 2);
      d.lang = lang; card.dataset.lang = lang; langs[lang] = true;
      var cap = card.querySelector("figcaption");
      d.title = d.title || (cap ? cap.textContent.trim() : "");
      var btn = el("button", "vd-start", { type: "button", "aria-label": T.play + (d.title ? ": " + d.title : "") });
      var p = posterImg(d.poster);
      if (p) btn.appendChild(p);
      var ic = el("span", "vd-play"); ic.innerHTML = icon("play"); btn.appendChild(ic);
      var badge = el("span", "vd-badge", { lang: lang }); badge.textContent = lang.toUpperCase(); btn.appendChild(badge);
      if (d.duration) { var du = el("span", "vd-duration"); du.textContent = d.duration; btn.appendChild(du); }
      card.insertBefore(btn, card.firstChild);
      btn.addEventListener("click", function () { openModal(d, btn); });
    });
    if (langs.en && langs.es) {
      var bar = el("div", "vd-filters", { role: "group", "aria-label": T.filter });
      [["all", T.all], ["en", T.en], ["es", T.es]].forEach(function (o, i) {
        var b = el("button", "vd-filter", { type: "button", "aria-pressed": i === 0 ? "true" : "false" });
        b.textContent = o[1];
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(bar.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          cards.forEach(function (c) { c.hidden = !(o[0] === "all" || c.dataset.lang === o[0]); });
        });
        bar.appendChild(b);
      });
      grid.parentNode.insertBefore(bar, grid);
    }
  }

  function init() {
    Array.prototype.forEach.call(doc.querySelectorAll(".vd-loop"), initLoop);
    Array.prototype.forEach.call(doc.querySelectorAll(".vd-feature"), initFeature);
    Array.prototype.forEach.call(doc.querySelectorAll(".vd-testimonials"), initTestimonials);
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
