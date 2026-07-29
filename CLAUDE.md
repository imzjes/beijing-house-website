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
index.html          ← all page markup, one file (#top #order [marquee] #menu #story #catering #careers #visit)
css/styles.css      ← design tokens, layout, responsive (@1024/@820/@560), scroll animations
js/main.js          ← loads content/site.json (fallback DEFAULTS baked in), sticky header, mobile menu, reveals
content/site.json   ← EDITABLE content (CMS writes this): links, phone, hours, menu, dishes, photos
admin/index.html    ← Sveltia CMS loader (owner login → edit form)
admin/config.yml    ← CMS schema + GitHub backend (base_url = OAuth worker, see docs/ADMIN-SETUP.md)
cms-auth/           ← Cloudflare Worker (sveltia-cms-auth) source + wrangler.toml for the /admin GitHub login
docs/ADMIN-SETUP.md ← one-time CMS/OAuth + Cloudflare setup runbook
assets/
  img/              ← logo.png (red seal), hero-poster.jpg, ubereats.svg + doordash.svg (ink-tinted), dish/story/catering photos
  video/            ← hero.mp4 (compressed loop)
  menu/             ← menu.pdf (the live menu)
.nojekyll           ← tells GitHub Pages to serve files as-is (no Jekyll processing)
```

## Design system (editorial "parchment" theme)
All values are CSS custom properties at the top of `css/styles.css`. Adapted from an
Amrit-Palace-style reference, using Beijing House **red as the sole chromatic accent**.
- **Palette**: `--parchment #EBDDC4` (canvas) · `--ink #2A211C` (text, warm near-black — never pure black) · `--accent #A82724` (brand red; used sparingly — eyebrows, seal, primary CTA) · `--midnight/--dark-2` (dark story/hiring/footer bands) · `--stone` (1px hairlines). Flat surfaces — no shadows, no grain, no gradients except hero/photo scrims.
- **Type**: `--serif` Cormorant Garamond (whisper-weight **300**, UPPERCASE headings, tight negative tracking) · `--sans` Inter (body/nav/buttons, 500) · `--sc` Noto Serif SC (Chinese only). Section headings use `.display`; the long Story headline is scoped smaller via `.story .display`.
- **Geometry**: 0px radius on cards/sections/images; 3px only on buttons/tags. Buttons are ghost/outlined (`.btn--outline/--cream` = ink, `.btn--solid/--gold` = accent). No filled chromatic fills except the primary hover.
- **Layout**: `--maxw 2160px` (wide/near-full-bleed — fills large screens, caps ultra-wide) · `--gutter clamp(1.5rem,5vw,6rem)` (fluid side padding, content never touches the edge) · `--maxw-text 40rem` (prose stays ~66ch regardless of container). `.wrap` centers at `--maxw` with `--gutter` padding.
- **Responsive breakpoints**: `@1200` is the single tablet/mobile switch — desktop nav → hamburger, mobile hero, order cards → 1-col stacked, menu → 2-col, story/catering/visit → 1-col. Set to 1200 (not 1024) because the wide horizontal nav (long labels like "RESERVE A TABLE") collides below ~1200. `@560` → menu 1-col, hero CTAs single dynamic-width row, catering buttons stack.

## Scroll animations
Editorial motion — slow, smooth, no bounce (expo-out `--e-rise`). Effect classes are set in
the HTML and hidden **before first paint** via a `has-js` flag (inline `<script>` in `<head>`):
- `a-rise` — fade + rise (content blocks/cards; grid children stagger via JS `transitionDelay`)
- `a-head` — section heading **wipes up** (clip-path) while its eyebrow rises
- `a-img` — big feature photos **curtain-reveal** (`.story__photo`, `.catering__photo`)
`js/main.js` adds `is-in` on IntersectionObserver. Plus a **parallax engine** (rAF, in `main.js`): the hero footage drifts on scroll via `transform` (video is oversized `top:-15%;height:130%` so the drift never shows edges; desktop only), and feature/dish photos **pan in their frames** via `background-position-y` (frames are `background-size:100% 132%` so there's room; real photos use `cover` from `.has-image`). Using transform for the hero and background-position for photos keeps parallax from fighting the reveal transitions. Also: animated gold nav underlines and the horizontal **dish marquee** (`.marquee`). All disabled under `prefers-reduced-motion`; degrades to fully-visible without JS.

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
- **Cache-busting**: `index.html` loads `css/styles.css?v=N` and `js/main.js?v=N`. GitHub Pages caches assets ~10 min, so **bump `N` whenever you edit styles.css or main.js** — otherwise browsers keep serving the old file (symptom: "I changed it but it still looks the same"). `content/site.json` is fetched with `cache:no-cache` so it's always fresh.
- **Reduced motion**: animations are disabled under `prefers-reduced-motion` — don't move essential content behind a reveal without a visible fallback.
- **Mobile hero (`@820`)**: the hero's own centered brand is hidden (the always-on sticky header carries branding — they collided otherwise); height is `100svh` and CTAs are bottom-pinned with `env(safe-area-inset-bottom)` so Safari's toolbar/home-indicator never covers them. Hero CTAs become one `flex:1 1 0` row at `@560`.
- **Flex-column children stretch**: images inside a `flex-direction:column` card (order-card seal/brand marks) get distorted unless given `align-self: flex-start`. Same reason `.story__grid` uses `align-items: stretch` so `.story__photo` fills the column height instead of floating centered.
- **Adding a real photo doesn't need code for CMS uploads** — the `image` widgets in `admin/config.yml` set `story_photo`/`catering_photo`/`dishes[].photo`; `js/main.js` applies them as `background-image` + `has-image`. Hand-editing: see "Adding a real photo" below.
- **Verifying visually without the Chrome extension** (it's often disconnected): drive headless Chrome via CDP. `scratchpad/capture.js` connects to `chrome --headless=new --remote-debugging-port=9222`, emulates `prefers-reduced-motion:reduce` (so reveal elements are visible in a static shot), and captures full-page. **`--window-size` alone does NOT apply mobile media queries** — use `Emulation.setDeviceMetricsOverride{mobile:true}` for true mobile rendering.
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
