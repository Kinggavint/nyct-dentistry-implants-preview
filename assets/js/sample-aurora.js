/* Sample "Aurora" signature effects: magnetic buttons, live gradient-border cards, cursor-tilt on the device. */
(function () {
  var body = document.body;
  if (!body.classList.contains("sample-aurora")) body.classList.add("sample-aurora");
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* magnetic buttons */
  if (!RM && fine) {
    Array.prototype.forEach.call(document.querySelectorAll(".au-btn, .header-cta, .header-call"), function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.28, y = (e.clientY - r.top - r.height / 2) * 0.4;
        b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* cards: cycle a live gradient border so something moves without hover */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".au-card"));
  if (cards.length && !RM) {
    var i = 0;
    cards[0].classList.add("is-live");
    setInterval(function () {
      cards[i].classList.remove("is-live"); i = (i + 1) % cards.length; cards[i].classList.add("is-live");
    }, 2200);
  }

  /* device tilt */
  var dev = document.querySelector(".au-device");
  if (dev && !RM && fine) {
    var hero = dev.closest(".au-hero") || dev;
    hero.addEventListener("pointermove", function (e) {
      var r = dev.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      dev.style.transform = "perspective(900px) rotateY(" + (dx * 10).toFixed(2) + "deg) rotateX(" + (-dy * 10).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () { dev.style.transform = ""; });
  }
})();
