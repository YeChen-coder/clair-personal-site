# Deploy — Clair Y.Chen personal site

Static assets plus one small Worker. No build step. Root contains `index.html`.

The main experience is a **literal illustrated orchard tree** (inline SVG): organic trunk, layered luminous canopy, clickable fruit (newest near the crown, older lower), McMaster SEP education in the soil/roots. Vanilla CSS + JS; no frameworks.

The "Ask Clair's AI" chat (`chat.js`, `chat.css`) posts to `/api/chat` and `/api/warm`. `worker.js` rate-limits those per IP and forwards them, SigV4-signed, to the chat Lambda on AWS (Bedrock knowledge base + Aurora pgvector; infrastructure lives in the `CloudAIAgentDemo` project). Every other path is served from the static assets.

## Deploy (Cloudflare Workers)

This site is a Worker with static assets (`wrangler.toml`), **not** Cloudflare Pages. From this directory:

```bash
npx wrangler deploy
```

`.assetsignore` keeps `worker.js`, `wrangler.toml`, `.dev.vars`, Markdown and work folders out of the published assets.

### Secrets

The Worker signs requests with the `clair-chat-worker` IAM user, which may only invoke the chat function URL:

```bash
npx wrangler secret put AWS_ACCESS_KEY_ID
npx wrangler secret put AWS_SECRET_ACCESS_KEY
```

`CHAT_FUNCTION_URL` and `AWS_REGION` are plain vars in `wrangler.toml`.

## Local preview

Put the same two keys in `.dev.vars` (git-ignored, never published), then:

```bash
npx wrangler dev --port 8787
```

Open `http://localhost:8787`. Hover/click fruit on the tree for project details (mobile: bottom sheet). Without `.dev.vars` the site works but the chat answers with an error.

## Notes

- Bilingual ZH/EN toggle uses `localStorage` (`clair-site-lang`). Default: Chinese. The chat follows the page language.
- Avatar: `assets/avatar.jpg`.
- Respects `prefers-reduced-motion` (skips ambience drift / fruit sway / canopy sway / falling leaves / scroll reveal).
