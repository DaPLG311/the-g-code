/* NO WAY BARBERSHOP — structural QA.
   Run: node scripts/qa.js

   Checks the things that quietly rot on a bilingual site and that nobody
   notices until Google does: one-way hreflang, a missing Spanish counterpart,
   a canonical pointing at the wrong locale, an unconfirmed business fact
   leaking into structured data. Zero dependencies. */
"use strict";

const fs = require("fs");
const path = require("path");
const L = require("./lib.js");
const { ROOT, BUSINESS, COPY, CUTS } = L;

let pass = 0, fail = 0;
const problems = [];

function check(name, condition, detail) {
  if (condition) { pass++; return; }
  fail++;
  problems.push(name + (detail ? "\n      " + detail : ""));
}

/* Resolve a route to a file the same way Vercel's cleanUrls does: try the flat
   <route>.html first, then <route>/index.html. The catalog routes (/en/cuts,
   /es/cortes) are directory indexes because they also parent the cut pages. */
function fileFor(route) {
  const rel = route.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [
    path.join(ROOT, rel + ".html"),
    path.join(ROOT, rel, "index.html")
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0];   /* report the miss against the primary candidate */
}

const PAGE_KEYS = ["home", "cuts", "book", "gallery", "jose", "content", "contact", "policies"];

/* Build the full route list: static pages plus every cut, in both locales. */
const routes = [];
["en", "es"].forEach((loc) => {
  PAGE_KEYS.forEach((k) => routes.push({ key: k, locale: loc, slug: null, route: L.routeFor(k, loc) }));
  CUTS.active().forEach((c) => routes.push({ key: "cut", locale: loc, slug: c.slug, route: L.routeFor("cut", loc, c.slug) }));
});

console.log("\nstructural QA\n");

/* ---- 1. every route has a file ---- */
routes.forEach((r) => {
  check(`file exists for ${r.route}`, fs.existsSync(fileFor(r.route)));
});

/* ---- 2. every EN page has an ES counterpart and vice versa ---- */
routes.filter((r) => r.locale === "en").forEach((r) => {
  const es = L.routeFor(r.key, "es", r.slug);
  check(`${r.route} has a Spanish counterpart (${es})`, fs.existsSync(fileFor(es)));
});

/* ---- 3. per-page document checks ---- */
routes.forEach((r) => {
  const html = fs.readFileSync(fileFor(r.route), "utf8");
  const D = BUSINESS.domain;
  const selfUrl = D + r.route;
  const enUrl = D + L.routeFor(r.key, "en", r.slug);
  const esUrl = D + L.routeFor(r.key, "es", r.slug);

  check(`${r.route}: html lang="${r.locale}"`,
    html.includes(`<html lang="${r.locale}">`));

  check(`${r.route}: canonical points at itself`,
    html.includes(`<link rel="canonical" href="${selfUrl}" />`),
    "expected canonical " + selfUrl);

  /* Two-way hreflang: the classic bug is EN linking to ES while ES links
     only to itself. Both documents must name both URLs. */
  check(`${r.route}: hreflang en`, html.includes(`hreflang="en" href="${enUrl}"`));
  check(`${r.route}: hreflang es`, html.includes(`hreflang="es" href="${esUrl}"`));
  check(`${r.route}: hreflang x-default → en`, html.includes(`hreflang="x-default" href="${enUrl}"`));

  check(`${r.route}: has a title`, /<title>[^<]{10,}<\/title>/.test(html));
  check(`${r.route}: has a meta description`, /<meta name="description" content="[^"]{40,}"/.test(html));
  check(`${r.route}: has og:image`, html.includes('property="og:image"'));
  check(`${r.route}: has a skip link`, html.includes('class="nw-skip"'));
  check(`${r.route}: main landmark`, html.includes('<main id="main">'));

  /* The language switcher must point at the counterpart URL, not just "/". */
  if (r.key !== "policies" || true) {
    const otherUrl = r.locale === "en" ? L.routeFor(r.key, "es", r.slug) : L.routeFor(r.key, "en", r.slug);
    check(`${r.route}: language switcher targets ${otherUrl}`,
      html.includes(`href="${otherUrl}"`),
      "switcher must preserve the customer's place across languages");
  }

  /* No untranslated leakage: a Spanish page should not ship the English nav. */
  if (r.locale === "es") {
    check(`${r.route}: nav is translated`,
      html.includes(">Cortes<") && html.includes(">Reservar<"),
      "Spanish page is serving English navigation");
  }
});

/* ---- 4. unconfirmed facts must not reach structured data ---- */
routes.forEach((r) => {
  const html = fs.readFileSync(fileFor(r.route), "utf8");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  blocks.forEach((b, i) => {
    let parsed;
    try { parsed = JSON.parse(b); } catch (e) { parsed = null; }
    check(`${r.route}: JSON-LD block ${i + 1} parses`, !!parsed);
    if (!parsed) return;

    const flat = JSON.stringify(parsed);
    if (!BUSINESS.REVIEWS_APPROVED) {
      check(`${r.route}: no aggregateRating while reviews are unapproved`,
        !flat.includes("aggregateRating"),
        "never publish a star rating we cannot back with visible approved reviews");
    }
    if (!BUSINESS.PRICING_CONFIRMED) {
      check(`${r.route}: no offers/priceRange while pricing is unconfirmed`,
        !flat.includes('"offers"') && !flat.includes("priceRange"),
        "seed prices must not be published as confirmed offers");
    }
    if (!BUSINESS.HOURS_CONFIRMED) {
      check(`${r.route}: no openingHours while hours are unconfirmed`,
        !flat.includes("openingHours"));
    }
  });
});

/* ---- 5. the confirmed address is the one that ships ---- */
routes.forEach((r) => {
  const html = fs.readFileSync(fileFor(r.route), "utf8");
  ["34 112th", "32/34"].forEach((wrong) => {
    check(`${r.route}: does not contain unconfirmed address "${wrong}"`, !html.includes(wrong));
  });
});

/* ---- 6. SKU integrity ---- */
const skus = CUTS.CUTS.map((c) => c.sku);
check("SKUs are unique", new Set(skus).size === skus.length);
check("SKUs all match NWB-###", skus.every((s) => /^NWB-\d{3}$/.test(s)));
const slugs = CUTS.CUTS.map((c) => c.slug);
check("slugs are unique", new Set(slugs).size === slugs.length);
check("every cut references a real service",
  CUTS.CUTS.every((c) => !!L.SERVICES.get(c.serviceId)));
check("every cut's add-ons exist",
  CUTS.CUTS.every((c) => c.addons.every((a) => !!L.ADDONS.get(a))));

/* ---- 7. SKU shortlinks resolve ---- */
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
CUTS.active().forEach((c) => {
  const short = "/" + c.sku.toLowerCase();
  const rule = vercel.redirects.find((x) => x.source === short);
  check(`shortlink ${short} exists`, !!rule);
  if (rule) check(`shortlink ${short} lands on a real page`, fs.existsSync(fileFor(rule.destination)));
});

/* ---- 8. CSP covers every inline JSON-LD block ---- */
const csp = vercel.headers[0].headers.find((h) => h.key === "Content-Security-Policy").value;
check("CSP has no 'unsafe-inline' in script-src",
  !/script-src[^;]*unsafe-inline/.test(csp));
check("CSP allows the Booksy iframe", /frame-src[^;]*booksy\.com/.test(csp));
check("CSP allows Google Fonts stylesheet", /style-src[^;]*fonts\.googleapis\.com/.test(csp));

const crypto = require("crypto");
let missingHash = 0;
routes.forEach((r) => {
  const html = fs.readFileSync(fileFor(r.route), "utf8");
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach((m) => {
    const h = "'sha256-" + crypto.createHash("sha256").update(m[1], "utf8").digest("base64") + "'";
    if (!csp.includes(h)) missingHash++;
  });
});
check("every inline JSON-LD block is hashed in the CSP", missingHash === 0,
  missingHash + " block(s) would be blocked in production");

/* ---- 9. no secrets committed ---- */
const SECRET = /(re_[A-Za-z0-9]{20,}|sk_live|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)/;
function scan(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/^(node_modules|\.git|qa-screenshots)$/.test(e.name)) scan(full); return; }
    if (!/\.(js|html|json|css|txt|md)$/.test(e.name)) return;
    if (full === __filename) return;   /* this file *contains* the patterns it looks for */
    const body = fs.readFileSync(full, "utf8");
    if (SECRET.test(body)) {
      fail++; problems.push("possible secret committed in " + path.relative(ROOT, full));
    }
  });
}
scan(ROOT);
check("no secrets committed", true);   /* scan() records its own failures */

/* ---- report ---- */
if (problems.length) {
  console.log("FAILURES:\n");
  problems.forEach((p) => console.log("  ✗ " + p));
  console.log("");
}
console.log(`${pass} passed, ${fail} failed`);
console.log(`(${routes.length} routes checked across 2 locales)\n`);
process.exit(fail ? 1 : 0);
