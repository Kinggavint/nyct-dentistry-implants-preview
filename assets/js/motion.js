/* Motion layer: compare sliders, hero motion, carousels, rotators, slideshows, ticker,
   scroll story, count-up, staggered reveals, header and reading progress.
   Progressive enhancement only. Honours prefers-reduced-motion. */
(function () {
  var doc = document, root = doc.documentElement;
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ES = (root.lang || "").slice(0, 2) === "es";
  var T = ES
    ? { compare: "Deslice para comparar antes y después", tip: "Deslice para comparar", prev: "Anterior", next: "Siguiente", pause: "Pausar", play: "Reproducir", slide: "Ir a la diapositiva", review: "Ver reseña" }
    : { compare: "Drag to compare before and after", tip: "Drag to compare", prev: "Previous", next: "Next", pause: "Pause", play: "Play", slide: "Go to slide", review: "Show review" };

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function onVisible(el, cb, opts) {
    if (!("IntersectionObserver" in window)) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
    }, opts || { threshold: 0.25 });
    io.observe(el);
  }

  /* 1. Staggered reveal for grid children */
  var GRIDS = ".tiles, .general-list, .feature-list, .offer-list, .quote-list, .article-list, .stat-row, .photo-trio, .team-grid, .di-ba-grid, .plan-columns, .steps, .office-list, .service-index, .cred-list";
  $all(GRIDS).forEach(function (grid) {
    var kids = Array.prototype.slice.call(grid.children);
    kids.forEach(function (k, i) {
      if (!k.hasAttribute("data-reveal")) k.setAttribute("data-reveal", "");
      k.style.setProperty("--stagger", String(i % 8));
    });
  });
  if (!RM) {
    $all("[data-reveal]").forEach(function (el) {
      if (el.classList.contains("di-in")) return;
      onVisible(el, function (t) { t.classList.add("di-in"); }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    });
  } else {
    $all("[data-reveal]").forEach(function (el) { el.classList.add("di-in"); });
  }

  /* 2. Headline word reveal */
  function splitWords(node, counter) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.textContent.split(/(\s+)/);
        var frag = doc.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(p)); return; }
          var s = doc.createElement("span");
          s.className = "mo-word"; s.style.setProperty("--i", String(counter.i++)); s.textContent = p;
          frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        splitWords(n, counter);
      }
    });
  }
  if (!RM) {
    $all(".hero h1, .hero-full h1, .page-hero h1, .apple-hero h1, .apple-tagline").forEach(function (h) {
      splitWords(h, { i: 0 });
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add("mo-words-in"); }); });
    });
  }

  /* 3. Parallax and slow zoom on hero media */
  var PAR = $all(".hero-full-media, .hero-portrait, .page-hero > figure");
  PAR.forEach(function (f) {
    f.classList.add("mo-parallax");
    if (!f.classList.contains("hero-full-media")) f.classList.add("mo-kenburns");
  });

  /* 4. Header state, reading progress, parallax: one scroll loop */
  var bar = null;
  if (/\/articles\/[^/]+\.html/.test(location.pathname)) {
    bar = doc.createElement("div"); bar.className = "mo-progress"; bar.setAttribute("aria-hidden", "true");
    doc.body.appendChild(bar);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      root.classList.toggle("mo-scrolled", y > 40);
      if (bar) {
        var h = doc.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
      }
      if (!RM) {
        PAR.forEach(function (f) {
          var r = f.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          var py = Math.max(-40, Math.min(40, -r.top * 0.12));
          f.style.setProperty("--py", py.toFixed(1) + "px");
        });
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 5. Count-up: <strong data-count="39">39 plans</strong> */
  $all("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target) || RM) return;
    var html = el.innerHTML, num = String(el.getAttribute("data-count"));
    var idx = html.indexOf(num);
    if (idx < 0) return;
    var before = html.slice(0, idx), after = html.slice(idx + num.length);
    el.innerHTML = before + "0" + after;
    onVisible(el, function () {
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 3);
        el.innerHTML = before + Math.round(target * e).toLocaleString("en-US") + after;
        if (p < 1) requestAnimationFrame(step); else el.innerHTML = html;
      }
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
  });

  /* 6. Before and after: drag to compare */
  $all(".di-ba-pair .di-ba-images").forEach(function (box) {
    var cells = box.querySelectorAll(".di-ba-img");
    if (cells.length !== 2) return;
    var bImg = cells[0].querySelector("img"), aImg = cells[1].querySelector("img");
    if (!bImg || !aImg) return;
    var bLabel = cells[0].querySelector(".di-ba-label"), aLabel = cells[1].querySelector(".di-ba-label");
    var c = doc.createElement("div");
    c.className = "mo-compare";
    var a = aImg.cloneNode(true), b = bImg.cloneNode(true);
    a.removeAttribute("loading"); b.removeAttribute("loading");
    b.classList.add("mo-before");
    c.appendChild(a); c.appendChild(b);
    if (bLabel) { var bl = bLabel.cloneNode(true); c.appendChild(bl); }
    if (aLabel) { var al = aLabel.cloneNode(true); al.classList.add("mo-label-after"); c.appendChild(al); }
    var handle = doc.createElement("span"); handle.className = "mo-handle"; c.appendChild(handle);
    var range = doc.createElement("input");
    range.type = "range"; range.min = "0"; range.max = "100"; range.value = "50"; range.setAttribute("aria-label", T.compare);
    range.style.pointerEvents = "none";
    c.appendChild(range);
    box.parentNode.replaceChild(c, box);
    var tip = doc.createElement("p"); tip.className = "mo-compare-tip"; tip.textContent = T.tip;
    c.parentNode.insertBefore(tip, c.nextSibling);

    function set(p) { p = Math.max(0, Math.min(100, p)); c.style.setProperty("--pos", p + "%"); range.value = String(Math.round(p)); }
    function fromEvent(ev) { var r = c.getBoundingClientRect(); return ((ev.clientX - r.left) / r.width) * 100; }
    var dragging = false, sx = 0, sy = 0, decided = false;
    c.addEventListener("pointerdown", function (ev) {
      dragging = true; decided = ev.pointerType === "mouse"; sx = ev.clientX; sy = ev.clientY;
      c.classList.remove("mo-hint");
      if (decided) { c.setPointerCapture(ev.pointerId); set(fromEvent(ev)); }
    });
    c.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(ev.clientX - sx), dy = Math.abs(ev.clientY - sy);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; }
        decided = true; c.setPointerCapture(ev.pointerId);
      }
      set(fromEvent(ev));
    });
    function end() { dragging = false; }
    c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end);
    range.addEventListener("input", function () { set(parseFloat(range.value)); });
    set(50);
    var touched = false, inView = false, loop = null;
    function sweep() {
      if (touched || !inView) return;
      c.classList.add("mo-hint");
      setTimeout(function () { if (!touched) set(80); }, 200);
      setTimeout(function () { if (!touched) set(20); }, 1400);
      setTimeout(function () { if (!touched) set(50); }, 2600);
      setTimeout(function () { if (!touched) c.classList.remove("mo-hint"); }, 3600);
    }
    ["pointerdown", "keydown", "focusin"].forEach(function (ev) { c.addEventListener(ev, function () { touched = true; clearInterval(loop); c.classList.remove("mo-hint"); }); });
    if (!RM && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting && es[0].intersectionRatio > 0.5;
        clearInterval(loop);
        if (inView && !touched) { sweep(); loop = setInterval(sweep, 7000); }
      }, { threshold: [0, 0.5, 0.8] }).observe(c);
    }
  });

  /* 7. Carousel */
  $all(".mo-carousel").forEach(function (car) {
    var track = car.querySelector(".mo-track");
    if (!track) return;
    var nav = doc.createElement("div"); nav.className = "mo-nav";
    var count = doc.createElement("span"); count.className = "mo-count";
    var prev = doc.createElement("button"); prev.type = "button"; prev.setAttribute("aria-label", T.prev); prev.innerHTML = "&larr;";
    var next = doc.createElement("button"); next.type = "button"; next.setAttribute("aria-label", T.next); next.innerHTML = "&rarr;";
    nav.appendChild(count); nav.appendChild(prev); nav.appendChild(next);
    car.appendChild(nav);
    var cards = Array.prototype.slice.call(track.children);
    function stepW() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
      var first = Math.round(track.scrollLeft / Math.max(1, stepW())) + 1;
      var shown = Math.max(1, Math.round(track.clientWidth / Math.max(1, stepW())));
      count.textContent = first + " to " + Math.min(cards.length, first + shown - 1) + " of " + cards.length;
      if (ES) count.textContent = first + " a " + Math.min(cards.length, first + shown - 1) + " de " + cards.length;
    }
    prev.addEventListener("click", function () { track.scrollBy({ left: -stepW(), behavior: RM ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: stepW(), behavior: RM ? "auto" : "smooth" }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    /* mouse drag to scroll; links still click when the pointer barely moved */
    var down = false, startX = 0, startL = 0, moved = 0;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = 0; startX = e.clientX; startL = track.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return; var dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) { track.classList.add("is-dragging"); track.scrollLeft = startL - dx; }
    });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false;
      if (track.classList.contains("is-dragging")) {
        track.classList.remove("is-dragging");
        var w = stepW(); track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: "smooth" });
      }
    });
    track.addEventListener("click", function (e) { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
    update();
    /* autoplay: advance every few seconds while visible; pause on hover, focus or touch */
    var auto = null, hold = false, seen = false;
    function tick() {
      if (hold || !seen) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      if (track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: stepW(), behavior: "smooth" });
    }
    if (!RM) {
      ["mouseenter", "focusin", "touchstart"].forEach(function (ev) { car.addEventListener(ev, function () { hold = true; }, { passive: true }); });
      ["mouseleave", "focusout"].forEach(function (ev) { car.addEventListener(ev, function () { hold = false; }); });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }, { threshold: 0.4 }).observe(car);
      auto = setInterval(tick, 3800);
    }
  });

  /* 8. Review rotator */
  $all(".mo-rotator").forEach(function (rot) {
    var items = $all(":scope > figure", rot);
    if (items.length < 2) { if (items[0]) items[0].classList.add("is-active"); return; }
    var dur = parseInt(rot.getAttribute("data-interval") || "7000", 10);
    rot.style.setProperty("--dur", dur / 1000 + "s");
    var nav = doc.createElement("div"); nav.className = "mo-rotator-nav";
    var prog = doc.createElement("div"); prog.className = "mo-rotator-progress"; prog.innerHTML = "<i></i>";
    var dots = items.map(function (_, i) {
      var d = doc.createElement("button"); d.type = "button"; d.className = "mo-dot";
      d.setAttribute("aria-label", T.review + " " + (i + 1));
      d.addEventListener("click", function () { go(i, true); });
      nav.appendChild(d); return d;
    });
    var pause = doc.createElement("button"); pause.type = "button"; pause.className = "mo-pause"; pause.textContent = T.pause;
    nav.appendChild(pause);
    rot.parentNode.insertBefore(nav, rot.nextSibling);
    nav.parentNode.insertBefore(prog, nav.nextSibling);
    var cur = 0, timer = null, playing = !RM, hover = false, visible = false;
    function paint() {
      items.forEach(function (f, i) { f.classList.toggle("is-active", i === cur); f.setAttribute("aria-hidden", i === cur ? "false" : "true"); });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === cur); d.setAttribute("aria-current", i === cur ? "true" : "false"); });
      var bar = prog.firstChild; bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
    }
    function go(i, user) { cur = (i + items.length) % items.length; paint(); if (user) restart(); }
    function restart() {
      clearInterval(timer);
      var on = playing && visible && !hover;
      rot.classList.toggle("is-playing", on);
      if (on) timer = setInterval(function () { go(cur + 1); }, dur);
    }
    pause.addEventListener("click", function () { playing = !playing; pause.textContent = playing ? T.pause : T.play; restart(); });
    rot.addEventListener("mouseenter", function () { hover = true; restart(); });
    rot.addEventListener("mouseleave", function () { hover = false; restart(); });
    rot.addEventListener("focusin", function () { hover = true; restart(); });
    rot.addEventListener("focusout", function () { hover = false; restart(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; restart(); }, { threshold: 0.3 }).observe(rot);
    } else { visible = true; }
    if (RM) { pause.textContent = T.play; }
    paint(); restart();
  });

  /* 9. Slideshow */
  $all(".mo-slideshow").forEach(function (ss) {
    var slides = $all(":scope > figure", ss);
    if (!slides.length) return;
    var dotsBox = doc.createElement("div"); dotsBox.className = "mo-slideshow-dots";
    var dots = slides.map(function (_, i) {
      var d = doc.createElement("button"); d.type = "button"; d.setAttribute("aria-label", T.slide + " " + (i + 1));
      d.addEventListener("click", function () { show(i); restart(); });
      dotsBox.appendChild(d); return d;
    });
    ss.appendChild(dotsBox);
    var cur = 0, timer = null, visible = false;
    function show(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === cur; s.classList.toggle("is-active", on);
        if (on) { var im = s.querySelector("img"); if (im) { im.style.animation = "none"; void im.offsetWidth; im.style.animation = ""; } }
      });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === cur); });
    }
    function restart() { clearInterval(timer); if (!RM && visible) timer = setInterval(function () { show(cur + 1); }, 5000); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; restart(); }, { threshold: 0.3 }).observe(ss);
    }
    show(0);
  });

  /* 10. Ticker: duplicate the list for a seamless loop */
  $all(".mo-ticker, .svc-strip").forEach(function (tk) {
    var track = tk.querySelector(".mo-ticker-track, .svc-strip-track"), list = track && track.querySelector("ul");
    if (!list) return;
    var clone = list.cloneNode(true); clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
    var n = list.children.length;
    track.style.setProperty("--dur", Math.max(30, n * (tk.classList.contains("svc-strip") ? 3.8 : 3.2)) + "s");
    $all("a", clone).forEach(function (a) { a.setAttribute("tabindex", "-1"); });
  });

  /* 11. Scroll story */
  $all(".mo-story").forEach(function (st) {
    var steps = $all(".mo-story-steps > li", st), imgs = $all(".mo-story-frame img", st);
    var cap = st.querySelector(".mo-story-caption"), meter = st.querySelector(".mo-story-meter");
    if (meter) steps.forEach(function () { meter.appendChild(doc.createElement("i")); });
    function activate(i) {
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      var key = steps[i].getAttribute("data-img");
      imgs.forEach(function (im) { im.classList.toggle("is-active", im.getAttribute("data-img") === key); });
      if (cap) cap.textContent = steps[i].getAttribute("data-caption") || "";
      if (meter) $all("i", meter).forEach(function (b, k) { b.classList.toggle("is-on", k <= i); });
    }
    activate(0);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
    }, { rootMargin: window.innerWidth <= 860 ? "-72% 0px -16% 0px" : "-45% 0px -50% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  });

  root.classList.add("mo-ready");
})();
