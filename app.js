(() => {
  const STORAGE_KEY = "clair-site-lang";

  const projects = {
    ebo: {
      name: "EBOBotToDigitalPet",
      date: "2026-09",
      crown: true,
      tags: ["tag.companion", "IoT · AI"],
      whyKey: "p.ebo.why",
      links: [
        { href: "https://github.com/YeChen-coder/EBOBotToDigitalPet", labelKey: "link.repo" },
      ],
    },
    bionic: {
      name: "colorful-bionic-extension",
      date: "2026-09",
      tags: ["tag.extension", "ADHD"],
      whyKey: "p.bionic.why",
      links: [
        { href: "https://github.com/YeChen-coder/colorful-bionic-extension", labelKey: "link.repo" },
        {
          href: "https://microsoftedge.microsoft.com/addons/detail/colorful-bionic-reading/camgbnhlhdempnekobebpmdhechifjni",
          labelKey: "link.edge",
        },
      ],
    },
    bewithme: {
      name: "BeWithMe",
      date: "2026-08",
      tags: ["tag.companion", "voice · vision"],
      whyKey: "p.bewithme.why",
      links: [
        { href: "https://github.com/YeChen-coder/BeWithMe", labelKey: "link.repo" },
      ],
    },
    speaking: {
      name: "PTE-Speaking-exercise",
      date: "2026-08",
      tags: ["tag.speech", "PTE"],
      whyKey: "p.speaking.why",
      links: [
        { href: "https://github.com/YeChen-coder/PTE-Speaking-exercise", labelKey: "link.repo" },
      ],
    },
    wfd: {
      name: "PTE-WritingFromDictation-exercise",
      date: "2026-08",
      tags: ["tag.drill", "PTE"],
      whyKey: "p.wfd.why",
      links: [
        { href: "https://github.com/YeChen-coder/PTE-WritingFromDictation-exercise", labelKey: "link.repo" },
      ],
    },
    bobobei: {
      name: "bobobei-reverse",
      date: "2026-08",
      tags: ["tag.iot", "web UI"],
      whyKey: "p.bobobei.why",
      links: [
        { href: "https://github.com/YeChen-coder/bobobei-reverse", labelKey: "link.repo" },
      ],
    },
    resume: {
      name: "ResumeBuilder",
      date: "2026-08",
      tags: ["tag.tool", "tag.resume"],
      whyKey: "p.resume.why",
      links: [
        { href: "https://github.com/YeChen-coder/ResumeBuilder", labelKey: "link.repo" },
      ],
    },
    desk: {
      name: "SmartErgonomicLearningStation",
      date: "2025-09",
      tags: ["tag.cps", "SEP 769"],
      whyKey: "p.desk.why",
      links: [
        { href: "https://github.com/YeChen-coder/SmartErgonomicLearningStation", labelKey: "link.repo" },
      ],
    },
    rccar: {
      name: "RCCarRelated",
      date: "2025-04",
      tags: ["tag.embedded", "SEP 742"],
      whyKey: "p.rccar.why",
      links: [
        { href: "https://github.com/YeChen-coder/RCCarRelated", labelKey: "link.repo" },
      ],
    },
    animatch: {
      name: "AniMatch",
      date: "2025-03",
      tags: ["tag.game", "serverless"],
      whyKey: "p.animatch.why",
      links: [
        { href: "https://github.com/YeChen-coder/AniMatch", labelKey: "link.repo" },
      ],
    },
  };

  const strings = {
    zh: {
      skip: "跳到主要内容",
      "nav.tree": "树",
      "nav.soil": "根",
      "nav.about": "关于",
      "nav.github": "GitHub",
      "hero.eyebrow": "走一路干一路",
      "hero.manifesto":
        "技术门槛已经很低了。我更在乎的是：用 AI、自动化和代码，把真实流程里的摩擦抠掉，少让人做无意义的决策。",
      "hero.bio": "人生是旷野，可是代码是沼泽。所以，放过自己，折磨AI。",
      "hero.github": "在 GitHub 上看我",
      "hero.tree": "看看果树上的成果",
      "tree.eyebrow": "一路生长",
      "tree.title": "项目之树",
      "tree.lead":
        "树上每个果子都是路上抠掉的一点摩擦。树冠是最新的——往下更早。点一颗果子看看。",
      "tree.hint": "悬停或点击果子 · 树冠最大的是最新成果",
      "tree.tap": "点击查看",
      "tree.empty": "点树上的果子，看看这一路结出了什么。",
      "tree.svgTitle": "Clair 的项目果树",
      "tree.svgDesc":
        "一棵风格化的树：树干、树冠与枝条上挂着十颗代表项目的果子，最新的在树冠，最旧的靠近树根。",
      "crown.badge": "树冠 · 最新",
      why: "去掉什么摩擦",
      "tag.companion": "陪伴",
      "tag.extension": "浏览器扩展",
      "tag.speech": "语音",
      "tag.drill": "练习工具",
      "tag.iot": "IoT",
      "tag.tool": "本地工具",
      "tag.resume": "简历",
      "tag.cps": "赛博物理",
      "tag.embedded": "嵌入式",
      "tag.game": "派对游戏",
      "link.repo": "仓库",
      "link.edge": "Edge 商店",
      "p.ebo.why":
        "人回不去陪家人，远程自己又常没力气说话——把 EBO 做成能自己互动的 AI 陪伴机器人，少一点「今天要不要拨过去」的心累。",
      "p.bionic.why":
        "ADHD 阅读时注意力容易散——用可调颜色/高亮/字号减轻「怎么看才看得进去」的决策负担；本地离线，不登录不联网。",
      "p.bewithme.why":
        "陪伴实验：语音 + 视觉，试着让「有人在」不那么依赖人一直在线——和 EBO 同气连枝的探索。",
      "p.speaking.why":
        "非母语者练口语常没有外部纠正，错了自己都不知道——用 Azure Speech 给反馈，少猜「我到底读对没有」。",
      "p.wfd.why":
        "多点点击的听写练习太慢、节奏碎——回车即检、100+ 题 + 错题本，把流程摩擦压到最低。",
      "p.bobobei.why":
        "摸清家用硬件怎么被控——做一套网页 UI 实验，少一点「只能靠官方 App」的黑箱感。",
      "p.resume.why":
        "昂贵简历平台又贵又绕——本地素材库 + prompt→JSON 导入，少付平台税、少重复改同一段经历；不内嵌 AI API。",
      "p.desk.why":
        "坐站切换总要人记、人点——用 PIR + 树莓派 + PubNub + S3 仪表盘自动调桌高，把「该站了吗」从日常决策里拿掉（McMaster SEP 769）。",
      "p.rccar.why":
        "车道保持不能全靠人手——RC 车实验：少一点「眼要一直盯着线」的紧张（McMaster SEP 742）。",
      "p.animatch.why":
        "聚会时「谁来当裁判」太尴尬——无服务器动漫表情派对游戏，用 MediaPipe 比对相似度，裁判交给机器。",
      "soil.eyebrow": "土壤与根系",
      "soil.title": "根",
      "soil.lead": "果树扎在这片土里——不是闪光简历栏，是滋养树的底。",
      "soil.group.edu": "学历",
      "soil.group.exp": "经历",
      "soil.group.cert": "认证",
      "soil.edu.mcmaster.title": "McMaster University · 工程硕士（系统与技术）",
      "soil.edu.mcmaster.meta": "加拿大安大略省汉密尔顿 · 2026 年 4 月毕业",
      "soil.edu.mcmaster.sep":
        "附带养分：SEP 769（赛博物理 / 智能升降学习站）、SEP 742（RC 车车道保持）——树干下的课程实践，不是树上的果。",
      "soil.edu.cugb.title": "中国地质大学（北京）· 工学学士（计算机科学与技术）",
      "soil.edu.cugb.meta": "北京 · 2020 年 6 月结业",
      "soil.exp.ms.title": "Microsoft（经由 Wicresoft）· Azure 工程师",
      "soil.exp.ms.meta": "上海 · 2021 年 4 月 – 2024 年 8 月（3 年 5 个月）",
      "soil.exp.ms.desc":
        "Azure AI Bot Service、Microsoft Defender for Endpoint / Cloud 的技术支持与咨询；跨 Azure、Windows、Linux、macOS 排障与技术升级；曾在越南做知识传递与培训；累计处理 500+ 案例。",
      "soil.cert.aws.ml": "AWS Certified Machine Learning – Specialty",
      "soil.cert.aws.cp": "AWS Certified Cloud Practitioner",
      "soil.cert.pmp": "Project Management Professional (PMP)",
      "soil.cert.google": "Google Data Analytics",
      "about.eyebrow": "怎么干活",
      "about.title": "关于",
      "about.p1":
        "我是 Clair Y.Chen。走一路干一路：路上卡了就写点东西把摩擦抠掉——ADHD 阅读、PTE 备考、坐站桌、家用机器人陪伴，都是这么来的。",
      "about.p2":
        "这个时代技术入门已经不难了。我更在乎用 AI、自动化和代码，减少流程里的阻力，也少让人做那些耗神却没意义的决策。",
      "about.p3":
        "人生是旷野，代码是沼泽。所以放过自己，折磨 AI。反馈很重要：哪怕一个小工具能帮到别人，就值得发出来。",
      "about.cta": "在 GitHub 继续逛 →",
      "footer.note": "纯静态站点 · Cloudflare Workers / Pages",
      "panel.close": "关闭",
    },
    en: {
      skip: "Skip to main content",
      "nav.tree": "Tree",
      "nav.soil": "Roots",
      "nav.about": "About",
      "nav.github": "GitHub",
      "hero.eyebrow": "Build along the way",
      "hero.manifesto":
        "The technical bar is low now. What I care about more: using AI, automation, and code to scrape friction out of real workflows — and to spare people pointless decisions.",
      "hero.bio":
        "Life is a wilderness, but code is a swamp. So go easy on yourself — and torment the AI.",
      "hero.github": "See me on GitHub",
      "hero.tree": "See the fruits on the tree",
      "tree.eyebrow": "Growing along the way",
      "tree.title": "Project tree",
      "tree.lead":
        "Every fruit is a bit of friction scraped off along the way. The crown is newest — older fruits hang lower. Tap a fruit to look.",
      "tree.hint": "Hover or tap a fruit · the crown fruit is the newest",
      "tree.tap": "Click to open",
      "tree.empty": "Tap a fruit on the tree to see what grew along the way.",
      "tree.svgTitle": "Clair’s project fruit tree",
      "tree.svgDesc":
        "A stylized tree with trunk, canopy, and ten fruit representing projects — newest near the crown, oldest nearer the roots.",
      "crown.badge": "Crown · newest",
      why: "Friction removed",
      "tag.companion": "Companion",
      "tag.extension": "Browser extension",
      "tag.speech": "Speech",
      "tag.drill": "Practice tool",
      "tag.iot": "IoT",
      "tag.tool": "Local tool",
      "tag.resume": "Resume",
      "tag.cps": "Cyber-physical",
      "tag.embedded": "Embedded",
      "tag.game": "Party game",
      "link.repo": "Repo",
      "link.edge": "Edge Add-ons",
      "p.ebo.why":
        "Can't always be home with family, and remote days often leave no energy to talk — turn EBO into an AI companion robot that can interact on its own, less “should I call today?” fatigue.",
      "p.bionic.why":
        "ADHD reading scatters focus — tunable color, highlight, and size cut the decision load of “how do I even get through this page?” Offline; no login, no network.",
      "p.bewithme.why":
        "Companionship experiments: voice + vision — trying to make “someone’s there” less dependent on a person staying online. Kindred spirit with EBO.",
      "p.speaking.why":
        "Non-native speakers often lack external correction and miss their own errors — Azure Speech feedback so you stop guessing “did I say that right?”",
      "p.wfd.why":
        "Multi-click dictation practice was too slow and choppy — enter-to-check, 100+ items, and a mistake book to crush workflow friction.",
      "p.bobobei.why":
        "Figuring out how home hardware is controlled — a web UI experiment so you’re less stuck behind an official-app black box.",
      "p.resume.why":
        "Pricey resume platforms are expensive and fiddly — local experience library + prompt→JSON import, less platform tax and less rewriting the same bullets; no embedded AI API.",
      "p.desk.why":
        "Sit/stand switches that need remembering and clicking — PIR + Raspberry Pi + PubNub + S3 dashboard auto-adjusts height so “should I stand?” leaves the daily to-do list (McMaster SEP 769).",
      "p.rccar.why":
        "Lane-keeping shouldn’t mean eyes glued to the line — RC car experiment that eases that tension (McMaster SEP 742).",
      "p.animatch.why":
        "Party games where someone has to be the judge are awkward — serverless anime-expression party game; MediaPipe scores similarity so the machine is the referee.",
      "soil.eyebrow": "Soil & roots",
      "soil.title": "Roots",
      "soil.lead":
        "The fruit tree is rooted in this soil — not a flashy résumé block, just what feeds the tree.",
      "soil.group.edu": "Education",
      "soil.group.exp": "Experience",
      "soil.group.cert": "Certifications",
      "soil.edu.mcmaster.title":
        "McMaster University · Master of Engineering, Systems and Technology",
      "soil.edu.mcmaster.meta": "Hamilton, Ontario, Canada · Graduated April 2026",
      "soil.edu.mcmaster.sep":
        "Lighter nutrient: SEP 769 (Cyber Physical Systems / smart ergonomic learning station), SEP 742 (RC car lane keep) — coursework under the trunk, not fruit in the crown.",
      "soil.edu.cugb.title":
        "China University of Geosciences, Beijing · Bachelor of Engineering, Computer Science and Technology",
      "soil.edu.cugb.meta": "Beijing, China · Ended June 2020",
      "soil.exp.ms.title": "Microsoft (via Wicresoft) · Azure Engineer",
      "soil.exp.ms.meta": "Shanghai · April 2021 – August 2024 (3 years 5 months)",
      "soil.exp.ms.desc":
        "Technical support and consulting on Azure AI Bot Service and Microsoft Defender for Endpoint / Cloud; troubleshooting across Azure, Windows, Linux, and macOS; technical escalations; knowledge transfer and training in Vietnam; 500+ resolved cases.",
      "soil.cert.aws.ml": "AWS Certified Machine Learning – Specialty",
      "soil.cert.aws.cp": "AWS Certified Cloud Practitioner",
      "soil.cert.pmp": "Project Management Professional (PMP)",
      "soil.cert.google": "Google Data Analytics",
      "about.eyebrow": "How I work",
      "about.title": "About",
      "about.p1":
        "I'm Clair Y.Chen. I build along the journey: when something jams the path, I write a little thing to scrape the friction off — ADHD reading, PTE prep, a sit/stand desk, a home-robot companion. That's the pattern.",
      "about.p2":
        "Getting into tech is easy enough these days. I care more about using AI, automation, and code to cut resistance in real workflows — and to spare people decisions that drain you for nothing.",
      "about.p3":
        "Life is a wilderness; code is a swamp. Go easy on yourself, torment the AI. Feedback matters: if a tiny tool helps someone, it's worth shipping.",
      "about.cta": "Keep exploring on GitHub →",
      "footer.note": "Static site · Cloudflare Workers / Pages",
      "panel.close": "Close",
    },
  };

  const toggle = document.getElementById("langToggle");
  const label = toggle?.querySelector(".lang-label");
  const layout = document.querySelector(".orchard-layout");
  const panel = document.getElementById("fruitPanel");
  const tooltip = document.getElementById("fruitTooltip");
  const backdrop = document.getElementById("sheetBackdrop");
  const panelClose = document.getElementById("panelClose");
  const treeStage = document.getElementById("treeStage");
  const fruits = document.querySelectorAll(".fruit");

  let lang = "zh";
  let activeId = null;
  let hoverId = null;

  function t(key) {
    const dict = strings[lang] || strings.zh;
    return dict[key] != null ? dict[key] : key;
  }

  function resolveTag(tag) {
    if (tag.startsWith("tag.")) return t(tag);
    return tag;
  }

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
    return "zh";
  }

  function applyLang(next) {
    lang = next;
    const dict = strings[lang] || strings.zh;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key] != null) {
        el.textContent = dict[key];
      }
    });
    if (label) label.textContent = lang === "zh" ? "EN" : "中文";
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        lang === "zh" ? "Switch to English" : "切换到中文"
      );
    }
    if (panelClose) {
      panelClose.setAttribute("aria-label", t("panel.close"));
    }
    localStorage.setItem(STORAGE_KEY, lang);
    if (activeId) fillPanel(activeId);
    updateFruitAria();
  }

  function updateFruitAria() {
    fruits.forEach((el) => {
      const id = el.getAttribute("data-id");
      const p = projects[id];
      if (!p) return;
      el.setAttribute("aria-label", `${p.name}, ${p.date}`);
      el.setAttribute("aria-pressed", activeId === id ? "true" : "false");
    });
  }

  function isMobileSheet() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function fillPanel(id) {
    const p = projects[id];
    if (!p || !panel) return;

    const badge = document.getElementById("panelBadge");
    const dateEl = document.getElementById("panelDate");
    const titleEl = document.getElementById("panelTitle");
    const tagsEl = document.getElementById("panelTags");
    const whyEl = document.getElementById("panelWhy");
    const linksEl = document.getElementById("panelLinks");

    if (badge) badge.textContent = p.crown ? t("crown.badge") : "";
    if (dateEl) {
      dateEl.textContent = p.date;
      dateEl.setAttribute("datetime", p.date);
    }
    if (titleEl) titleEl.textContent = p.name;
    if (whyEl) whyEl.textContent = t(p.whyKey);

    if (tagsEl) {
      tagsEl.innerHTML = "";
      p.tags.forEach((tag, i) => {
        const span = document.createElement("span");
        span.className = i === 0 ? "tag" : "tag tag-soft";
        span.textContent = resolveTag(tag);
        tagsEl.appendChild(span);
      });
    }

    if (linksEl) {
      linksEl.innerHTML = "";
      p.links.forEach((link) => {
        const a = document.createElement("a");
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = t(link.labelKey);
        linksEl.appendChild(a);
      });
    }
  }

  function openPanel(id) {
    const p = projects[id];
    if (!p) return;
    activeId = id;
    fillPanel(id);
    layout?.classList.add("has-selection");
    panel?.removeAttribute("hidden");
    panel?.classList.add("is-open");

    fruits.forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-id") === id);
    });
    updateFruitAria();

    if (isMobileSheet()) {
      backdrop?.removeAttribute("hidden");
      backdrop?.classList.add("is-open");
      document.body.classList.add("sheet-open");
    }

    hideTooltip();
  }

  function closePanel() {
    activeId = null;
    layout?.classList.remove("has-selection");
    panel?.classList.remove("is-open");
    panel?.setAttribute("hidden", "");
    backdrop?.classList.remove("is-open");
    backdrop?.setAttribute("hidden", "");
    document.body.classList.remove("sheet-open");
    fruits.forEach((el) => el.classList.remove("is-active"));
    updateFruitAria();
  }

  function showTooltip(id, clientX, clientY) {
    if (isMobileSheet() || !tooltip || !treeStage) return;
    const p = projects[id];
    if (!p) return;
    hoverId = id;
    const dateEl = tooltip.querySelector(".tooltip-date");
    const nameEl = tooltip.querySelector(".tooltip-name");
    if (dateEl) dateEl.textContent = p.date;
    if (nameEl) nameEl.textContent = p.name;
    tooltip.hidden = false;

    const rect = treeStage.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function hideTooltip() {
    hoverId = null;
    if (tooltip) tooltip.hidden = true;
  }

  // Fruit events
  fruits.forEach((el) => {
    const id = el.getAttribute("data-id");

    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (activeId === id && isMobileSheet()) {
        closePanel();
      } else {
        openPanel(id);
      }
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPanel(id);
      }
      if (e.key === "Escape") closePanel();
    });

    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      showTooltip(id, e.clientX, e.clientY);
    });

    el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || hoverId !== id) return;
      showTooltip(id, e.clientX, e.clientY);
    });

    el.addEventListener("pointerleave", () => {
      hideTooltip();
    });
  });

  panelClose?.addEventListener("click", closePanel);
  backdrop?.addEventListener("click", closePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeId) closePanel();
  });

  window.addEventListener("resize", () => {
    if (!isMobileSheet()) {
      backdrop?.classList.remove("is-open");
      backdrop?.setAttribute("hidden", "");
      document.body.classList.remove("sheet-open");
      if (activeId) {
        panel?.removeAttribute("hidden");
        panel?.classList.add("is-open");
        layout?.classList.add("has-selection");
      }
    } else if (activeId) {
      backdrop?.removeAttribute("hidden");
      backdrop?.classList.add("is-open");
      document.body.classList.add("sheet-open");
    }
  });

  // Lang
  lang = getInitialLang();
  applyLang(lang);

  toggle?.addEventListener("click", () => {
    applyLang(lang === "zh" ? "en" : "zh");
  });

  // Sticky header
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reveal roots
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }
})();
