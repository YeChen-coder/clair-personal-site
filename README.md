# Clair Y. Chen — Personal Site (Orchard)

[Chinese version](README_zh.md)

**Orchard version:** https://clair-chen.yechenworking.workers.dev/

**Particle version:** https://clair-chen.pages.dev/

## The Story Behind the Design

The orchard version is a personal site built for me by **Grok Build** and hosted on Cloudflare. There is a reason I make a point of naming the AI responsible: my apologies to everyone's eyes, but the tree and apples on the page are... a little visually overwhelming. Still, I have to admit that the design is both distinctive and memorable, so I have kept it for now.

Later, after seeing a UI with a particle effect that flips from a profile image into the next scene, I built a second version. Despite that update, I still think the second version is far less distinctive than the apple tree:

- **Second version:** The sci-fi particle effects are more modern, and the copy is better—the second version was polished by a person, while the first version still contains raw AI-generated copy that I need to revise. It communicates information well, but its visual identity is weak and its memorability is close to zero because the design is too conventional.
- **First version:** The apple tree may be rough, but this is no longer the 1980s, when impressive animation was rare. Today, people see elaborate effects and cinematic transitions everywhere and have already grown tired of them.

What matters most is giving people something they will remember—provided, of course, that they remember it for the right reasons.

## About the Site

This is the personal site of [Clair Y. Chen](https://github.com/YeChen-coder): a literal illustrated fruit tree in which every apple represents a project.

The GitHub Pages profile URL, `YeChen-coder.github.io`, redirects to the orchard version.

## Stack

The site uses static HTML, CSS, and JavaScript and is hosted on the Cloudflare Workers free tier. No build step is required.

## Local Preview

```bash
python3 -m http.server 8765
# Open http://localhost:8765
```

## Deployment to Cloudflare

Upload the folder contents—or deploy them directly with Wrangler Pages or Workers—to the `clair-chen` Worker. Keep `index.html`, `styles.css`, `app.js`, and `assets/` together.
