/* Teaching rail: the Pause control, and the rail rests while it is off screen. Motion itself is pure CSS. */
(function () {
  document.querySelectorAll("[data-v3x-rail]").forEach(function (rail) {
    var ctl = rail.nextElementSibling, btn = ctl && ctl.querySelector("[data-v3x-pause]"), held = false;
    if (btn) {
      btn.addEventListener("click", function () {
        held = !held;
        rail.classList.toggle("is-paused", held);
        btn.setAttribute("aria-pressed", held ? "true" : "false");
        btn.querySelector("span").textContent = held ? (btn.getAttribute("data-play") || "Play") : (btn.getAttribute("data-pause") || "Pause");
      });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        rail.classList.toggle("is-paused", held || !es[0].isIntersecting);
      }).observe(rail);
    }
  });
})();
