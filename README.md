# Clair Y.Chen — personal site (orchard)

Personal site for [Clair Y.Chen](https://github.com/YeChen-coder): a literal illustrated fruit tree where each apple is a project.

**Live:** https://clair-chen.yechenworking.workers.dev/  
**GitHub Pages profile URL** (`YeChen-coder.github.io`) redirects here.

## Stack

Static HTML / CSS / JS. Hosted on Cloudflare Workers (free tier). No build step required.

## Local preview

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

## Deploy (Cloudflare)

Upload the folder contents (or use Wrangler Pages/Workers direct upload) to the `clair-chen` Worker. Keep `index.html`, `styles.css`, `app.js`, and `assets/` together.
