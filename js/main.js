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
    instagram: "https://instagram.com/beijinghousetampa",
    facebook: "https://www.facebook.com/share/1JNJNvwadR/",
    tiktok: "https://www.tiktok.com/@beijinghousetampa",
    rednote: "https://www.xiaohongshu.com/search_result?keyword=Beijing%20House%20Tampa",
    wechat: "BEIJINGHOUSETAMPA",
    website: "https://beijinghousefl.com"
  };
  var currentCfg = DEFAULTS;

  /* ---- utilities ---- */
  function rel(p) { return (typeof p === "string" && p.charAt(0) === "/") ? p.slice(1) : p; }
  function nl2br(s) { return String(s).replace(/\n/g, "<br>"); }

  function apply(c) {
    try {
      currentCfg = c;
      // reserve/tel default to a phone link built from the phone number
      if (!c.tel) c.tel = "tel:" + (c.phone || "").replace(/[^0-9+]/g, "");
      if (!c.reserve) c.reserve = c.tel;

      // WeChat is an ID, not a URL — surface it in the tooltip (click copies it)
      var wcTip = document.querySelector("[data-wechat] .soc__tip");
      if (wcTip) wcTip.textContent = c.wechat ? "WeChat · " + c.wechat : "WeChat";

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
  function fillPhoto(frame, url) {
    if (!frame || !url) return;
    // Real photos live in an oversized .ph-fill layer (for the parallax transform)
    var inner = frame.querySelector(".ph-fill");
    if (!inner) { inner = document.createElement("div"); inner.className = "ph-fill"; frame.appendChild(inner); }
    inner.style.backgroundImage = "url('" + rel(url) + "')";
    frame.classList.add("has-image");
  }

  /* Load CMS content, then apply (defaults applied first regardless). */
  apply(DEFAULTS);
  if (window.fetch) {
    fetch("content/site.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) { if (json) apply(Object.assign({}, DEFAULTS, json)); })
      .catch(function () { /* keep defaults */ });
  }

  /* ---- WeChat: copy the ID to clipboard on click (it's not a URL) ---- */
  var wechatLink = document.querySelector("[data-wechat]");
  if (wechatLink) {
    wechatLink.addEventListener("click", function (e) {
      e.preventDefault();
      var id = (currentCfg && currentCfg.wechat) || "";
      if (!id) return;
      var tip = wechatLink.querySelector(".soc__tip");
      var flash = function () {
        if (!tip) return;
        tip.textContent = "Copied ✓";
        setTimeout(function () { tip.textContent = "WeChat · " + id; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(flash, function () {});
      } else {
        try {
          var t = document.createElement("textarea");
          t.value = id; t.style.position = "fixed"; t.style.opacity = "0";
          document.body.appendChild(t); t.select(); document.execCommand("copy");
          document.body.removeChild(t); flash();
        } catch (err) {}
      }
    });
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

  /* =============================================================
     Scroll experience — Lenis smooth scroll + GSAP parallax + text reveals
     (the "Amrit" stack). Content blocks/images still reveal via
     IntersectionObserver; GSAP drives the scroll-linked parallax and the
     letter-by-letter heading reveals. Degrades gracefully:
       · reduced-motion or libs missing -> no smooth scroll, headings shown,
         content revealed instantly.
     ============================================================= */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var hasSplit = typeof SplitType !== "undefined";
  var hasLenis = typeof Lenis !== "undefined";
  var headings = document.querySelectorAll(".section__head .display");
  function showHeadings() { headings.forEach(function (el) { el.style.opacity = "1"; }); }

  // Slight per-card stagger within grids (applies to the CSS transition)
  document.querySelectorAll(".order-grid > .a-rise, .dish-grid > .a-rise").forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = (i * 0.08).toFixed(2) + "s";
  });
  var revealEls = document.querySelectorAll(".a-rise, .a-head, .a-img");

  if (reduce || !hasGSAP) {
    /* ---- No smooth scroll: reveal via IntersectionObserver; show headings ---- */
    showHeadings();
    if (reduce || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  } else {
    try {
      gsap.registerPlugin(ScrollTrigger);

      /* ---- Lenis smooth scroll, synced to GSAP ---- */
      if (hasLenis) {
        var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        // route in-page anchor links through Lenis so they scroll smoothly
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
          a.addEventListener("click", function (e) {
            var id = a.getAttribute("href");
            if (!id || id === "#") return;
            var target = id === "#top" ? 0 : document.querySelector(id);
            if (target === null || target === undefined) return;
            e.preventDefault();
            lenis.scrollTo(target, { duration: 1.1 });
            closeMenu();
          });
        });
      }

      /* ---- Content reveals: ScrollTrigger toggles the CSS is-in state ---- */
      revealEls.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: function () { el.classList.add("is-in"); }
        });
      });

      /* ---- Parallax: feature/dish photos drift within their frames ---- */
      gsap.utils.toArray(".has-image > .ph-fill").forEach(function (inner) {
        gsap.fromTo(inner, { yPercent: -10 }, {
          yPercent: 10, ease: "none",
          scrollTrigger: { trigger: inner.parentNode, start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      /* ---- Hero footage drift (desktop only) ---- */
      var heroV = document.getElementById("heroVideo");
      if (heroV && window.matchMedia("(min-width: 1025px)").matches) {
        gsap.to(heroV, { yPercent: 12, ease: "none",
          scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true } });
      }

      /* ---- Letter-by-letter heading reveals (SplitType) ---- */
      if (hasSplit && headings.length) {
        headings.forEach(function (el) {
          try {
            var split = new SplitType(el, { types: "words, chars", tagName: "span" });
            gsap.set(el, { opacity: 1 });
            gsap.from(split.chars, {
              opacity: 0, yPercent: 40, ease: "power2.out", duration: 0.5,
              stagger: { amount: 0.5 },
              scrollTrigger: { trigger: el, start: "top 82%", once: true }
            });
          } catch (e2) { el.style.opacity = "1"; }
        });
      } else {
        showHeadings();
      }

      ScrollTrigger.refresh();
    } catch (err) {
      showHeadings();
    }
  }
})();
