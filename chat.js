/* Ask-about-Clair chat: a floating button and panel that talk to /api/chat (worker.js). */
(() => {
  const TEXT = {
    zh: {
      open: "问问 Clair 的 AI",
      title: "关于 Clair，随便问",
      note: "AI 根据 Clair 的公开项目和网站内容回答，可能出错。",
      placeholder: "比如：Clair 做过哪些 RAG 项目？",
      send: "发送",
      close: "关闭",
      thinking: "正在翻资料…",
      waking: "数据库刚睡醒，第一次回答要多等十几秒…",
      sources: "参考：",
      limited: "问得太快啦，等一分钟再试。",
      daily: "今天的提问额度用完了，明天再来，或者直接去 GitHub 看看。",
      error: "出了点问题，稍后再试。",
      ticket: "留言编号：",
      photoAlt: "Clair 的猫",
      chips: ["Clair 做过哪些 RAG 项目？", "Clair 用过哪些 AWS 服务？", "看看 Clair 的猫", "给 Clair 留言"],
    },
    en: {
      open: "Ask Clair's AI",
      title: "Ask anything about Clair",
      note: "Answers come from Clair's public projects and this site. The AI can be wrong.",
      placeholder: "e.g. What RAG projects has Clair built?",
      send: "Send",
      close: "Close",
      thinking: "Looking through the notes…",
      waking: "The database is waking up; the first answer takes ~15 seconds…",
      sources: "Sources: ",
      limited: "Too many questions at once. Try again in a minute.",
      daily: "Today's question quota is used up. Come back tomorrow, or browse GitHub.",
      error: "Something went wrong. Please try again later.",
      ticket: "Message ticket: ",
      photoAlt: "One of Clair's cats",
      chips: ["What RAG projects has Clair built?", "Which AWS services has Clair used?", "Show me Clair's cats", "Leave a message for Clair"],
    },
  };
  const lang = () => (document.documentElement.lang || "").startsWith("zh") ? "zh" : "en";
  const t = (key) => TEXT[lang()][key];

  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <button type="button" class="chat-fab" aria-expanded="false" aria-controls="chatPanel">
      <span class="chat-fab-dot" aria-hidden="true"></span><span class="chat-fab-label"></span>
    </button>
    <section class="chat-panel" id="chatPanel" role="dialog" aria-modal="false" hidden>
      <header class="chat-head">
        <h2 class="chat-title"></h2>
        <button type="button" class="chat-close">×</button>
      </header>
      <div class="chat-log" aria-live="polite"></div>
      <div class="chat-chips"></div>
      <form class="chat-form">
        <textarea class="chat-input" rows="1" maxlength="500" required></textarea>
        <button type="submit" class="chat-send"></button>
      </form>
      <p class="chat-note"></p>
    </section>`;
  document.body.appendChild(root);

  const fab = root.querySelector(".chat-fab");
  const panel = root.querySelector(".chat-panel");
  const log = root.querySelector(".chat-log");
  const chips = root.querySelector(".chat-chips");
  const form = root.querySelector(".chat-form");
  const input = root.querySelector(".chat-input");
  const send = root.querySelector(".chat-send");
  const history = [];
  let busy = false;
  let warmedAt = 0;

  function label() {
    root.querySelector(".chat-fab-label").textContent = t("open");
    root.querySelector(".chat-title").textContent = t("title");
    root.querySelector(".chat-note").textContent = t("note");
    const close = root.querySelector(".chat-close");
    close.setAttribute("aria-label", t("close"));
    panel.setAttribute("aria-label", t("title"));
    input.placeholder = t("placeholder");
    send.textContent = t("send");
    chips.replaceChildren(...t("chips").map((q) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat-chip";
      b.textContent = q;
      b.addEventListener("click", () => ask(q));
      return b;
    }));
    chips.hidden = history.length > 0;
  }
  label();
  new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  function toggle(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    root.classList.toggle("is-open", open);
    if (open) {
      input.focus();
      // The database pauses when idle; start waking it while the visitor types.
      if (Date.now() - warmedAt > 4 * 60 * 1000) {
        warmedAt = Date.now();
        fetch("/api/warm", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).catch(() => {});
      }
    }
  }
  fab.addEventListener("click", () => toggle(panel.hidden));
  root.querySelector(".chat-close").addEventListener("click", () => { toggle(false); fab.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { toggle(false); fab.focus(); } });

  function bubble(role, text) {
    const el = document.createElement("div");
    el.className = `chat-msg chat-${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  // Answers are plain text; turn bare URLs into links without ever parsing HTML.
  function setAnswer(el, text) {
    el.replaceChildren();
    const cleaned = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, "$1 $2");
    cleaned.split(/(https?:\/\/[^\s)）。，,]+)/).forEach((part, i) => {
      if (i % 2) {
        const a = document.createElement("a");
        a.href = part;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = part.replace(/^https?:\/\/(www\.)?/, "");
        el.appendChild(a);
      } else if (part) {
        el.append(part);
      }
    });
  }

  function addSources(el, sources) {
    if (!sources?.length) return;
    const p = document.createElement("p");
    p.className = "chat-sources";
    p.append(t("sources"));
    sources.forEach((s, i) => {
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = s.title;
      if (i) p.append(" · ");
      p.append(a);
    });
    el.appendChild(p);
  }

  // Only photos served from the site's own AWS bucket are shown.
  function addPhoto(el, image) {
    if (!image?.url) return;
    let url;
    try { url = new URL(image.url); } catch { return; }
    if (url.protocol !== "https:" || !url.hostname.endsWith(".amazonaws.com")) return;
    const img = document.createElement("img");
    img.className = "chat-photo";
    img.alt = t("photoAlt");
    img.src = url.href;
    img.addEventListener("load", () => { log.scrollTop = log.scrollHeight; });
    el.appendChild(img);
  }

  function addTicket(el, ticket) {
    if (!ticket) return;
    const p = document.createElement("p");
    p.className = "chat-sources";
    p.textContent = t("ticket") + ticket;
    el.appendChild(p);
  }

  async function ask(question) {
    question = question.trim();
    if (!question || busy) return;
    busy = true;
    send.disabled = true;
    chips.hidden = true;
    bubble("user", question);
    const pending = bubble("bot", t("thinking"));
    pending.classList.add("is-pending");
    const slow = setTimeout(() => { pending.textContent = t("waking"); }, 5000);
    try {
      let res;
      for (let attempt = 0; attempt < 2; attempt++) {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question, history: history.slice(-6) }),
        });
        if (res.status !== 503) break;
      }
      const data = await res.json().catch(() => ({}));
      pending.classList.remove("is-pending");
      if (res.ok && data.answer) {
        setAnswer(pending, data.answer);
        addPhoto(pending, data.image);
        addTicket(pending, data.ticket);
        addSources(pending, data.sources);
        history.push({ role: "user", text: question }, { role: "assistant", text: data.answer });
      } else {
        pending.classList.add("is-error");
        pending.textContent = data.error === "daily_limit" ? t("daily")
          : res.status === 429 ? t("limited") : t("error");
      }
    } catch {
      pending.classList.remove("is-pending");
      pending.classList.add("is-error");
      pending.textContent = t("error");
    } finally {
      clearTimeout(slow);
      busy = false;
      send.disabled = false;
      log.scrollTop = log.scrollHeight;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = "";
    ask(q);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
