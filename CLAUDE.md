# Beijing House — Website

Static marketing site for Beijing House (authentic Chinese restaurant, Tampa FL).
No backend, no build step. Plain HTML/CSS/JS + a small set of **vendored** scroll
libraries (`js/vendor/`: Lenis, GSAP, ScrollTrigger, SplitType — no runtime CDN).
Deploys to GitHub Pages (or Netlify/Cloudflare Pages).

## Current state & open items (read this first)
**Section order** (top → bottom): Hero → **Our Story** (dark, interior photo) → dish marquee → **Signatures of the House** (4 dish cards) → **Order Tonight** → **Catering & Events** → **Find Us** → **Join the Family / hiring** (dark) → footer.

**Done**: editorial "parchment" redesign; real red seal logo; **real menu dishes** (Chongqing Spicy Chicken 重庆辣子鸡 · Mongolian Beef 蒙古牛 · Green Beans with Minced Pork 干煸四季豆 · Fish in Golden Broth 金汤酸菜鱼 — names/descriptions from `assets/menu/menu.pdf`) with photos; **interior photo** in Story; footer **social icons** (IG/FB/TikTok/RedNote/WeChat — WeChat is click-to-copy the ID, not a link); Lenis+GSAP scroll stack; responsive at `@1200`; phone corrected to **(813) 513-8882**; hero CTAs = Order (cream→red hover) + View Menu.

**Still placeholder / TODO**:
- **Hero video** `assets/video/hero.mp4` is a *placeholder* clip (has baked-in text/branding) — swap for real Beijing House kitchen footage (keep ≤3–8 MB, muted, ≤1080p).
- **Catering photo** — none provided; `#catering` still shows the gradient placeholder (`data-slot="banquet spread"`).
- **Rotate the GitHub OAuth client secret** — it was pasted in chat once. Do it via Cloudflare dashboard → Worker `beijing-house-cms-auth` → Variables → `GITHUB_CLIENT_SECRET` (also regenerate in the GitHub OAuth App). See `docs/ADMIN-SETUP.md`.
- **RedNote** link is a Xiaohongshu *search* URL (no profile URL given); **Facebook/TikTok** URLs are the ones the owner gave — verify.
- **Custom domain** `beijinghousefl.com` (on Wix) not yet pointed at Pages (steps in `README.md`).
- Add the restaurant owner as a **repo collaborator** so they can use `/admin`.

**Accounts/tooling** (this machine): `gh` authed as **imzjes**; `wrangler` logged in as **imalabekov@gmail.com** (account `0b8202d51fa4eea883b7490a2f5c08c7`). CMS worker `beijing-house-cms-auth` is deployed with `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` set; `/admin` login works. **No AI attribution in commits** (commit as imzjes / imalabekov@gmail.com).

**Cache version**: `?v=9` on styles.css/main.js right now — bump on the next CSS/JS edit (see Cache-busting gotcha).

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
index.html          ← all page markup, one file. Order: #top #story [marquee] #menu #order #catering #visit #careers
css/styles.css      ← design tokens, layout, responsive (@1200/@560), reveal/parallax CSS
js/main.js          ← loads content/site.json (fallback DEFAULTS), sticky header, mobile menu, WeChat copy, + scroll stack
js/vendor/          ← lenis.min.js, gsap.min.js, ScrollTrigger.min.js, split-type.min.js (loaded before main.js)
content/site.json   ← EDITABLE content (CMS writes this): links, phone, hours, menu, dishes, photos
admin/index.html    ← Sveltia CMS loader (owner login → edit form)
admin/config.yml    ← CMS schema + GitHub backend (base_url = OAuth worker, see docs/ADMIN-SETUP.md)
cms-auth/           ← Cloudflare Worker (sveltia-cms-auth) source + wrangler.toml for the /admin GitHub login
docs/ADMIN-SETUP.md ← one-time CMS/OAuth + Cloudflare setup runbook
assets/
  img/              ← logo.png (red seal), hero-poster.jpg, dish-*.webp (4 dishes), interior.jpg (Story),
                       ubereats.svg + doordash.svg (ink-tinted), social/*.svg (5 platform icons)
  video/            ← hero.mp4 (PLACEHOLDER clip — replace)
  menu/             ← menu.pdf (the live menu; 33MB, could be compressed w/ ghostscript)
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

## Scroll experience (Lenis + GSAP stack)
Reveal effect classes are set in the HTML and hidden **before first paint** via a `has-js`
flag (inline `<script>` in `<head>`): `a-rise` (fade+rise, cards stagger via JS `transitionDelay`),
`a-head` (eyebrow rises; the `.display` heading is a letter-by-letter reveal), `a-img` (curtain reveal).
The premium scroll/parallax is driven by four vendored libraries in `js/vendor/`
(no CDN at runtime): **Lenis** (smooth scroll), **GSAP + ScrollTrigger** (scroll
animation), **SplitType** (text splitting). Loaded in `index.html` before `main.js`.
Wired up in `main.js` (feature-detected; all optional):
- **Lenis** smooth scroll, synced to GSAP (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`). In-page anchor links are routed through `lenis.scrollTo`. Native/untouched on mobile (Lenis leaves touch alone).
- **Reveals**: `.a-rise` / `.a-head` / `.a-img` get `is-in` toggled by **ScrollTrigger** (NOT IntersectionObserver — that fights Lenis). CSS still defines the hidden/revealed states.
- **Parallax**: real photos live in an oversized `.ph-fill` layer inside their overflow-hidden frame; GSAP scrubs `yPercent` (-10→10) on scroll = smooth transform parallax, never distorts. Hero video drifts (desktop only, `#top` scrub).
- **Headings**: `.section__head .display` are split into chars by SplitType and revealed letter-by-letter (GSAP stagger on ScrollTrigger). Hidden via `.has-js .a-head .display{opacity:0}` until then.
- **Fallback**: if `prefers-reduced-motion` OR any lib is missing/errors → no smooth scroll, reveals fall back to IntersectionObserver, headings shown (`showHeadings()`). Never leaves content hidden.
Also: animated gold nav underlines and the horizontal **dish marquee** (`.marquee`).

**Adding a photo** (dish/story/catering): it needs the `.ph-fill` inner layer, not a background on the frame. Hardcode: `<div class="dish__photo has-image"><div class="ph-fill" style="background-image:url(...)"></div></div>`. Via CMS: `fillPhoto()` in `main.js` creates the `.ph-fill` automatically.

## How content binding works
- `content/site.json` is the source of truth. `js/main.js` fetches it and applies it to the DOM; if the fetch fails (e.g. `file://`), the baked-in `DEFAULTS` object keeps the page populated.
- In HTML, `<a data-link="uber">` gets its `href` from `site.json.uber`; `<span data-bind="phone">` gets its text from `site.json.phone`; `[data-dish="0..3"]` and `[data-photo="story_photo"]` get dish text/photos.
- Real text also lives literally in the HTML (good for SEO); the JSON overwrites it at runtime. Asset paths are normalized: a leading `/` is stripped so both `/assets/..` (CMS default) and `assets/..` (relative) work.

## Adding a real photo to a placeholder
Photos go in a `.ph-fill` inner layer (oversized so GSAP can parallax it without distortion),
**not** as a background on the frame. Add `has-image` to the frame + a `.ph-fill` child:
```html
<div class="dish__photo has-image"><div class="ph-fill" style="background-image:url('assets/img/x.webp')"></div></div>
```
Via `/admin`, `fillPhoto()` in `main.js` creates the `.ph-fill` automatically. Frames still
`overflow:hidden`; the empty catering frame keeps `data-slot="banquet spread"` (gradient + caption).

## Gotchas
- **Hero video autoplay** needs `muted` + `playsinline` (both already set). iOS won't autoplay with sound.
- **Keep the video small** — GitHub Pages has a 100 MB/file cap and ~100 GB/mo bandwidth. Target 3–8 MB, ≤1080p, or host on Cloudflare Stream/Bunny and point `<source src>` at it. `poster` shows while it loads and if it fails.
- **`.nojekyll` must exist** or GitHub Pages may mishandle files.
- **Cache-busting**: `index.html` loads `css/styles.css?v=N` and `js/main.js?v=N`. GitHub Pages caches assets ~10 min, so **bump `N` whenever you edit styles.css or main.js** — otherwise browsers keep serving the old file (symptom: "I changed it but it still looks the same"). `content/site.json` is fetched with `cache:no-cache` so it's always fresh.
- **Reduced motion**: animations are disabled under `prefers-reduced-motion` — don't move essential content behind a reveal without a visible fallback.
- **Single responsive breakpoint is `@1200`** (not 1024) — below it, everything switches to hamburger nav + mobile hero + stacked sections, because the wide horizontal nav (long labels) collides below ~1200. `@560` is the phone-only tweak (menu 1-col, hero CTAs single row).
- **Mobile hero (`@1200`)**: the hero's own centered brand is hidden (the always-on sticky header carries branding — they collided otherwise); height is `100svh` and CTAs are bottom-pinned with `env(safe-area-inset-bottom)` so Safari's toolbar/home-indicator never covers them.
- **Sticky `:hover` on touch**: a `@media (hover: none)` block resets interactive hover states so buttons don't look permanently pressed after tapping + returning from an external link.
- **Flex-column children stretch**: images inside a `flex-direction:column` card (order-card seal/brand marks) get distorted unless given `align-self: flex-start`. Same reason `.story__grid` uses `align-items: stretch` so `.story__photo` fills the column height.
- **CMS photo uploads** — `image`/`file` widgets in `admin/config.yml` set `story_photo`/`catering_photo`/`dishes[].photo`; `fillPhoto()` in `main.js` applies them into a `.ph-fill` layer (see "Adding a real photo").
- **Verifying visually without the Chrome extension** (it's often disconnected): drive headless Chrome via CDP. `scratchpad/capture.js` connects to `chrome --headless=new --remote-debugging-port=9222`, emulates `prefers-reduced-motion:reduce` (so reveal elements are visible in a static shot), and captures full-page. **`--window-size` alone does NOT apply mobile media queries** — use `Emulation.setDeviceMetricsOverride{mobile:true}` for true mobile rendering.
- **The Claude Design mockup had an "owner dashboard"** that saved edits to `localStorage` (only that one browser — visitors never saw it). Replaced with a real git-based CMS at `/admin` (Sveltia) that commits to `content/site.json`.
- **CMS login needs the OAuth worker** — `admin/config.yml` `base_url` must point at the deployed Cloudflare Worker, or login silently fails. See `docs/ADMIN-SETUP.md`.
- **`content/site.json` must stay valid JSON** — the CMS keeps it valid; if hand-editing, `node -e "JSON.parse(require('fs').readFileSync('content/site.json'))"` to check.

## Development rules (from the CurrencyApp playbook)
- Clarify before coding; small increments over rewrites.
- Mostly vanilla — the only deps are the vendored scroll libraries (deliberate, owner-approved). Don't add more without asking.
- Never commit secrets. **No AI attribution in commits** (commit as imzjes / imalabekov@gmail.com).
- Fix warnings before moving on.

## Deploy
See `README.md`. GitHub Pages: push to a repo, enable Pages on the default branch root. Custom domain repoints Wix DNS.
