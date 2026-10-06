/* Sample 3: Precision. Auto X-ray sweep, SVG annotation draw-on-scroll, sticky index tracking. */
(function () {
  "use strict";
  var doc = document, RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $all(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }

  /* 1. X-ray sweep: before/after wipe that moves on its own from the first frame */
  $all(".pr-xray[data-sweep]").forEach(function (box) {
    var start = null, dur = 5200;
    if (RM) { box.style.setProperty("--pr-sweep", "50%"); return; }
    function frame(ts) {
      if (!start) start = ts;
      var t = ((ts - start) % dur) / dur;
      var e = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);  /* ease back and forth */
      box.style.setProperty("--pr-sweep", (6 + e * 88).toFixed(2) + "%");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* 2. Annotation lines draw when the figure scrolls into view */
  var figs = $all(".pr-anno-fig");
  if (figs.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("pr-drawn"); io.unobserve(en.target); } });
    }, { threshold: 0.45 });
    figs.forEach(function (f) { io.observe(f); });
  } else { figs.forEach(function (f) { f.classList.add("pr-drawn"); }); }

  /* 3. Sticky side index: highlight the section in view */
  var idx = doc.querySelector(".pr-index");
  if (idx) {
    var links = $all("a[href^='#']", idx), secs = links.map(function (a) { return doc.querySelector(a.getAttribute("href")); }).filter(Boolean);
    function sync() {
      var y = window.scrollY + window.innerHeight * 0.35, cur = secs[0];
      secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
      links.forEach(function (a) { a.classList.toggle("is-active", cur && a.getAttribute("href") === "#" + cur.id); });
    }
    window.addEventListener("scroll", sync, { passive: true }); sync();
  }

  /* 4. Live readout: ticking numbers under the hero X-ray */
  var ro = doc.querySelector("[data-readout]");
  if (ro && !RM) {
    var i = 0, states = ["Scanning", "Aligning", "Measuring", "Verified"];
    setInterval(function () { i = (i + 1) % states.length; ro.textContent = states[i]; }, 1300);
  }
})();
