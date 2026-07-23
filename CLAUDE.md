# Beijing House — Website

Static marketing site for Beijing House (authentic Chinese restaurant, Tampa FL).
No backend, no build step, no dependencies — plain HTML/CSS/JS. Deploys to GitHub Pages (or Netlify/Cloudflare Pages).

## Quick reference
- **Preview locally**: `python3 -m http.server 8000` then open http://localhost:8000
- **Edit content** (links, hours, phone, menu path): `js/config.js` — the single source of truth
- **Update the menu**: replace `assets/menu/menu.pdf` (keep the name)
- **Hero video**: drop `assets/video/hero.mp4` + `assets/img/hero-poster.jpg` (see gotchas)
- **Ordering is external**: Chowbus (pickup), Uber Eats + DoorDash (delivery) — all `<a>` links, no integration

## File map
```
index.html          ← all page markup, one file, semantic sections (#top #order #menu #story #catering #careers #visit)
css/styles.css      ← palette vars, layout, responsive (@820 / @560), scroll-reveal + hero animations
js/config.js        ← EDITABLE content: order URLs, phone, hours, menu path, socials
js/main.js          ← binds config → DOM, sticky header, mobile menu, IntersectionObserver reveals
assets/
  img/              ← hero-poster.jpg, dish photos, story/catering photos, og-cover.jpg
  video/            ← hero.mp4 (compressed loop)
  menu/             ← menu.pdf (the live menu)
.nojekyll           ← tells GitHub Pages to serve files as-is (no Jekyll processing)
```

## How content binding works
- `js/config.js` defines `window.BH_CONFIG`.
- In HTML, `<a data-link="uber">` gets its `href` from `cfg.uber`; `<span data-bind="phone">` gets its text from `cfg.phone`.
- Text also lives literally in the HTML (good for SEO) — `data-bind` overwrites it at runtime, so keep the two in sync or just edit config.

## Adding a real photo to a placeholder
Slots are `<div data-slot="...">` with a gradient + caption. To use a real image, set it as a background and add `has-image`:
```html
<div class="dish__photo has-image" style="background-image:url('assets/img/mala.jpg')"></div>
```
(The `has-image` class hides the placeholder caption.)

## Gotchas
- **Hero video autoplay** needs `muted` + `playsinline` (both already set). iOS won't autoplay with sound.
- **Keep the video small** — GitHub Pages has a 100 MB/file cap and ~100 GB/mo bandwidth. Target 3–8 MB, ≤1080p, or host on Cloudflare Stream/Bunny and point `<source src>` at it. `poster` shows while it loads and if it fails.
- **`.nojekyll` must exist** or GitHub Pages may mishandle files.
- **Reduced motion**: animations are disabled under `prefers-reduced-motion` — don't move essential content behind a reveal without a visible fallback.
- **The Claude Design mockup had an "owner dashboard"** that saved edits to `localStorage`. That only changes the ONE browser it's typed in — visitors never see it — so it's intentionally NOT in the static build. Real self-service editing would need a CMS (e.g. Decap/Netlify CMS) or just editing `config.js`.

## Development rules (from the CurrencyApp playbook)
- Clarify before coding; small increments over rewrites.
- No unnecessary dependencies — keep it vanilla.
- Never commit secrets (none needed here — all links are public).
- Fix warnings before moving on.

## Deploy
See `README.md`. GitHub Pages: push to a repo, enable Pages on the default branch root. Custom domain repoints Wix DNS.
