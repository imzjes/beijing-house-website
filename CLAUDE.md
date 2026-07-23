# Beijing House — Website

Static marketing site for Beijing House (authentic Chinese restaurant, Tampa FL).
No backend, no build step, no dependencies — plain HTML/CSS/JS. Deploys to GitHub Pages (or Netlify/Cloudflare Pages).

## Quick reference
- **Live site**: https://imzjes.github.io/beijing-house-website/ (GitHub Pages, repo `imzjes/beijing-house-website`)
- **Preview locally**: `python3 -m http.server 8000` then open http://localhost:8000
- **Owner-edit content**: the `/admin` panel (Sveltia CMS) → writes `content/site.json`
- **Edit content by hand**: `content/site.json` (source of truth); `DEFAULTS` in `js/main.js` is the fallback
- **Update the menu**: upload a new PDF in `/admin`, or replace `assets/menu/menu.pdf` (keep the name)
- **Hero video**: drop `assets/video/hero.mp4` + `assets/img/hero-poster.jpg` (see gotchas)
- **Ordering is external**: Chowbus (pickup), Uber Eats + DoorDash (delivery) — all `<a>` links, no integration

## File map
```
index.html          ← all page markup, one file (#top #order #menu #story #catering #careers #visit)
css/styles.css      ← palette vars, layout, responsive (@820 / @560), scroll-reveal + hero animations
js/main.js          ← loads content/site.json (fallback DEFAULTS baked in), sticky header, mobile menu, reveals
content/site.json   ← EDITABLE content (CMS writes this): links, phone, hours, menu, dishes, photos
admin/index.html    ← Sveltia CMS loader (owner login → edit form)
admin/config.yml    ← CMS schema + GitHub backend (base_url = OAuth worker, see docs/ADMIN-SETUP.md)
assets/
  img/              ← hero-poster.jpg, dish photos, story/catering photos, og-cover.jpg
  video/            ← hero.mp4 (compressed loop)
  menu/             ← menu.pdf (the live menu)
.nojekyll           ← tells GitHub Pages to serve files as-is (no Jekyll processing)
```

## How content binding works
- `content/site.json` is the source of truth. `js/main.js` fetches it and applies it to the DOM; if the fetch fails (e.g. `file://`), the baked-in `DEFAULTS` object keeps the page populated.
- In HTML, `<a data-link="uber">` gets its `href` from `site.json.uber`; `<span data-bind="phone">` gets its text from `site.json.phone`; `[data-dish="0..3"]` and `[data-photo="story_photo"]` get dish text/photos.
- Real text also lives literally in the HTML (good for SEO); the JSON overwrites it at runtime. Asset paths are normalized: a leading `/` is stripped so both `/assets/..` (CMS default) and `assets/..` (relative) work.

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
- **The Claude Design mockup had an "owner dashboard"** that saved edits to `localStorage` (only that one browser — visitors never saw it). Replaced with a real git-based CMS at `/admin` (Sveltia) that commits to `content/site.json`.
- **CMS login needs the OAuth worker** — `admin/config.yml` `base_url` must point at the deployed Cloudflare Worker, or login silently fails. See `docs/ADMIN-SETUP.md`.
- **`content/site.json` must stay valid JSON** — the CMS keeps it valid; if hand-editing, `node -e "JSON.parse(require('fs').readFileSync('content/site.json'))"` to check.

## Development rules (from the CurrencyApp playbook)
- Clarify before coding; small increments over rewrites.
- No unnecessary dependencies — keep it vanilla.
- Never commit secrets (none needed here — all links are public).
- Fix warnings before moving on.

## Deploy
See `README.md`. GitHub Pages: push to a repo, enable Pages on the default branch root. Custom domain repoints Wix DNS.
