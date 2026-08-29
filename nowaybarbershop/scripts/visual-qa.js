/* NO WAY BARBERSHOP — visual QA.
   Run:  node scripts/dev-server.js &
         node scripts/visual-qa.js

   Screenshots every key page at four widths in both languages and asserts
   there is no horizontal overflow. Spanish strings run longer than English,
   and that is exactly where a mobile layout breaks — so this checks rather
   than trusts.

   DEV ONLY. Playwright is not a project dependency (this repo ships with zero
   npm packages); install it wherever you like and point NODE_PATH at it:

     npm install playwright --prefix /tmp/pw
     NODE_PATH=/tmp/pw/node_modules node scripts/visual-qa.js

   Uses the preinstalled Chromium — never downloads a browser. */
"use strict";

const fs = require("fs");
const path = require("path");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (e) {
  console.error("playwright not found. See the header of this file for setup.");
  process.exit(2);
}

const BASE = process.env.QA_BASE || "http://127.0.0.1:4173";
const OUT = path.join(__dirname, "..", "qa-screenshots");

const VIEWPORTS = [
  { name: "phone-390", width: 390, height: 844 },     /* iPhone 14/15 baseline */
  { name: "phone-430", width: 430, height: 932 },     /* iPhone Pro Max */
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 }
];

const PAGES = [
  { name: "home-en", url: "/en" },
  { name: "home-es", url: "/es" },
  { name: "cuts-en", url: "/en/cuts" },
  { name: "cuts-es", url: "/es/cortes" },
  { name: "detail-en", url: "/en/cuts/low-taper-fade" },
  { name: "detail-es", url: "/es/cortes/low-taper-fade" },
  { name: "book-en", url: "/en/book" },
  { name: "book-es", url: "/es/reservar" },
  { name: "jose-es", url: "/es/jose" },
  { name: "policies-es", url: "/es/politicas" }
];

/* Find an installed Chromium, preferring a full browser over a headless shell. */
function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  const candidates = [];
  let entries = [];
  try { entries = fs.readdirSync(root); } catch (e) { return null; }

  for (const dir of entries) {
    for (const rel of ["chrome-linux/chrome", "chrome-linux/headless_shell", "chrome-linux64/chrome"]) {
      const full = path.join(root, dir, rel);
      if (fs.existsSync(full)) candidates.push(full);
    }
  }
  candidates.sort((a, b) => (a.endsWith("/chrome") ? -1 : 1) - (b.endsWith("/chrome") ? -1 : 1));
  return candidates[0] || null;
}

async function launchChromium() {
  const exe = findChromium();
  const opts = { args: ["--no-sandbox", "--disable-dev-shm-usage"] };

  /* A headless browser does not inherit the shell's proxy settings. Without
     this the Google Fonts request fails silently and every page renders in a
     fallback face — which would invalidate the overflow measurements, since
     Anton and a system sans have very different metrics. */
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy ||
                process.env.HTTP_PROXY || process.env.http_proxy;
  if (proxy) {
    opts.proxy = { server: proxy, bypass: "127.0.0.1,localhost" };
    console.log("proxying browser traffic via " + proxy.replace(/\/\/[^@]*@/, "//***@"));
  }
  /* The proxy terminates TLS with its own CA, which the browser does not trust. */
  if (fs.existsSync("/root/.ccr/ca-bundle.crt")) opts.args.push("--ignore-certificate-errors");

  if (exe) {
    console.log("using chromium: " + exe);
    return chromium.launch(Object.assign({ executablePath: exe }, opts));
  }
  return chromium.launch(opts);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  /* Use whatever Chromium is already on the machine rather than downloading
     one. The playwright package and the installed browser build can disagree
     on version, so resolve the binary by globbing instead of trusting the
     package's expected path. */
  const browser = await launchChromium();

  let pass = 0;
  const problems = [];

  /* ONE context for the whole run, resized between viewports. A context per
     viewport gets a cold HTTP cache each time, so every page re-fetches the
     webfonts — which is the difference between a 20-minute run and a 2-minute
     one when the fonts come through a proxy. */
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  /* Warm the font cache once and confirm the real faces are in use — layout
     measured in a fallback face would not be a valid test. */
  await page.goto(BASE + "/en", { waitUntil: "load", timeout: 20000 });
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  const fontsOk = await page.evaluate(() =>
    !!(document.fonts && document.fonts.check("16px Anton") && document.fonts.check("16px Oswald")));
  console.log("webfonts loaded: " + fontsOk + (fontsOk ? "" : "  (measurements will not reflect production)"));

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const p of PAGES) {
      consoleErrors.length = 0;
      /* "load" not "networkidle": the Google Fonts request goes out through a
         proxy here and networkidle waits on it for many seconds per page. Wait
         for fonts explicitly instead, with a cap, so a slow font never stalls
         the run but text is still measured in its real face. */
      const res = await page.goto(BASE + p.url, { waitUntil: "load", timeout: 20000 });
      await page.evaluate(() =>
        Promise.race([
          document.fonts ? document.fonts.ready : Promise.resolve(),
          new Promise((r) => setTimeout(r, 2000))
        ])
      );

      if (!res || res.status() >= 400) {
        problems.push(`${vp.name} ${p.url}: HTTP ${res ? res.status() : "no response"}`);
        continue;
      }

      /* Scroll-reveal only fires for what's in view, so a full-page screenshot
         would capture everything below the fold at opacity:0 and tell us
         nothing about the design. Force every section revealed first — and
         measure overflow against the fully laid-out page, which is where a
         wide element actually shows up. */
      await page.evaluate(() => {
        document.querySelectorAll(".nw-reveal").forEach((el) => el.classList.add("in"));
      });
      await page.waitForTimeout(150);

      /* The check that matters on a phone: nothing may push the page sideways. */
      const metrics = await page.evaluate(() => {
        const de = document.documentElement;
        const offenders = [];
        if (de.scrollWidth > de.clientWidth) {
          document.querySelectorAll("body *").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > de.clientWidth + 1 || r.left < -1) {
              offenders.push(el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "") + ` [${Math.round(r.left)}..${Math.round(r.right)}]`);
            }
          });
        }
        /* Tap targets that would be hard to hit with a thumb. */
        const small = [];
        document.querySelectorAll("a, button, input, select, textarea").forEach((el) => {
          const r = el.getBoundingClientRect();
          const styles = getComputedStyle(el);
          if (styles.display === "none" || styles.visibility === "hidden" || r.width === 0) return;
          if (r.height > 0 && r.height < 32) small.push(el.tagName.toLowerCase() + " h=" + Math.round(r.height));
        });
        return {
          scrollWidth: de.scrollWidth,
          clientWidth: de.clientWidth,
          offenders: offenders.slice(0, 5),
          small: small.slice(0, 5),
          title: document.title,
          lang: de.getAttribute("lang")
        };
      });

      if (metrics.scrollWidth > metrics.clientWidth) {
        problems.push(`${vp.name} ${p.url}: horizontal overflow ${metrics.scrollWidth}>${metrics.clientWidth} — ${metrics.offenders.join(", ")}`);
      } else pass++;

      if (metrics.small.length) {
        problems.push(`${vp.name} ${p.url}: small tap targets — ${metrics.small.join(", ")}`);
      }
      if (consoleErrors.length) {
        problems.push(`${vp.name} ${p.url}: console errors — ${consoleErrors.slice(0, 3).join(" | ")}`);
      }

      await page.screenshot({ path: path.join(OUT, `${p.name}__${vp.name}.png`), fullPage: vp.width < 800 });
    }
  }

  await ctx.close();
  await browser.close();

  console.log(`\nvisual QA: ${pass}/${VIEWPORTS.length * PAGES.length} viewport-page combos clean`);
  if (problems.length) {
    console.log("\nPROBLEMS:");
    problems.forEach((p) => console.log("  ✗ " + p));
  } else {
    console.log("no overflow, no small tap targets, no console errors");
  }
  console.log(`\nscreenshots → ${OUT}\n`);
  process.exit(problems.length ? 1 : 0);
})();
