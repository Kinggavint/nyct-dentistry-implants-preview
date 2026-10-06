/* Sample 4 "Bento": staggered tile entrance on load and on scroll, plus a tiny hover glow that follows the pointer. */
(function () {
  var root = document.documentElement;
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".page-sample-bento .bt-tile"));
  if (!tiles.length) return;
  root.classList.add("bt-js");
  if (RM || !("IntersectionObserver" in window)) { tiles.forEach(function (t) { t.classList.add("bt-in"); }); return; }
  var batch = 0, lastTime = 0;
  var io = new IntersectionObserver(function (entries) {
    var now = performance.now();
    if (now - lastTime > 300) batch = 0;
    lastTime = now;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.style.setProperty("--i", String(batch++));
      e.target.classList.add("bt-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  tiles.forEach(function (t) { io.observe(t); });
  /* safety: anything still hidden after 2.5s shows */
  setTimeout(function () { tiles.forEach(function (t) { if (!t.classList.contains("bt-in")) t.classList.add("bt-in"); }); }, 2500);
  /* pointer glow */
  tiles.forEach(function (t) {
    t.addEventListener("pointermove", function (ev) {
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      t.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
  });
})();
