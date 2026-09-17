# Clair Y. Chen — 个人网站（果园）

[English version](README.md)

**苹果树版：** https://clair-chen.yechenworking.workers.dev/

**粒子效果版：** https://clair-chen.pages.dev/

## 设计背后的想法

苹果树版是 Grok Build 帮我做的、放在 Cloudflare 上的个人页面。之所以在这里特意强调是哪个 AI 做的，当然是有原因的：对不起大家的眼睛，页面上那棵树和那些苹果实在是……我还是觉得有点精神污染。但从辨识度和记忆点来看，它又确实达到了效果，所以就先留着了。

后来因为看到了喜欢的头像转场粒子效果 UI，我又写了第二版。可我仍然觉得，在辨识度方面，第二版远远不如苹果树：

- **第二版：** sci-fi 粒子效果确实更 modern，文案也更好——第二版文案专门找人润色过，不像第一版直接用了 AI 生成的生肉，第一版之后还得再改。它的信息传达做得不错，但辨识度很差，记忆度基本为零，整体太常规了。
- **第一版：** 苹果树虽然有点拉，但现在毕竟不是上世纪 80 年代。那时炫酷动画很稀少，而到了今天，各种特效、大场面和转场已经随处可见，大家早就 get tired of it 了。

最重要的还是让人记得吧——当然，是以不会让人反感的方式被记住。

## 关于这个网站

这是 [Clair Y. Chen](https://github.com/YeChen-coder) 的个人网站：一棵真正画出来的果树，每个苹果代表一个项目。

GitHub Pages 个人主页地址 `YeChen-coder.github.io` 会重定向到苹果树版。

## 技术栈

网站使用静态 HTML、CSS 和 JavaScript，部署在 Cloudflare Workers 免费套餐上，不需要构建步骤。

## 本地预览

```bash
python3 -m http.server 8765
# 打开 http://localhost:8765
```

## 部署到 Cloudflare

将文件夹内容上传到 `clair-chen` Worker，也可以使用 Wrangler Pages 或 Workers 直接上传。请将 `index.html`、`styles.css`、`app.js` 和 `assets/` 放在一起。
