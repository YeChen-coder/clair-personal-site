// Build the full-text files for AI assistants from app.js (the site's own text, so they never drift):
//   llms-full.txt     everything on the site in English, one plain-text page
//   llms-full.zh.txt  the same in Chinese
// llms.txt itself (https://llmstxt.org) is hand-written and recruiter-facing: edit it directly. The
// job-fit agent reads it as Clair's profile, so redeploy the agent (scripts/deploy_app.sh) after editing.
// Usage (from the repo root): node aws/scripts/build_llms.mjs   then deploy the site.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const appJs = readFileSync(join(root, "app.js"), "utf8");
const start = appJs.indexOf("const projects = {");
const end = appJs.indexOf("const toggle =");
const { projects, strings } = new Function(appJs.slice(start, end) + "\nreturn { projects, strings };")();

const SITE = "https://clair-chen.yechenworking.workers.dev/";
const GITHUB = "https://github.com/YeChen-coder";
const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const tr = (lang) => (key) => strip(strings[lang][key] ?? key);
const nameOf = (p, t) => p.name || t(p.nameKey);

// ---------- llms-full.txt / llms-full.zh.txt ----------
for (const lang of ["en", "zh"]) {
  const t = tr(lang);
  const en = lang === "en";
  const lines = [
    en ? "# Clair Y.Chen — full profile" : "# Clair Y.Chen — 完整介绍",
    "",
    `${en ? "Website" : "网站"}: ${SITE}`,
    `GitHub: ${GITHUB}`,
    "",
    `${t("hero.eyebrow")}`,
    "",
    t("hero.manifesto"),
    "",
    en ? "## About" : "## 关于",
    "",
    t("about.p1"),
    "",
    t("about.p2"),
    "",
    t("about.p3"),
    "",
    en ? "## Experience" : "## 工作经历",
    "",
    `${t("soil.exp.ms.title")} · ${t("soil.exp.ms.meta")}`,
    t("soil.exp.ms.desc"),
    "",
    en ? "## Education" : "## 教育",
    "",
    `${t("soil.edu.mcmaster.title")} · ${t("soil.edu.mcmaster.meta")}`,
    t("soil.edu.mcmaster.sep"),
    `${t("soil.edu.cugb.title")} · ${t("soil.edu.cugb.meta")}`,
    "",
    en ? "## Certifications" : "## 证书",
    "",
    ...["soil.cert.aws.ml", "soil.cert.aws.cp", "soil.cert.pmp", "soil.cert.google"].map((k) => `- ${t(k)}`),
    "",
    en ? "## Projects" : "## 项目",
    "",
  ];
  for (const p of Object.values(projects)) {
    lines.push(`### ${nameOf(p, t)} (${p.date})`, "");
    if (p.tierKey) lines.push(t(p.tierKey));
    lines.push((p.tags || []).map(t).join(" · "), "", t(p.summaryKey), "");
    if (p.proofKey) lines.push(t(p.proofKey), "");
    for (const l of p.links || []) lines.push(`- ${t(l.labelKey)}: ${l.href}`);
    lines.push("");
  }
  writeFileSync(join(root, en ? "llms-full.txt" : "llms-full.zh.txt"), lines.join("\n"), "utf8");
}
console.log("wrote llms-full.txt, llms-full.zh.txt");
