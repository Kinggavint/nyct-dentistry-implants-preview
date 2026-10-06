/* Cinematic sample: hero crossfade with Ken Burns, auto-drifting service rail, stat reveal. */
(function () {
  var doc = document, body = doc.body;
  body.classList.add("sample-cinematic");
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Hero slideshow: crossfade every 6s, each frame runs its own Ken Burns */
  doc.querySelectorAll(".cn-hero-bg").forEach(function (bg) {
    var frames = [].slice.call(bg.querySelectorAll("img"));
    if (!frames.length) return;
    var i = 0;
    frames[0].classList.add("is-active");
    if (frames.length < 2 || RM) return;
    setInterval(function () {
      frames[i].classList.remove("is-active");
      i = (i + 1) % frames.length;
      frames[i].classList.add("is-active");
    }, 6000);
  });

  /* 2. Service rail: drifts on its own, hands over to the user the moment they touch it */
  doc.querySelectorAll(".cn-rail").forEach(function (rail) {
    if (RM) return;
    var paused = false, timer = null, dir = 1;
    function pause() { paused = true; clearTimeout(timer); timer = setTimeout(function () { paused = false; }, 5000); }
    ["pointerenter", "pointerdown", "touchstart", "wheel", "keydown"].forEach(function (ev) { rail.addEventListener(ev, pause, { passive: true }); });
    function tick() {
      if (!paused && rail.getBoundingClientRect().top < window.innerHeight) {
        var max = rail.scrollWidth - rail.clientWidth;
        if (rail.scrollLeft >= max - 1) dir = -1; else if (rail.scrollLeft <= 0) dir = 1;
        rail.scrollLeft += 0.5 * dir;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    rail.querySelectorAll(".cn-rail-next, .cn-rail-prev").forEach(function (b) {
      b.addEventListener("click", function () {
        pause();
        rail.scrollBy({ left: (b.classList.contains("cn-rail-next") ? 1 : -1) * rail.clientWidth * 0.8, behavior: "smooth" });
      });
    });
  });

  /* 3. Headline words: stagger in on load */
  doc.querySelectorAll(".cn-words").forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map(function (w, k) { return '<span style="--i:' + k + '">' + w + "</span>"; }).join(" ");
    h.classList.add("is-ready");
  });

  /* 4. Scroll progress on the sample switcher */
  var bar = doc.querySelector(".cn-progress i");
  if (bar) {
    window.addEventListener("scroll", function () {
      var h = doc.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.transform = "scaleX(" + p + ")";
    }, { passive: true });
  }
})();
