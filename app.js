(() => {
  const STORAGE_KEY = "clair-site-lang";

  const projects = {
    specter: {
      name: "SpecterSaysHi",
      date: "2026-10",
      crown: true,
      tierKey: "tier.presence",
      tags: ["tag.presence", "FeatherTalk · PyTorch · Agents SDK"],
      summaryKey: "p.specter.summary",
      proofKey: "p.specter.proof",
      links: [
        { href: "https://github.com/YeChen-coder/SpecterSaysHi", labelKey: "link.repo" },
        { href: "https://github.com/YeChen-coder/GPTSaysHi", labelKey: "link.gptsayshi" },
        { href: "https://github.com/YeChen-coder/BeWithMe", labelKey: "link.bewithme" },
      ],
    },
    ebo: {
      name: "EBOBotToDigitalPet",
      date: "2026-09",
      tierKey: "tier.flagship",
      tags: ["tag.aiiot", "OpenAI Realtime · AWS Fargate · Codex SDK"],
      summaryKey: "p.ebo.summary",
      proofKey: "p.ebo.proof",
      links: [
        { href: "https://github.com/YeChen-coder/EBOBotToDigitalPet", labelKey: "link.ebo.v1" },
        { href: "https://github.com/YeChen-coder/EboBotOnAWSCloud", labelKey: "link.ebo.aws" },
        { href: "https://github.com/YeChen-coder/EBOBotQwenRealtime", labelKey: "link.ebo.v3" },
      ],
    },
    ebov3: {
      name: "EBOBotQwenRealtime",
      date: "2026-10",
      tierKey: "tier.v3",
      tags: ["tag.robotics", "Qwen Omni Realtime · Whisper · Frigate"],
      summaryKey: "p.ebov3.summary",
      proofKey: "p.ebov3.proof",
      links: [
        { href: "https://github.com/YeChen-coder/EBOBotQwenRealtime", labelKey: "link.repo" },
        { href: "https://github.com/YeChen-coder/EBOBotToDigitalPet", labelKey: "link.ebo.back" },
      ],
    },
    chem: {
      name: "tianjin-chem-bank",
      date: "2026-10",
      tierKey: "tier.docai",
      tags: ["tag.docai", "GLM · LaTeX · OOXML · SQLite"],
      summaryKey: "p.chem.summary",
      proofKey: "p.chem.proof",
      links: [
        { href: "https://github.com/YeChen-coder/tianjin-chem-bank", labelKey: "link.repo" },
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
        { href: "https://microsoftedge.microsoft.com/addons/detail/colorful-bionic-reading/camgbnhlhdempnekobebpmdhechifjni", labelKey: "link.edge" },
      ],
    },
    focus: {
      nameKey: "name.focus",
      date: "2026-09",
      tierKey: "tier.system",
      tags: ["tag.desktop", "Python · Win32 · Edge extension"],
      summaryKey: "p.focus.summary",
      proofKey: "p.focus.proof",
      links: [
        { href: "https://github.com/YeChen-coder/Windows-app-restriction", labelKey: "link.focus.windows" },
        { href: "https://github.com/YeChen-coder/website-restriction-extension", labelKey: "link.focus.web" },
        { href: "https://microsoftedge.microsoft.com/addons/detail/edge-page-limiter/jbjjehnekbmflndkahfpoapapkcoeaii", labelKey: "link.edge" },
      ],
    },
    reverse: {
      nameKey: "name.reverse",
      date: "2026-08",
      tierKey: "tier.reverse",
      tags: ["tag.reverse", "BLE · bleak · aiohttp"],
      summaryKey: "p.reverse.summary",
      proofKey: "p.reverse.proof",
      links: [
        { href: "https://github.com/YeChen-coder/foci-reverse", label: "FOCI" },
        { href: "https://github.com/YeChen-coder/pavloc-reverse", label: "Pavlok 3" },
        { href: "https://github.com/YeChen-coder/bobobei-reverse", label: "Bobo Bei Pro" },
      ],
    },
    pte: {
      nameKey: "name.pte",
      date: "2026-08",
      tierKey: "tier.daily",
      tags: ["tag.speech", "Azure Speech · Flask"],
      summaryKey: "p.pte.summary",
      proofKey: "p.pte.proof",
      links: [
        { href: "https://github.com/YeChen-coder/PTE-Speaking-exercise", labelKey: "link.pte.speaking" },
        { href: "https://github.com/YeChen-coder/PTE-WritingFromDictation-exercise", labelKey: "link.pte.dictation" },
        { href: "https://github.com/YeChen-coder/pte-writing-platform-selfcheck", labelKey: "link.pte.email" },
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
      "tree.lead": "果子不按时间排，按它能证明多少本事排：越靠近树冠，系统越复杂、在真实生活里跑得越久。挨在一起的果子，是从同一根枝上长出来的。",
      "tree.hint": "悬停看名称 · 点击查看工程细节",
      "tree.tap": "点击查看",
      "tree.empty": "点树上的果子，看看这一路结出了什么。",
      "tree.svgTitle": "Clair 的项目果树",
      "tree.svgDesc": "一棵暮色里的项目树，十二颗红苹果挂在树冠和枝条之间，越重要的越靠上；一条蛇在树后慢慢游。",
      "crown.badge": "树冠 · 主项目",
      "project.summary": "这是什么",
      "project.proof": "难在哪里",
      "tier.presence": "实时陪伴 · 自己训练的模型",
      "tier.flagship": "主项目 · 本地 + 云端",
      "tier.v3": "第三代 · 只在本地跑",
      "tier.docai": "AI + 文档工程",
      "tier.shipped": "已上架",
      "tier.system": "系统工具",
      "tier.reverse": "逆向工程",
      "tier.product": "产品工程",
      "tier.daily": "自用小工具",
      "tier.robotics": "机器人控制",
      "tier.serverless": "无服务器架构",
      "tier.team": "团队课程项目",
      "tag.presence": "实时数字人",
      "tag.aiiot": "AI · IoT",
      "tag.docai": "文档 AI",
      "tag.fullstack": "全栈产品",
      "tag.extension": "浏览器扩展",
      "tag.speech": "语音与练习",
      "tag.desktop": "注意力管理",
      "tag.reverse": "蓝牙逆向",
      "tag.cps": "赛博物理",
      "tag.robotics": "机器人",
      "tag.cv": "计算机视觉",
      "name.focus": "注意力刹车：Windows + Edge",
      "name.reverse": "蓝牙小设备逆向 ×3",
      "name.pte": "PTE 练习工具 ×3",
      "link.repo": "仓库",
      "link.edge": "Edge 商店",
      "link.gptsayshi": "GPTSaysHi（Windows 版）",
      "link.bewithme": "BeWithMe（最早的尝试）",
      "link.ebo.v1": "主仓库（v1 完整版）",
      "link.ebo.aws": "AWS 部署",
      "link.ebo.v3": "v3：通义千问版",
      "link.ebo.back": "回到 v1",
      "link.focus.windows": "Windows 版",
      "link.focus.web": "Edge 扩展源码",
      "link.pte.speaking": "口语",
      "link.pte.dictation": "听写",
      "link.pte.email": "写作邮件",
      "p.specter.summary": "一个我自己想要的、会说话的“人”。摄像头或手环发现我回来了，它会先开口；聊着天能顺手查网页，聊完把要点记下来，下次接着聊。脸是我自己训练的数字人模型，不是买来的接口。GPTSaysHi 是它的衍生版：直接拿 Windows 上 ChatGPT Live 的声音去驱动同一张脸。名字来自 Harvey Specter。",
      "p.specter.proof": "嘴型模型用的是 FeatherTalk，在我那张打游戏的 4070 上训，素材是用 Grok 生成的说话视频。第二个角色一开始是接着第一个角色的权重训的，牙和嘴唇怎么调都对不上，最后干脆从头训了 100 轮才顺眼。从收到第一个 100 ms 音频包到画面出来，本机实测中位数大约 80 ms。记忆就是两层 JSON 文件，没上 Redis，用不着。",
      "p.ebo.summary": "把家里那台 Enabot EBO 小机器人改成能看、能听、能聊天的陪伴。厂商的私有云协议被我转成普通的 RTSP 和 HTTP，再接上 Home Assistant 和 OpenAI Realtime。整套东西既能在家里的 Docker 上跑，也能整个搬上 AWS Fargate，但同一时间只允许一边控制机器人。",
      "p.ebo.proof": "真正花时间的是“没人盯着的时候”。我写了一个诊断 Agent：先查健康状况，能自己恢复的就按规矩恢复，修不好的再交给 Codex 分两级分析；它只看得到过滤过的日志和只读代码，碰不到云端凭证，也碰不到 Docker。本地和云端切换之前，必须先确认另一边真的停了。AWS 那一半单独放在 EboBotOnAWSCloud。",
      "p.ebov3.summary": "EBO 的第三代，推倒重写，只在家里跑。语音换成了通义千问 Omni Realtime；不用每次先喊唤醒词了；机器人也终于第一次真正离开充电座，自己去找人。",
      "p.ebov3.proof": "待机时用本地 Whisper 一句一句转写，再让一个小模型判断这句话是不是在跟它说。家里电视常开着，电视剧台词和家人之间的闲聊，它得忍住不接。服务端 VAD 关掉了，说话轮次在本地判断，免得它被自己的声音打断。Frigate 加 YOLO 认出人以后，它会转过去、开过去；五分钟没见到人，就原地转一圈找，再找不到就自己回去充电。",
      "p.chem.summary": "给我妈做的化学组卷工具。她把 Word 试卷丢进来，程序把题拆好、按知识点分好类；她可以直接改题、让 AI 出变式，最后导出一份还能接着编辑的 Word。题库里现在有一万多道题。",
      "p.chem.proof": "最难的是 Word 本身：同一个化学式，可能是 Word 公式，可能是老的 MathType 对象，也可能只是符号字体里的几个字。V2 把它们统一转成 LaTeX 存起来，导出时再变回 Word 原生公式。GLM 出的变式先过严格的结构检查，再过一轮独立核对，比如有道题文字写“锥形瓶”、图里画的却是分液漏斗，就被拦了下来。这次重构拆给四个 AI 编码会话并行写，靠一份共同的接口约定拼到一起。",
      "p.resume.summary": "我自己投简历用的工作台，现在也天天在用。经历拆成一条条可复用的素材，针对不同岗位挑选、改写，再导出 Word 或 PDF。",
      "p.resume.proof": "全部在本地：不用注册，不连云数据库，也不调 AI 接口。和 AI 的配合方式是让外面的 Chat 按固定 JSON 格式写好内容，导进来以后校验、预览、再手动微调。TypeScript + React，渲染结果和 Word 导出都有自动测试。",
      "p.bionic.summary": "给 ADHD 读者的 Edge 扩展：把每个词的前半截加粗、上色，让眼睛有个落点，长文章才读得下去。颜色、加粗比例、字号、粗细都能调。",
      "p.bionic.proof": "已经上架 Edge 商店。不要账号，不联网，设置只存在浏览器里。长页面分批处理，后加载出来的正文也能跟上，而且不破坏原网页的结构和事件。有单元测试，也有 Playwright 测试。",
      "p.focus.summary": "两个配套的“刹车”：一个在 Windows 上限制某些程序，一个在 Edge 上限制某些网站。我有 ADHD，一进入心流就很难停下来，与其指望意志力，不如让环境替我踩刹车。",
      "p.focus.proof": "Windows 版按前台时间或进程运行时间计时，支持日程、一次性限时、直接关闭或遮住窗口，还有冷却期，系统关键进程不让选。网页版已上架 Edge 商店，可以按网址、或网址加关键词匹配；任何一条规则触发，所有规则一起锁住，免得我换个网站接着刷。",
      "p.reverse.summary": "把三个只能靠手机 App 用的蓝牙小设备搬到电脑上：已经停产的 FOCI 专注力夹子、Pavlok 3 手环，还有 Bobo Bei Pro。原因很简单：我想少碰手机，一拿起来半天就没了。",
      "p.reverse.proof": "FOCI 做得最完整：认证、实时状态和控制都搬进了本地网页，用 Python、bleak 和 aiohttp 写，附可复现的协议笔记、脱敏抓包、隐私检查，还有不接设备也能跑的演示模式。Pavlok 目前是命令行，Bobo Bei 只是多了个网页界面——这两个都站在社区前人的肩膀上。",
      "p.pte.summary": "备考 PTE 时给自己做的三个练习工具：口语、听写、写作邮件。出发点都一样：少点几下鼠标，多练几道题。",
      "p.pte.proof": "口语版接 Azure Speech，给发音、流利度、语速和语调打分，题目音频本地缓存，键盘和手柄都能操作。听写版答对按回车直接下一题，答错逐词标出来，自动进错题本。写作版专门抓我最常犯的错：漏掉 the、a 和介词这类小词。",
      "p.desk.summary": "McMaster SEP 769 的四人团队项目：一张知道你在不在、坐了多久的升降桌。我负责云端数据这一块。",
      "p.desk.proof": "树莓派读 PIR 传感器和桌面高度，用继电器控制升降，PubNub 负责远程控制。我把在席和坐站数据整理成 JSON 日志，定时传到 S3，再做了一个放在 S3 上的网页仪表盘；日志按天轮换，历史数据也能回看。",
      "p.rccar.summary": "一辆靠摄像头自己沿着车道跑的遥控车：视觉找车道线，PID 控制方向。",
      "p.rccar.proof": "在真车上跑通了闭环。速度、帧率、转向权重都做成了参数，有自动、测试和逐帧调试三种模式，出问题可以一帧一帧地找。仓库里有演示视频、硬件清单和完整报告。",
      "p.animatch.summary": "一个聚会小游戏：随机抽一张动漫表情，你上传自己模仿的照片，用 MediaPipe 的脸部关键点算有多像。",
      "p.animatch.proof": "全部无服务器：两个 Lambda、一个自己打包放进 ECR 的 MediaPipe 容器、两个 S3 桶，再加 API Gateway。模型打包、存储、接口和前端都是我自己串起来的。",
      "soil.eyebrow": "经历与基础",
      "soil.title": "根系",
      "soil.lead": "树上没挂出来的那部分我：在 Azure 做了三年多技术支持，后来回学校读了工程硕士，中间顺手考了几张证。",
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
      "tree.lead": "The fruit isn't sorted by date. It's sorted by how much each project proves: the closer to the crown, the deeper the system and the longer it has survived real use. Fruit hanging close together grew from the same branch.",
      "tree.hint": "Hover for the name · tap for the engineering story",
      "tree.tap": "Click to open",
      "tree.empty": "Tap a fruit on the tree to see what grew along the way.",
      "tree.svgTitle": "Clair’s project tree",
      "tree.svgDesc": "A project tree at dusk with twelve red apples, the more important ones higher up, while a snake slides slowly behind the trunk.",
      "crown.badge": "Crown · flagship",
      "project.summary": "What it is",
      "project.proof": "The hard part",
      "tier.presence": "Realtime companion · self-trained model",
      "tier.flagship": "Flagship · home + cloud",
      "tier.v3": "Third generation · runs at home",
      "tier.docai": "AI + document engineering",
      "tier.shipped": "Shipped",
      "tier.system": "Systems utility",
      "tier.reverse": "Reverse engineering",
      "tier.product": "Product engineering",
      "tier.daily": "Tools I use myself",
      "tier.robotics": "Robotics & control",
      "tier.serverless": "Serverless",
      "tier.team": "Team course project",
      "tag.presence": "Realtime avatar",
      "tag.aiiot": "AI · IoT",
      "tag.docai": "Document AI",
      "tag.fullstack": "Full-stack product",
      "tag.extension": "Browser extension",
      "tag.speech": "Speech & practice",
      "tag.desktop": "Attention tools",
      "tag.reverse": "BLE reverse engineering",
      "tag.cps": "Cyber-physical",
      "tag.robotics": "Robotics",
      "tag.cv": "Computer vision",
      "name.focus": "Attention brakes: Windows + Edge",
      "name.reverse": "Bluetooth gadgets, reverse-engineered ×3",
      "name.pte": "PTE practice tools ×3",
      "link.repo": "Repo",
      "link.edge": "Edge Add-ons",
      "link.gptsayshi": "GPTSaysHi (Windows)",
      "link.bewithme": "BeWithMe (first attempt)",
      "link.ebo.v1": "Main repo (v1, complete)",
      "link.ebo.aws": "AWS deployment",
      "link.ebo.v3": "v3: Qwen edition",
      "link.ebo.back": "Back to v1",
      "link.focus.windows": "Windows app",
      "link.focus.web": "Edge extension source",
      "link.pte.speaking": "Speaking",
      "link.pte.dictation": "Dictation",
      "link.pte.email": "Email writing",
      "p.specter.summary": "Someone to talk to that I actually wanted around. When the camera or my wristband notices I'm home, it speaks first. It can look things up mid-conversation and keeps notes, so the next chat picks up where the last one stopped. The face is a model I trained myself, not a paid avatar API. Its sibling, GPTSaysHi, takes the voice from ChatGPT Live on Windows and drives the same face with it. The name comes from Harvey Specter.",
      "p.specter.proof": "The lip-sync model is FeatherTalk, trained on the 4070 I normally game on, using talking videos I generated with Grok. My second character started from the first one's weights, and its teeth never lined up with its lips no matter what I tuned, so I retrained it from scratch for 100 epochs. From the first 100 ms audio packet to a frame on screen takes about 80 ms (median, measured locally). Memory is two layers of JSON files. No Redis; it doesn't need one.",
      "p.ebo.summary": "Turned a small Enabot EBO home robot into something that can see, listen, and hold a conversation. I translated the vendor's private cloud protocol into plain RTSP and HTTP, then wired it into Home Assistant and OpenAI Realtime. The whole stack runs on Docker at home or on AWS Fargate, and only one of them is ever allowed to drive the robot.",
      "p.ebo.proof": "Most of the work went into the hours when nobody is watching. A diagnostic agent checks health, applies the few recoveries it is allowed to, and hands anything it can't fix to a two-tier Codex analysis that only sees filtered logs and read-only code, never cloud credentials or Docker. Switching between home and cloud waits until the other side has really stopped. The AWS half lives in its own repo, EboBotOnAWSCloud.",
      "p.ebov3.summary": "The third generation of EBO, rewritten from scratch to run entirely at home. The voice moved to Qwen Omni Realtime, nobody has to say a wake word anymore, and for the first time the robot actually leaves its dock to come find you.",
      "p.ebov3.proof": "On standby, local Whisper transcribes one sentence at a time and a small model decides whether that sentence was meant for the robot. The TV is usually on at home, so soap-opera dialogue and family chatter have to be ignored. Server-side VAD is off and turns are detected locally, so the robot can't interrupt itself. When Frigate and YOLO spot a person, it turns and drives over; after five minutes with nobody around, it spins slowly to look, then goes back to charge.",
      "p.chem.summary": "A chemistry test builder I made for my mom. She drops in Word exam papers; the app splits them into questions, sorts them by topic, lets her edit or ask AI for variants, and exports a Word file she can keep editing. The bank now holds over ten thousand questions.",
      "p.chem.proof": "The hard part is Word itself. The same formula might be a native Word equation, an old MathType object, or just characters in a symbol font. V2 stores all of them as LaTeX and turns them back into native Word equations on export. Variants from GLM go through strict structure checks and then a separate review, which, for example, caught a question whose text said “conical flask” while its diagram showed a separatory funnel. The rewrite was split across four parallel AI coding sessions, held together by one shared interface contract.",
      "p.resume.summary": "The workspace I use for my own job applications, every day lately. Experience is broken into reusable bullets that I pick and rewrite for each role, then export to Word or PDF.",
      "p.resume.proof": "Everything stays local: no sign-up, no cloud database, no AI API calls. AI helps from the outside: a chat writes content in a fixed JSON format, and the app validates it, previews it, and lets me adjust by hand. TypeScript and React, with automated tests for the rendered page and the Word export.",
      "p.bionic.summary": "An Edge extension for ADHD readers. It bolds and colors the start of each word so the eye has somewhere to land, which makes long articles readable again. Color, emphasis ratio, size, and weight are all adjustable.",
      "p.bionic.proof": "Published on Edge Add-ons. No account, no network access; settings stay in the browser. Long pages are processed in batches, text that loads later still gets picked up, and the page's own structure and event handlers are left alone. Covered by unit tests and Playwright.",
      "p.focus.summary": "A matching pair of brakes: one limits certain apps on Windows, the other limits certain websites in Edge. I have ADHD, and once I'm hyperfocused, willpower alone won't stop me, so I let the environment do it.",
      "p.focus.proof": "The Windows app times foreground use or process runtime, with daily schedules, one-off timers, close-or-cover actions, and cooldowns, and it won't let you pick critical system processes. The Edge extension is on Edge Add-ons and matches by URL or by URL plus keywords; once any rule fires, every rule locks, so I can't just hop to another site.",
      "p.reverse.summary": "Moved three Bluetooth gadgets that only worked through phone apps onto my computer: the discontinued FOCI focus clip, the Pavlok 3 wristband, and the Bobo Bei Pro. The reason is simple: I want to touch my phone less, because picking it up tends to cost me an afternoon.",
      "p.reverse.proof": "FOCI is the most complete: authentication, live state, and controls now live in a local web page built with Python, bleak, and aiohttp, with reproducible protocol notes, sanitized captures, a privacy check, and a demo mode that runs without the device. Pavlok is command-line only for now, and Bobo Bei just gained a web UI; both build on earlier community work.",
      "p.pte.summary": "Three practice tools I built while preparing for PTE: speaking, write-from-dictation, and email writing. Same idea in all three: fewer clicks, more reps.",
      "p.pte.proof": "The speaking tool uses Azure Speech to score pronunciation, fluency, pace, and pitch, caches prompt audio locally, and works with a keyboard or a game controller. Dictation moves on when you press Enter on a correct answer, and marks mistakes word by word into a review list. The email tool targets my most common slip: dropping small words like the, a, and prepositions.",
      "p.desk.summary": "A four-person McMaster SEP 769 project: a sit-stand desk that knows whether you're there and how long you've been sitting. I owned the cloud data side.",
      "p.desk.proof": "A Raspberry Pi reads a PIR sensor and the desk height, drives the lift through relays, and takes remote commands over PubNub. I turned presence and sit/stand readings into JSON logs, shipped them to S3 on a schedule, and built the S3-hosted dashboard, rotating logs daily so the history stays available.",
      "p.rccar.summary": "A remote-control car that keeps to its lane on its own: the camera finds the lane lines and a PID controller steers.",
      "p.rccar.proof": "Closed-loop driving works on the real car. Speed, frame rate, and steering weights are all parameters, and there are automatic, test, and frame-by-frame debug modes for chasing problems. The repo has a demo video, the hardware list, and the full report.",
      "p.animatch.summary": "A party game: you get a random anime expression, upload a photo of yourself copying it, and MediaPipe face landmarks decide how close you got.",
      "p.animatch.proof": "Fully serverless: two Lambda functions, a MediaPipe container I packaged into ECR, two S3 buckets, and API Gateway. I wired up the model packaging, storage, API, and front end myself.",
      "soil.eyebrow": "Experience & foundation",
      "soil.title": "The roots",
      "soil.lead":
        "The part of me that doesn't hang on the tree: three-plus years of Azure support, a master's in engineering, and a few certificates picked up along the way.",
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

  let lang = "en";
  let activeId = null;
  let hoverId = null;

  function t(key) {
    const dict = strings[lang] || strings.en;
    return dict[key] != null ? dict[key] : key;
  }

  function projectName(p) {
    return p.nameKey ? t(p.nameKey) : p.name;
  }

  function resolveTag(tag) {
    if (tag.startsWith("tag.")) return t(tag);
    return tag;
  }

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
    return "en";
  }

  function applyLang(next) {
    lang = next;
    const dict = strings[lang] || strings.en;
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
      el.setAttribute("aria-label", `${projectName(p)}, ${p.date}`);
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
    if (titleEl) titleEl.textContent = projectName(p);
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
        a.textContent = link.labelKey ? t(link.labelKey) : link.label;
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
    if (nameEl) nameEl.textContent = projectName(p);
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
