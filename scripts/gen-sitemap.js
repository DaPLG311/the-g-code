/* Regenerates sitemap.xml from the repo — static pages + every live data-driven view.
   Run: node scripts/gen-sitemap.js   (from repo root). Never hand-edit sitemap.xml again. */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://dayonemvp.com";
const TODAY = new Date().toISOString().slice(0, 10);

// load the browser data files with a window shim
global.window = {};
require(path.join(ROOT, "build-data.js"));
require(path.join(ROOT, "build-data-2.js"));
const BUILD = global.window.BUILD;

// static pages: everything except noindex/parked/dynamic-shell/utility
const EXCLUDE = new Set([
  "success.html", "the-g-code.html",          // noindex / parked
  "build.html", "tier.html", "audience.html", // shells — their views are listed with params
]);
const PRIORITY = {
  "index.html": "1.0",
  "galaxy.html": "0.95", "operated-calls.html": "0.95",
  "maestro-method.html": "0.9", "start.html": "0.9", "pricing.html": "0.9",
  "who-we-help.html": "0.9", "work.html": "0.9",
  "privacy.html": "0.3", "terms.html": "0.3", "accessibility.html": "0.3",
};

const urls = [];
function add(loc, priority) { urls.push({ loc, priority }); }

fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).sort().forEach(f => {
  if (EXCLUDE.has(f)) return;
  const loc = f === "index.html" ? `${BASE}/` : `${BASE}/${f}`;
  add(loc, PRIORITY[f] || "0.8");
});

// data-driven views
BUILD.categories.forEach(c => add(`${BASE}/build.html?cat=${c.slug}`, "0.8"));
Object.entries(BUILD.services).forEach(([slug, s]) => {
  if (s.status === "live") add(`${BASE}/build.html?s=${slug}`, "0.7");
});
["idea-session", "blueprint", "working-alpha", "mvp-launch", "platform", "community-rate"]
  .forEach(p => add(`${BASE}/tier.html?p=${p}`, "0.7"));
["founders", "small-business", "nonprofits", "youth-in-tech"]
  .forEach(a => add(`${BASE}/audience.html?a=${a}`, "0.8"));

const esc = s => s.replace(/&/g, "&amp;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${TODAY}</lastmod><priority>${u.priority}</priority></url>`).join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml written: ${urls.length} URLs (${TODAY})`);
