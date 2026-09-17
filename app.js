(() => {
  const STORAGE_KEY = "clair-site-lang";

  const projects = {
    cloud: {
      name: "EboBotOnAWSCloud",
      date: "2026-09",
      crown: true,
      tierKey: "tier.production",
      tags: ["tag.cloud", "AWS · Fargate · SRE"],
      summaryKey: "p.cloud.summary",
      proofKey: "p.cloud.proof",
      links: [
        { href: "https://github.com/YeChen-coder/EboBotOnAWSCloud", labelKey: "link.repo" },
      ],
    },
    ebo: {
      name: "EBOBotToDigitalPet",
      date: "2026-09",
      tierKey: "tier.flagship",
      tags: ["tag.aiiot", "OpenAI Realtime · RTSP"],
      summaryKey: "p.ebo.summary",
      proofKey: "p.ebo.proof",
      links: [
        { href: "https://github.com/YeChen-coder/EBOBotToDigitalPet", labelKey: "link.repo" },
      ],
    },
    resume: {
      name: "ResumeBuilder",
      date: "2026-09",
      tierKey: "tier.product",
      tags: ["tag.fullstack", "TypeScript · React · Drizzle"],
      summaryKey: "p.resume.summary",
      proofKey: "p.resume.proof",
      links: [
        { href: "https://github.com/YeChen-coder/ResumeBuilder", labelKey: "link.repo" },
      ],
    },
    bionic: {
      name: "colorful-bionic-extension",
      date: "2026-09",
      tierKey: "tier.shipped",
      tags: ["tag.extension", "Accessibility · Playwright"],
      summaryKey: "p.bionic.summary",
      proofKey: "p.bionic.proof",
      links: [
        { href: "https://github.com/YeChen-coder/colorful-bionic-extension", labelKey: "link.repo" },
        {
          href: "https://microsoftedge.microsoft.com/addons/detail/colorful-bionic-reading/camgbnhlhdempnekobebpmdhechifjni",
          labelKey: "link.edge",
        },
      ],
    },
    windows: {
      name: "Windows-app-restriction",
      date: "2026-08",
      tierKey: "tier.system",
      tags: ["tag.desktop", "Python · Win32"],
      summaryKey: "p.windows.summary",
      proofKey: "p.windows.proof",
      links: [
        { href: "https://github.com/YeChen-coder/Windows-app-restriction", labelKey: "link.repo" },
      ],
    },
    foci: {
      name: "foci-reverse",
      date: "2026-08",
      tierKey: "tier.reverse",
      tags: ["tag.reverse", "BLE · aiohttp · bleak"],
      summaryKey: "p.foci.summary",
      proofKey: "p.foci.proof",
      links: [
        { href: "https://github.com/YeChen-coder/foci-reverse", labelKey: "link.repo" },
      ],
    },
    speaking: {
      name: "PTE-Speaking-exercise",
      date: "2026-08",
      tierKey: "tier.product",
      tags: ["tag.speech", "Azure Speech · Flask"],
      summaryKey: "p.speaking.summary",
      proofKey: "p.speaking.proof",
      links: [
        { href: "https://github.com/YeChen-coder/PTE-Speaking-exercise", labelKey: "link.repo" },
      ],
    },
    desk: {
      name: "SmartErgonomicLearningStation",
      date: "2025-09",
      tierKey: "tier.team",
      tags: ["tag.cps", "Raspberry Pi · PubNub · S3"],
      summaryKey: "p.desk.summary",
      proofKey: "p.desk.proof",
      links: [
        { href: "https://github.com/YeChen-coder/SmartErgonomicLearningStation", labelKey: "link.repo" },
      ],
    },
    rccar: {
      name: "RCCarRelated",
      date: "2025-04",
      tierKey: "tier.robotics",
      tags: ["tag.robotics", "Computer Vision · PID"],
      summaryKey: "p.rccar.summary",
      proofKey: "p.rccar.proof",
      links: [
        { href: "https://github.com/YeChen-coder/RCCarRelated", labelKey: "link.repo" },
      ],
    },
    animatch: {
      name: "AniMatch",
      date: "2025-03",
      tierKey: "tier.serverless",
      tags: ["tag.cv", "Lambda · ECR · MediaPipe"],
      summaryKey: "p.animatch.summary",
      proofKey: "p.animatch.proof",
      links: [
        { href: "https://github.com/YeChen-coder/AniMatch", labelKey: "link.repo" },
      ],
    },
  };

  const strings = {
    zh: {
      skip: "跳到主要内容",
      "nav.tree": "项目",
      "nav.soil": "背景",
      "nav.about": "关于",
      "nav.github": "GitHub",
      "hero.eyebrow": "云、AI，以及一些真的会出问题的东西",
      "hero.manifesto":
        "我是 Clair。平时会把 AI、云服务和各种现实设备接起来，做一些自己真的想用、也确实一直在用的东西。它们不一定非得聪明，但最好能在断网、重启和我懒得管它的时候，继续好好活着。",
      "hero.bio": "人生是旷野，可是代码是沼泽。能用就用，不能用就改；请放过自己，去折磨 AI。",
      "hero.github": "浏览 GitHub",
      "hero.tree": "查看精选项目",
      "tree.eyebrow": "精选项目",
      "tree.title": "选择一颗果实",
      "tree.lead":
        "果实不按热闹程度排列，而按它能证明的能力生长：越靠近树冠，系统越复杂、落地越完整。",
      "tree.hint": "悬停看名称 · 点击查看工程细节",
      "tree.tap": "点击查看",
      "tree.empty": "点树上的果子，看看这一路结出了什么。",
      "tree.svgTitle": "Clair 的项目果树",
      "tree.svgDesc":
        "一棵暮色中的项目树，十颗红色果实按工程复杂度与落地完成度分布在树冠和枝条之间。",
      "crown.badge": "树冠 · 主项目",
      "project.summary": "做了什么",
      "project.proof": "工程证据",
      "tier.production": "生产化 / 云端",
      "tier.flagship": "主项目 / 多模态",
      "tier.shipped": "已上架",
      "tier.system": "系统工具",
      "tier.reverse": "逆向工程",
      "tier.product": "产品工程",
      "tier.robotics": "机器人控制",
      "tier.serverless": "无服务器架构",
      "tier.team": "团队课程项目",
      "tag.cloud": "云与可观测性",
      "tag.aiiot": "AI · IoT",
      "tag.fullstack": "全栈产品",
      "tag.extension": "浏览器扩展",
      "tag.speech": "语音",
      "tag.desktop": "Windows 桌面",
      "tag.reverse": "蓝牙逆向",
      "tag.cps": "赛博物理",
      "tag.robotics": "机器人",
      "tag.cv": "计算机视觉",
      "link.repo": "仓库",
      "link.edge": "Edge 商店",
      "p.cloud.summary": "把本地家庭机器人系统迁到 AWS Fargate：同一 Task 内运行 Engine 与 Realtime Assistant，以 EFS 持久化、Secrets Manager 注入配置，并用 CloudWatch 建立结构化可观测性。",
      "p.cloud.proof": "完成 1 vCPU / 2 GiB 的降配与成本核算；55 项 Assistant、115 项 Engine、8 项云端测试覆盖断网启动、健康检查、SIGTERM、日志与部署边界。",
      "p.ebo.summary": "把 EBO 私有云协议转成标准 RTSP / HTTP，再接入 Home Assistant 与 OpenAI Realtime，形成可长期运行的音频、视觉与机器人扬声器闭环。",
      "p.ebo.proof": "运动门控选帧、100ms 音频桥、流式回复与插话、55 分钟会话交接、断网记忆、持久化转写，以及媒体级健康检查均已端到端跑通。",
      "p.resume.summary": "隐私优先的本地简历工作台：把经历拆成可复用素材，支持职位描述匹配、prompt→JSON 导入、可视化编辑与 Word 导出。",
      "p.resume.proof": "TypeScript、React、Drizzle 与 Vinext 构成完整应用；不需要账号、云数据库或 AI API，并有构建、渲染 HTML 与 Word 导出测试。",
      "p.bionic.summary": "为 ADHD 阅读者做的 Edge 扩展：可调颜色、高亮比例、字号与字重；无需登录，不联网，设置只保存在浏览器本地。",
      "p.bionic.proof": "已发布到 Edge Add-ons。实现长页面分批处理、动态正文监听、DOM / 事件保留与旧设置迁移，并用单元测试和 Playwright 验证。",
      "p.windows.summary": "面向 Windows 的注意力边界工具：按前台时间或进程运行时间计时，支持日程、一次性限制、关闭或遮罩，以及冷却期。",
      "p.windows.proof": "覆盖进程与窗口选择、跨日计划、状态持久化、危险系统进程拦截、模糊文本确认与崩溃日志；为真实的多窗口使用方式设计。",
      "p.foci.summary": "对停产的 FOCI 专注力穿戴设备做 BLE 协议逆向，把实时状态、认证与控制从手机 App 搬到本地网页。",
      "p.foci.proof": "Python、bleak 与 aiohttp 驱动；包含可复现协议文档、脱敏抓包、隐私审计、无设备 Demo 模式和自动化测试。",
      "p.speaking.summary": "把 PTE 口语练习拆成跟读、自由表达和难词三条工作流，用 Azure Speech 提供发音、流利度、语速与音调反馈。",
      "p.speaking.proof": "实现固定音频缓存、本地题库、快捷键与手柄控制，以及可重复的录音—评估—反馈管线，减少练习中的等待与重复点击。",
      "p.desk.summary": "用 PIR、树莓派、继电器与 PubNub 控制升降桌，并把坐站与在席数据同步到 S3 仪表盘（McMaster SEP 769 团队项目）。",
      "p.desk.proof": "涵盖物理安全控制、本地日志、定时云端同步、远程控制和行为可视化；仓库含演示视频与可运行界面。",
      "p.rccar.summary": "基于摄像头的 RC 车车道保持系统，以视觉管线与 PID 控制转向，并提供自动、测试和逐步调试模式。",
      "p.rccar.proof": "在真实硬件上完成闭环驾驶，参数化速度、帧率与转向权重；仓库提供演示视频、硬件规格和完整项目报告。",
      "p.animatch.summary": "无服务器动漫表情模仿游戏：用户上传照片后，以 MediaPipe 面部关键点计算与随机动漫表情的相似度。",
      "p.animatch.proof": "由 2 个 Lambda、ECR 中的自建 MediaPipe 容器、2 个 S3 Bucket 与 API Gateway 组成，覆盖模型打包、存储、API 与前端。",
      "soil.eyebrow": "经历与基础",
      "soil.title": "根系",
      "soil.lead": "把项目做深的，不只有技术栈：还有云端排障、跨平台支持、工程教育与持续学习。",
      "soil.group.edu": "学历",
      "soil.group.exp": "经历",
      "soil.group.cert": "认证",
      "soil.edu.mcmaster.title": "McMaster University · 工程硕士（系统与技术）",
      "soil.edu.mcmaster.meta": "加拿大安大略省汉密尔顿 · 2026 年 4 月毕业",
      "soil.edu.mcmaster.sep":
        "课程实践延伸至赛博物理系统与车辆控制；相关成果也在项目树中展示。",
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
      "about.eyebrow": "一些不太正式的自我介绍",
      "about.title": "关于我",
      "about.p1":
        "我是 Clair Y.Chen。之前做过 Azure 技术支持，后来又去读了工程硕士。现在做的东西跨度有点大：从云上的 Fargate、LLM Realtime，到蓝牙逆向、Windows 小工具和会自己说话的家用机器人。共同点倒是很简单——它们都来自我生活里某个已经烦到不能再装看不见的问题。",
      "about.p2":
        "我不太相信“做个 demo 就算完成”。东西第一次跑起来，通常只是麻烦的开始：断网会怎样，容器重启会怎样，日志够不够看，家里人会不会误触，成本会不会越跑越肉疼。就是这些不太光鲜的边边角角，反而最容易让我一直折腾下去。",
      "about.p3":
        "我也不太想把 AI 写成魔法。它很好用，也很诱人，甚至很容易让人误以为什么都已经变简单了。但一旦真的把它接进生活，边界、兜底和人工控制还是得有人认真想。反正我的原则一直没变：能用就用，不能用就改；放过自己，折磨 AI。",
      "about.cta": "在 GitHub 继续逛 →",
      "footer.note": "纯静态站点 · Cloudflare Workers / Pages",
      "panel.close": "关闭",
    },
    en: {
      skip: "Skip to main content",
      "nav.tree": "Work",
      "nav.soil": "Background",
      "nav.about": "About",
      "nav.github": "GitHub",
      "hero.eyebrow": "Cloud, AI, and things that can actually break",
      "hero.manifesto":
        "I'm Clair. I connect AI and cloud services to real devices, mostly to build things I genuinely want to use and then keep using. They do not have to be clever. They do have to survive outages, restarts, and the days when I cannot be bothered to babysit them.",
      "hero.bio":
        "Life is a wilderness; code is a swamp. Use what works, change what doesn't—and please, let the AI suffer.",
      "hero.github": "Browse GitHub",
      "hero.tree": "View selected work",
      "tree.eyebrow": "Selected work",
      "tree.title": "Choose a fruit",
      "tree.lead":
        "The fruit is arranged by what each project proves, not by noise or recency. Higher in the crown means deeper systems work and stronger real-world validation.",
      "tree.hint": "Hover for the name · tap for the engineering story",
      "tree.tap": "Click to open",
      "tree.empty": "Tap a fruit on the tree to see what grew along the way.",
      "tree.svgTitle": "Clair’s project fruit tree",
      "tree.svgDesc":
        "A project tree at twilight, with ten red fruit arranged through the canopy by engineering depth and real-world validation.",
      "crown.badge": "Crown · flagship",
      "project.summary": "What I built",
      "project.proof": "Engineering evidence",
      "tier.production": "Production / cloud",
      "tier.flagship": "Flagship / multimodal",
      "tier.shipped": "Shipped product",
      "tier.system": "Systems utility",
      "tier.reverse": "Reverse engineering",
      "tier.product": "Product engineering",
      "tier.robotics": "Robotics & control",
      "tier.serverless": "Serverless architecture",
      "tier.team": "Team course project",
      "tag.cloud": "Cloud & observability",
      "tag.aiiot": "AI · IoT",
      "tag.fullstack": "Full-stack product",
      "tag.extension": "Browser extension",
      "tag.speech": "Speech",
      "tag.desktop": "Windows desktop",
      "tag.reverse": "BLE reverse engineering",
      "tag.cps": "Cyber-physical",
      "tag.robotics": "Robotics",
      "tag.cv": "Computer vision",
      "link.repo": "Repo",
      "link.edge": "Edge Add-ons",
      "p.cloud.summary": "Migrated a local home-robot stack to AWS Fargate: Engine and Realtime Assistant share one task, with EFS persistence, Secrets Manager configuration, and structured CloudWatch observability.",
      "p.cloud.proof": "Validated at 1 vCPU / 2 GiB with cost and memory tuning. 55 Assistant, 115 Engine, and 8 cloud tests cover offline startup, health checks, SIGTERM, logging, and deployment boundaries.",
      "p.ebo.summary": "Translated EBO's private cloud protocol into standard RTSP / HTTP, then connected Home Assistant and OpenAI Realtime into a long-running audio, vision, and robot-speaker loop.",
      "p.ebo.proof": "Motion-gated frames, a 100 ms audio bridge, streaming replies and barge-in, 55-minute session handoff, reconnect memory, durable transcripts, and media-level health checks all run end to end.",
      "p.resume.summary": "A privacy-first local resume workspace: reusable experience blocks, job-description matching, prompt-to-JSON import, visual editing, and Word export.",
      "p.resume.proof": "A complete TypeScript, React, Drizzle, and Vinext application with no account, cloud database, or AI API required; build, rendered-HTML, and Word-export tests are included.",
      "p.bionic.summary": "An Edge extension for ADHD readers with configurable color, emphasis ratio, type size, and weight. It needs no account or network access and stores settings locally.",
      "p.bionic.proof": "Published on Edge Add-ons. It batches long-page work, observes dynamic content, preserves the host DOM and event handlers, migrates old settings, and is covered by unit and Playwright tests.",
      "p.windows.summary": "A Windows attention-boundary utility with foreground or process-runtime timers, schedules, one-shot limits, close or overlay actions, and cooldowns.",
      "p.windows.proof": "Handles process and window selection, overnight schedules, persisted state, dangerous-system-target safeguards, a fuzzy confirmation gate, and crash diagnostics for real multi-window use.",
      "p.foci.summary": "Reverse-engineered the BLE protocol of a discontinued FOCI focus wearable, moving live state, authentication, and control from its phone app into a local web dashboard.",
      "p.foci.proof": "Built with Python, bleak, and aiohttp; includes reproducible protocol notes, sanitized captures, a privacy audit, hardware-free demo mode, and automated tests.",
      "p.speaking.summary": "Three PTE speaking workflows—guided repetition, free response, and difficult-word drills—using Azure Speech for pronunciation, fluency, pace, and pitch feedback.",
      "p.speaking.proof": "Adds prompt-audio caching, local content libraries, keyboard and controller input, and a repeatable record-assess-feedback pipeline that removes waiting and extra clicks.",
      "p.desk.summary": "A sit-stand workstation controlled by PIR, Raspberry Pi, relays, and PubNub, with presence and height data synchronized to an S3 dashboard (McMaster SEP 769 team project).",
      "p.desk.proof": "Covers physical safety controls, local logging, scheduled cloud sync, remote operation, and behavior visualization; the repository includes a working interface and demo video.",
      "p.rccar.summary": "A camera-based lane-keeping RC car that combines a vision pipeline with PID steering and offers automatic, test, and step-through debug modes.",
      "p.rccar.proof": "Closed-loop driving was validated on physical hardware with parameterized speed, frame rate, and steering weights; the repo includes a demo video, hardware specs, and full project report.",
      "p.animatch.summary": "A serverless anime-expression party game: users upload a photo and MediaPipe facial landmarks score its similarity to a randomly selected anime expression.",
      "p.animatch.proof": "Built from two Lambda functions, a custom MediaPipe container in ECR, two S3 buckets, and API Gateway—covering model packaging, storage, APIs, and frontend delivery.",
      "soil.eyebrow": "Experience & foundation",
      "soil.title": "The roots",
      "soil.lead":
        "Projects grow deeper through more than a stack: cloud troubleshooting, cross-platform support, engineering education, and continual learning.",
      "soil.group.edu": "Education",
      "soil.group.exp": "Experience",
      "soil.group.cert": "Certifications",
      "soil.edu.mcmaster.title":
        "McMaster University · Master of Engineering, Systems and Technology",
      "soil.edu.mcmaster.meta": "Hamilton, Ontario, Canada · Graduated April 2026",
      "soil.edu.mcmaster.sep":
        "Coursework extended into cyber-physical systems and vehicle control; the resulting builds also appear in the project tree.",
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
      "about.eyebrow": "A less formal introduction",
      "about.title": "About me",
      "about.p1":
        "I'm Clair Y.Chen. I used to work in Azure support, then went back for a master's in engineering. These days my projects wander from Fargate and LLM Realtime to BLE reverse engineering, Windows utilities, and a home robot that talks. The common thread is less grand: each one started with something in my own life that had become too annoying to keep ignoring.",
      "about.p2":
        "I don't really believe a project is finished when the demo finally runs. That's usually when the awkward questions begin: what happens when the network drops, the container restarts, the logs are useless, someone at home taps the wrong button, or the cloud bill starts to hurt? Those unglamorous edges are where I tend to spend my time.",
      "about.p3":
        "I don't think AI is magic, either. It is useful, persuasive, and very good at making everything look easier than it is. Once it is wired into real life, someone still has to think about boundaries, fallbacks, and the off switch. My rule is simple: use what works, change what doesn't—and let the AI suffer.",
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
    const summaryEl = document.getElementById("panelSummary");
    const proofEl = document.getElementById("panelProof");
    const linksEl = document.getElementById("panelLinks");

    if (badge) badge.textContent = p.tierKey ? t(p.tierKey) : p.crown ? t("crown.badge") : "";
    if (dateEl) {
      dateEl.textContent = p.date;
      dateEl.setAttribute("datetime", p.date);
    }
    if (titleEl) titleEl.textContent = p.name;
    if (summaryEl) summaryEl.textContent = t(p.summaryKey);
    if (proofEl) proofEl.textContent = t(p.proofKey);

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
