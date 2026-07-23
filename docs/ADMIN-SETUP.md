# Owner editing — one-time setup

Goal: the restaurant owner opens **`/admin`**, logs in with GitHub, and edits text /
photos / the menu PDF through a simple form. Saving commits to this repo and the site
redeploys automatically.

The CMS (Sveltia) is already in the repo (`admin/`). It talks to GitHub directly; the
only missing piece is a **free Cloudflare Worker** that handles the GitHub login popup.
Do these steps once.

---

## 1. Create a GitHub OAuth App
GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
- **Application name:** `Beijing House CMS`
- **Homepage URL:** your site URL (e.g. `https://imzjes.github.io/beijing-house-website/`
  or the final custom domain)
- **Authorization callback URL:** `https://<your-worker>.workers.dev/callback`
  (you'll get the worker subdomain in step 2 — you can edit this field afterward)

Click **Register**, then **Generate a new client secret**. Keep the **Client ID** and
**Client secret** handy.

## 2. Deploy the login worker (Cloudflare)
Use the maintained worker `sveltia-cms-auth`:
- One-click: https://github.com/sveltia/sveltia-cms-auth → "Deploy to Cloudflare" button, **or**
- CLI: clone it and `npx wrangler deploy`.

Then in the Cloudflare dashboard → your Worker → **Settings → Variables**, add:
- `GITHUB_CLIENT_ID` = the Client ID from step 1
- `GITHUB_CLIENT_SECRET` = the Client secret from step 1 (mark as **encrypted/secret**)
- `ALLOWED_DOMAINS` = your site host(s), e.g. `imzjes.github.io` (and your custom domain later)

Copy the worker's URL, e.g. `https://sveltia-cms-auth.<you>.workers.dev`.
Go back to the GitHub OAuth App (step 1) and make sure the callback URL is
`https://sveltia-cms-auth.<you>.workers.dev/callback`.

## 3. Point the CMS at the worker
Edit **`admin/config.yml`** → set:
```yaml
backend:
  base_url: https://sveltia-cms-auth.<you>.workers.dev
```
Commit + push.

## 4. Give the owner access
Repo → **Settings → Collaborators → Add people** → add the owner's GitHub username
(they'll need a free GitHub account). They accept the email invite.

## 5. Done
Owner visits `https://<site>/admin`, clicks **Login with GitHub**, and edits away.
Every Publish commits to `content/site.json` (or uploads a file to `assets/…`) and the
site rebuilds in ~30 seconds.

---

## Optional: move hosting to Cloudflare Pages
Better bandwidth for the hero video and one platform alongside the worker.
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** →
   pick `imzjes/beijing-house-website`.
2. Build settings: **Framework preset: None**, **Build command: (empty)**,
   **Output directory: `/`**. Deploy.
3. Add the custom domain there (repoint the Wix DNS as in the main `README.md`).
4. Add the Cloudflare Pages host to `ALLOWED_DOMAINS` on the worker.
You can keep GitHub Pages on at the same time, or turn it off in repo Settings → Pages.
