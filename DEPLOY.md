# Deploy — Clair Y.Chen personal site

Pure static assets. No build step. Root contains `index.html`.

The main experience is a **literal illustrated orchard tree** (inline SVG): organic trunk, layered luminous canopy, ten clickable fruit (newest near the crown, older lower), McMaster SEP education in the soil/roots. Vanilla CSS + JS; no frameworks.

## Cloudflare Pages (recommended)

### Option A — Drag & drop

1. Open [Cloudflare Pages](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Upload the entire contents of this folder (`index.html`, `styles.css`, `app.js`, `assets/`, etc.).
3. Deploy. You get a `*.pages.dev` URL. No custom domain needed.

### Option B — Wrangler CLI

From this directory:

```bash
npx wrangler pages deploy .
```

### Option C — Workers

If already bound as a Worker static site, redeploy with `./deploy.sh` if configured.

## Local preview

```bash
cd /workspace/clair-personal-site
python3 -m http.server 8765
```

Then open `http://localhost:8765`. Hover/click fruit on the tree for project details (mobile: bottom sheet).

## Notes

- Bilingual ZH/EN toggle uses `localStorage` (`clair-site-lang`). Default: Chinese.
- Avatar: `assets/avatar.jpg`.
- No backend, no environment secrets required.
- Respects `prefers-reduced-motion` (skips ambience drift / fruit sway / canopy sway / falling leaves / scroll reveal).
