https://clair-chen.yechenworking.workers.dev 这个是 Grok Build 帮我做的、放在 Cloudflare 上的个人页面。之所以这边这么强调是哪个 AI 干的，必然有原因：对不起大家眼睛，页面上那棵树跟那些苹果实在是……我还是觉得有点精神污染。但是个人又觉得，无论辨识度还是记忆点上，它确实都达到了这样的程度，所以就先留着了。-补：因为看到了喜欢的头像转头翻场的粒子效果的UI，所以在这边又写了一版。https://clair-chen.pages.dev/

但我觉得在辨识度方面，第二版真的远远不如苹果树：

• 第二版：你要说 sci-fi 的粒子效果，确实更 modern 一些，而且文案也更好（第二版文案专门找了人润色，不像第一版直接用 AI 生成的生肉，第一版回头还得改）。但辨识度上很差，信息提供很好，可是记忆度基本为0，太常规了。

• 第一版：苹果树虽然拉，但在现在这个社会，毕竟不是上世纪 80 年代，那时候炫酷的动画效果实现是稀少的，可是站在现在， 各种特效各种大场面转场，大家早就 get tired of it。

能让人记得才是最重要的吧（当然指的是非反感的能记得）

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
