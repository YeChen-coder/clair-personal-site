/* Ask-about-Clair chat: a floating button and panel that talk to /api/chat (worker.js). */
(() => {
  const TEXT = {
    zh: {
      open: "问问 Clair 的 AI",
      title: "关于 Clair，随便问",
      note: "AI 根据 Clair 的公开项目和网站内容回答，可能出错。可以贴一份 JD，看看 Clair 和职位的匹配度。",
      placeholder: "比如：Clair 做过哪些 RAG 项目？",
      send: "发送",
      close: "关闭",
      thinking: "正在翻资料…",
      waking: "数据库刚睡醒，第一次回答要多等十几秒…",
      long: "还在处理。JD 匹配会逐条查证，最多需要一分钟左右…",
      jdPlaceholder: "把职位描述（JD）整段粘贴到这里，然后发送…",
      sources: "参考：",
      limited: "问得太快啦，等一分钟再试。",
      daily: "为了控制运行成本，这个小站每天的提问数量有上限，今天的已经用完了。明天再来，或者直接去 GitHub 看看。",
      jdPaused: { weekly_limit: "JD 匹配本周额度已满（下周一恢复）", daily_limit: "JD 匹配今天额度已满（明天恢复）" },
      notePaused: {
        weekly_limit: "AI 根据 Clair 的公开项目和网站内容回答，可能出错。为了控制运行成本，JD 匹配每周有限额，本周已用完；其他问题照常回答，也可以把 JD 留言给 Clair，Clair 会亲自看。",
        daily_limit: "AI 根据 Clair 的公开项目和网站内容回答，可能出错。为了控制运行成本，JD 匹配每天有限额，今天已用完；其他问题照常回答，也可以把 JD 留言给 Clair，Clair 会亲自看。",
      },
      error: "出了点问题，稍后再试。",
      ticket: "留言编号：",
      photoAlt: "Clair 的猫",
      chips: ["Clair 做过哪些 RAG 项目？", { label: "用 JD 做匹配分析", paste: true }, "看看 Clair 的猫", "给 Clair 留言"],
      teaser: "嗨！可以问我 Clair 的项目、看看猫，或者贴一份 JD 测匹配度。",
      teaserClose: "关闭提示",
    },
    en: {
      open: "Ask Clair's AI",
      title: "Ask anything about Clair",
      note: "Answers come from Clair's public projects and this site. The AI can be wrong. Paste a job description to see how Clair fits.",
      placeholder: "e.g. What RAG projects has Clair built?",
      send: "Send",
      close: "Close",
      thinking: "Looking through the notes…",
      waking: "The database is waking up; the first answer takes ~15 seconds…",
      long: "Still working. A job-fit check verifies each requirement and can take up to a minute…",
      jdPlaceholder: "Paste the whole job description here, then send…",
      sources: "Sources: ",
      limited: "Too many questions at once. Try again in a minute.",
      daily: "To keep running costs down, this site answers a limited number of questions a day, and today's are used up. Come back tomorrow, or browse GitHub.",
      jdPaused: { weekly_limit: "Job-fit paused this week (back Monday)", daily_limit: "Job-fit paused today (back tomorrow)" },
      notePaused: {
        weekly_limit: "Answers come from Clair's public projects and this site. The AI can be wrong. To keep running costs down, job-fit checks have a weekly limit and this week's is used up. Everything else still works, or leave the job description as a message for Clair.",
        daily_limit: "Answers come from Clair's public projects and this site. The AI can be wrong. To keep running costs down, job-fit checks have a daily limit and today's is used up. Everything else still works, or leave the job description as a message for Clair.",
      },
      error: "Something went wrong. Please try again later.",
      ticket: "Message ticket: ",
      photoAlt: "One of Clair's cats",
      chips: ["What RAG projects has Clair built?", { label: "Match Clair to a job description", paste: true }, "Show me Clair's cats", "Leave a message for Clair"],
      teaser: "Hi! Ask me about Clair's projects, see the cats, or paste a job description to check the fit.",
      teaserClose: "Dismiss",
    },
  };
  const lang = () => (document.documentElement.lang || "").startsWith("zh") ? "zh" : "en";
  const t = (key) => TEXT[lang()][key];

  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <div class="chat-teaser" hidden>
      <p class="chat-teaser-text"></p>
      <button type="button" class="chat-teaser-close">×</button>
    </div>
    <button type="button" class="chat-fab" aria-expanded="false" aria-controls="chatPanel">
      <svg class="chat-fab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/><circle cx="8.5" cy="9.5" r="1.2" fill="var(--accent)"/><circle cx="12" cy="9.5" r="1.2" fill="var(--accent)"/><circle cx="15.5" cy="9.5" r="1.2" fill="var(--accent)"/></svg>
      <span class="chat-fab-label"></span>
    </button>
    <section class="chat-panel" id="chatPanel" role="dialog" aria-modal="false" hidden>
      <header class="chat-head">
        <h2 class="chat-title"></h2>
        <button type="button" class="chat-close">×</button>
      </header>
      <div class="chat-log" aria-live="polite"></div>
      <div class="chat-chips"></div>
      <form class="chat-form">
        <textarea class="chat-input" rows="1" maxlength="6000" required></textarea>
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
  let jobFit = "available"; // or "weekly_limit" / "daily_limit", as /api/warm reports

  function label() {
    root.querySelector(".chat-fab-label").textContent = t("open");
    root.querySelector(".chat-teaser-text").textContent = t("teaser");
    root.querySelector(".chat-teaser-close").setAttribute("aria-label", t("teaserClose"));
    root.querySelector(".chat-title").textContent = t("title");
    const paused = jobFit !== "available";
    root.querySelector(".chat-note").textContent = paused ? t("notePaused")[jobFit] : t("note");
    const close = root.querySelector(".chat-close");
    close.setAttribute("aria-label", t("close"));
    panel.setAttribute("aria-label", t("title"));
    input.placeholder = t("placeholder");
    send.textContent = t("send");
    chips.replaceChildren(...t("chips").map((chip) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat-chip";
      b.textContent = chip.label || chip;
      if (chip.paste && paused) {
        // Job-fit has hit its weekly or daily limit: say so up front instead of after a pasted JD.
        b.textContent = t("jdPaused")[jobFit];
        b.disabled = true;
        return b;
      }
      // A "paste" chip doesn't send anything: it asks for the job description in the input box.
      b.addEventListener("click", () => {
        if (!chip.paste) return ask(chip);
        input.placeholder = t("jdPlaceholder");
        input.rows = 4;
        input.focus();
      });
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
        fetch("/api/warm", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
          .then((res) => res.json())
          .then((data) => {
            if (data.job_fit && data.job_fit !== jobFit) { jobFit = data.job_fit; label(); }
          })
          .catch(() => {});
      }
    }
  }
  fab.addEventListener("click", () => { hideTeaser(); toggle(panel.hidden); });
  root.querySelector(".chat-close").addEventListener("click", () => { toggle(false); fab.focus(); });
  // Anything on the page with data-open-chat (the hero button) opens the panel.
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-chat]")) { e.preventDefault(); hideTeaser(); toggle(true); }
  });

  // One-time hint above the button, a few seconds after the first visit.
  const TEASER_KEY = "clair-chat-teaser-seen";
  const teaser = root.querySelector(".chat-teaser");
  function teaserSeen() {
    try { return localStorage.getItem(TEASER_KEY) === "1"; } catch { return false; }
  }
  function hideTeaser() {
    teaser.hidden = true;
    try { localStorage.setItem(TEASER_KEY, "1"); } catch { /* private mode: show again next time */ }
  }
  root.querySelector(".chat-teaser-close").addEventListener("click", hideTeaser);
  teaser.querySelector(".chat-teaser-text").addEventListener("click", () => { hideTeaser(); toggle(true); });
  if (!teaserSeen()) setTimeout(() => { if (panel.hidden) teaser.hidden = false; }, 2500);
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
    const slower = setTimeout(() => { pending.textContent = t("long"); }, 20000);
    try {
      let res;
      for (let attempt = 0; attempt < 2; attempt++) {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          // The agent reads at most 2,500 characters per past turn (HISTORY_CHARS in aws/agent/main.py),
          // so don't resend more than that with every follow-up.
          body: JSON.stringify({ question, history: history.slice(-6).map((h) => ({ ...h, text: h.text.slice(0, 2500) })) }),
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
        // After a job-fit analysis the agent returns the extracted requirements; remembering those
        // instead of the pasted job description keeps every requirement visible to follow-ups.
        history.push({ role: "user", text: data.history_text || question }, { role: "assistant", text: data.answer });
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
      clearTimeout(slower);
      input.rows = 1;
      input.placeholder = t("placeholder");
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
