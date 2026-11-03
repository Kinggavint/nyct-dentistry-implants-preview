const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  /* one place opens and closes the phone menu: the page behind it locks (html.v3-menu-open) and dims (v3.css scrim) */
  const setMenu = (open, returnFocus) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    primaryNav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("v3-menu-open", open);
    if (open) {
      const first = primaryNav.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    } else {
      const sheet = document.getElementById("v3-sheet");
      if (sheet) sheet.classList.remove("is-open");
      if (returnFocus) menuToggle.focus();
    }
  };

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true", false);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false, false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && primaryNav.classList.contains("is-open")) setMenu(false, true);
  });

  /* a tap outside the panel (on the dimmed page) closes it */
  document.addEventListener("click", (event) => {
    if (!primaryNav.classList.contains("is-open")) return;
    if (primaryNav.contains(event.target) || menuToggle.contains(event.target)) return;
    setMenu(false, false);
  });

  /* growing past the menu breakpoint closes it, so the page never stays locked */
  const wide = window.matchMedia("(min-width: 1081px)");
  const onWide = () => { if (wide.matches && primaryNav.classList.contains("is-open")) setMenu(false, false); };
  if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);
}

/* contact form: the message goes to the chosen office's address (data-email on each option), else the practice address */
document.querySelectorAll("form[data-office-mail]").forEach((form) => {
  const select = form.querySelector('select[name="office"]');
  if (!select) return;
  const route = () => {
    const email = select.selectedOptions[0] && select.selectedOptions[0].dataset.email;
    if (email) form.action = "mailto:" + email;
  };
  select.addEventListener("change", route);
  form.addEventListener("submit", route);
  route();
});
