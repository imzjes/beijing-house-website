/* =============================================================
 *  BEIJING HOUSE — behavior
 *  - Loads content/site.json (edited by the owner via /admin)
 *    and applies it to the page. Falls back to DEFAULTS baked in
 *    below, so the site NEVER breaks if the JSON is missing
 *    (e.g. opened via file://) or malformed.
 *  - Sticky header, mobile menu, scroll-reveal animations.
 *  Vanilla JS, no dependencies.
 * ============================================================= */
(function () {
  "use strict";

  /* Fallback content — mirrors content/site.json. The CMS file wins
     when it loads; this keeps the page populated otherwise. */
  var DEFAULTS = {
    hours: "Open 7 Days a Week · 11AM–10PM",
    phone: "(813) 513-8882",
    address: "1441 E Fletcher Ave #107\nTampa, FL 33612",
    menu: "assets/menu/menu.pdf",
    reserve: "tel:8135138882",
    tel: "tel:8135138882",
    order: "https://pos.chowbus.com/online-ordering/store/Beijing-House/23442",
    chowbus: "https://pos.chowbus.com/online-ordering/store/Beijing-House/23442",
    uber: "https://www.ubereats.com/store/beijing-house-fletcher/yVsfecdCVi-kCivED9jIug",
    doordash: "https://www.doordash.com/store/beijing-house-tampa-24308737/95348349/",
    cateringEmail: "mailto:catering@beijinghousefl.com",
    jobsEmail: "mailto:jobs@beijinghousefl.com",
    instagram: "https://instagram.com/beijinghousefl",
    website: "https://beijinghousefl.com"
  };

  /* ---- utilities ---- */
  function rel(p) { return (typeof p === "string" && p.charAt(0) === "/") ? p.slice(1) : p; }
  function nl2br(s) { return String(s).replace(/\n/g, "<br>"); }

  function apply(c) {
    try {
      // reserve/tel default to a phone link built from the phone number
      if (!c.tel) c.tel = "tel:" + (c.phone || "").replace(/[^0-9+]/g, "");
      if (!c.reserve) c.reserve = c.tel;

      // Links: <a data-link="uber"> → href
      document.querySelectorAll("[data-link]").forEach(function (el) {
        var k = el.getAttribute("data-link");
        if (c[k]) el.setAttribute("href", rel(c[k]));
      });

      // Text: <span data-bind="phone"> → text (newlines → <br>)
      document.querySelectorAll("[data-bind]").forEach(function (el) {
        var k = el.getAttribute("data-bind");
        if (c[k] != null) el.innerHTML = nl2br(c[k]);
      });

      // Hero video + poster
      if (c.hero_video) {
        var src = document.getElementById("heroSource");
        var vid = document.getElementById("heroVideo");
        if (src && vid) { src.setAttribute("src", rel(c.hero_video)); vid.load(); }
      }
      if (c.hero_poster) {
        var v = document.getElementById("heroVideo");
        if (v) v.setAttribute("poster", rel(c.hero_poster));
      }

      // Directions link + map embed, derived from the address
      if (c.address) {
        var q = String(c.address).replace(/\n/g, ", ").trim();
        var dirEl = document.querySelector('[data-link="directions"]');
        if (dirEl) dirEl.setAttribute("href",
          "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q));
        var map = document.querySelector("[data-map]");
        if (map) map.setAttribute("src",
          "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed");
      }

      // Section photos
      setPhoto("story_photo", c.story_photo);
      setPhoto("catering_photo", c.catering_photo);

      // Dishes
      if (Array.isArray(c.dishes)) {
        c.dishes.forEach(function (d, i) {
          var art = document.querySelector('[data-dish="' + i + '"]');
          if (!art) return;
          set(art, ".dish__cn", d.cn);
          set(art, ".dish__en", d.en);
          set(art, ".dish__desc", d.desc);
          if (d.photo) fillPhoto(art.querySelector(".dish__photo"), d.photo);
        });
      }
    } catch (e) { /* content is best-effort; never let it break the page */ }
  }

  function set(scope, sel, val) {
    if (val == null) return;
    var el = scope.querySelector(sel);
    if (el) el.textContent = val;
  }
  function setPhoto(attr, url) {
    if (!url) return;
    fillPhoto(document.querySelector('[data-photo="' + attr + '"]'), url);
  }
  function fillPhoto(el, url) {
    if (!el || !url) return;
    el.style.backgroundImage = "url('" + rel(url) + "')";
    el.classList.add("has-image");
  }

  /* Load CMS content, then apply (defaults applied first regardless). */
  apply(DEFAULTS);
  if (window.fetch) {
    fetch("content/site.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) { if (json) apply(Object.assign({}, DEFAULTS, json)); })
      .catch(function () { /* keep defaults */ });
  }

  /* ---- Current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Sticky header appears after the hero ---- */
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

  /* ---- Mobile menu ---- */
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

  /* ---- Scroll-reveal ----
     Effect classes (a-rise / a-head / a-img) are set in the HTML and hidden
     via `.has-js` before first paint. Here we just stagger grid cards and add
     `is-in` when each element scrolls into view. Degrades to fully-visible if
     JS never runs; honors prefers-reduced-motion. */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Stagger cards within the order and menu grids
  document.querySelectorAll(".order-grid > .a-rise, .dish-grid > .a-rise").forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = (i * 0.08).toFixed(2) + "s";
  });

  var animated = document.querySelectorAll(".a-rise, .a-head, .a-img");
  if (reduce || !("IntersectionObserver" in window)) {
    animated.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    animated.forEach(function (el) { io.observe(el); });
  }

  /* ---- Parallax: hero footage drifts, feature/dish photos pan in their frames.
     Uses transform (hero) and background-position (photos) so it never fights the
     reveal transitions. Disabled for reduced-motion; hero drift off on mobile. */
  if (!reduce) {
    var heroV = document.getElementById("heroVideo");
    var pxPhotos = Array.prototype.slice.call(
      document.querySelectorAll(".story__photo, .catering__photo, .dish__photo"));
    var wide = window.matchMedia("(min-width: 821px)");
    var pTick = false;
    function parallax() {
      var vh = window.innerHeight || 800;
      if (heroV) {
        if (wide.matches) {
          var y = window.pageYOffset;
          if (y < vh * 1.15) heroV.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
        } else {
          heroV.style.transform = "";
        }
      }
      for (var i = 0; i < pxPhotos.length; i++) {
        var el = pxPhotos[i], r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;
        var prog = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // ~ -0.5..0.5
        el.style.backgroundPositionY = (50 - prog * 24).toFixed(1) + "%";
      }
      pTick = false;
    }
    var onParallax = function () { if (!pTick) { requestAnimationFrame(parallax); pTick = true; } };
    window.addEventListener("scroll", onParallax, { passive: true });
    window.addEventListener("resize", onParallax, { passive: true });
    parallax();
  }
})();
