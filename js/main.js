/* =============================================================
 *  BEIJING HOUSE — behavior
 *  - Injects config values into links & text
 *  - Sticky header on scroll past hero
 *  - Mobile menu toggle
 *  - Scroll-reveal animations (IntersectionObserver)
 *  Vanilla JS, no dependencies.
 * ============================================================= */
(function () {
  "use strict";

  var cfg = window.BH_CONFIG || {};

  /* ---- 1. Bind config to the DOM -------------------------------- */
  // Links: <a data-link="uber"> → href from cfg.uber
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var key = el.getAttribute("data-link");
    if (cfg[key]) el.setAttribute("href", cfg[key]);
  });

  // Text: <span data-bind="phone"> → text/HTML from cfg.phone
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var key = el.getAttribute("data-bind");
    if (cfg[key] != null) el.innerHTML = cfg[key];
  });

  // Current year in the footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- 2. Sticky header appears after the hero ------------------ */
  var header = document.getElementById("siteHeader");
  var hero = document.getElementById("top");
  var isNarrow = window.matchMedia("(max-width: 820px)");

  function onScroll() {
    if (!header) return;
    if (isNarrow.matches) { header.classList.add("is-visible"); return; }
    var trigger = hero ? hero.offsetHeight - 120 : 500;
    header.classList.toggle("is-visible", window.scrollY > trigger);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- 3. Mobile menu ------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeMenu() {
    if (!toggle || !mobileNav) return;
    toggle.classList.remove("is-open");
    mobileNav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---- 4. Scroll-reveal ----------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
