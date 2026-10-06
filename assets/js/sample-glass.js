/* Sample: Glass. Tilt-on-mouse for [data-tilt] frames and a light parallax on [data-float]. */
(function () {
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (RM) return;
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"));
  frames.forEach(function (f) {
    var stage = f.parentNode;
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      f.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
      f.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
    });
    stage.addEventListener("mouseleave", function () {
      f.style.setProperty("--ry", "0deg"); f.style.setProperty("--rx", "0deg");
    });
  });
  var floats = Array.prototype.slice.call(document.querySelectorAll("[data-float]"));
  var ticking = false;
  function run() {
    ticking = false;
    var vh = window.innerHeight;
    floats.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      var k = parseFloat(el.getAttribute("data-float")) || 30;
      el.style.transform = "translate3d(0," + (p * -k).toFixed(1) + "px,0)";
    });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  run();
})();
