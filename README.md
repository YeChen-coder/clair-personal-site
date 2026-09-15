这个是 Grok Build 帮我做的、放在 Cloudflare 上的一个个人页面。之所以这边这么强调是哪个 AI 干的，必然有原因：对不起大家眼睛，页面上那棵树跟那些苹果实在是……我还是觉得有点精神污染。但是个人又觉得，无论辨识度还是记忆点上，它确实都达到了这样的程度，所以就先留着了。

This is a personal page that **Grok Bot** made for me, hosted on Cloudflare. And there is, of course, a reason I’m making such a point of saying exactly which AI made it: apologies to everyone’s eyes, but that tree and those apples on the page are… I still find them a little psychologically damaging. That said, I also have to admit that, in terms of both recognizability and memorability, they absolutely do the job. So for now, I’m keeping them. Sorry again....

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
