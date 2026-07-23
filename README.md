# Beijing House Website

Static website for Beijing House (Tampa, FL). Plain HTML/CSS/JS — no build step.

## Preview locally
```bash
cd "Beijing House Website"
python3 -m http.server 8000
# open http://localhost:8000
```

## Edit content
Everything you'd normally change lives in **`js/config.js`**: order links (Chowbus / Uber Eats / DoorDash), phone, hours, address, socials, and the menu PDF path. Edit, save, redeploy.

**Menu:** replace `assets/menu/menu.pdf` with the new file (keep the name).
**Hero video:** add `assets/video/hero.mp4` (compressed, muted, 3–8 MB) and `assets/img/hero-poster.jpg`.
**Photos:** see `assets/img/README.txt` and the "Adding a real photo" note in `CLAUDE.md`.

## Deploy to GitHub Pages
1. Create a repo on GitHub and push this folder:
   ```bash
   git init && git add -A && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<you>/beijing-house.git
   git push -u origin main
   ```
2. GitHub → repo **Settings → Pages** → Source: **Deploy from a branch** → `main` / `/ (root)` → Save.
3. Site goes live at `https://<you>.github.io/beijing-house/` in a minute or two.

## Custom domain (currently on Wix)
You keep the domain; just repoint DNS — no transfer needed.
1. Settings → Pages → **Custom domain** → enter `beijinghousefl.com` → Save (this writes a `CNAME` file).
2. In your DNS host (Wix or wherever the domain's DNS lives), add:
   - `A` records for the apex → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
   - `CNAME` for `www` → `<you>.github.io`
3. Back in GitHub Pages, tick **Enforce HTTPS** once the cert issues.

> Note: if the domain's DNS is managed inside Wix, you change the records in the Wix domain dashboard. If a Wix *site* is currently published on it, you'll unpublish/repoint so the domain serves GitHub Pages instead.

## Alternative hosts (same files, friendlier for video/bandwidth)
- **Cloudflare Pages** or **Netlify** — drag-and-drop or connect the repo; free tier handles larger media better than GitHub Pages.
