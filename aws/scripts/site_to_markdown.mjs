// Turn the personal site's bilingual text (projects + strings in app.js) into two
// Markdown files for the knowledge base: knowledge/site/clair-site.en.md and .zh.md.
// Usage: node scripts/site_to_markdown.mjs <path-to-site>/app.js
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appJs = readFileSync(process.argv[2], "utf8");
const start = appJs.indexOf("const projects = {");
const end = appJs.indexOf("const toggle =");
const { projects, strings } = new Function(appJs.slice(start, end) + "\nreturn { projects, strings };")();

const SITE = "https://clair-chen.yechenworking.workers.dev/";
const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "knowledge", "site");
mkdirSync(out, { recursive: true });

for (const lang of ["en", "zh"]) {
  const t = (key) => strip(strings[lang][key] ?? key);
  const lines = [
    lang === "en" ? "# Clair Y.Chen — personal website" : "# Clair Y.Chen — 个人网站",
    "",
    `Website: ${SITE}`,
    "GitHub: https://github.com/YeChen-coder",
    "",
    lang === "en" ? "## About Clair" : "## 关于 Clair",
    "",
  ];
  // Every non-project string, grouped by its section prefix (hero, soil, about, ...).
  const skip = /^(skip|nav\.|link\.|tag\.|tier\.|p\.|panel\.|tooltip\.|lang)/;
  for (const [key, value] of Object.entries(strings[lang])) {
    if (!skip.test(key) && strip(value).length > 30) lines.push(`- ${strip(value)}`);
  }
  lines.push("", lang === "en" ? "## Projects shown on the site" : "## 网站上展示的项目", "");
  for (const p of Object.values(projects)) {
    lines.push(`### ${p.name} (${p.date})`, "");
    if (p.tierKey) lines.push(t(p.tierKey));
    lines.push((p.tags || []).map(t).join(" · "), "", t(p.summaryKey), "");
    if (p.proofKey) lines.push(t(p.proofKey), "");
    for (const l of p.links || []) lines.push(`- ${t(l.labelKey)}: ${l.href}`);
    lines.push("");
  }
  writeFileSync(join(out, `clair-site.${lang}.md`), lines.join("\n"), "utf8");
}
console.log("wrote", out);
