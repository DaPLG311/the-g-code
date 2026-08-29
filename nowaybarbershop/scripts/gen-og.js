/* NO WAY BARBERSHOP — social share card generator.
   Run:  node scripts/dev-server.js &
         NODE_PATH=/tmp/pw/node_modules node scripts/gen-og.js

   Renders the branded 1200x630 card used by og:image on every page. Without a
   real file here, every share of a cut page — which is the whole social→sale
   loop — would unfurl as a broken image on Facebook, iMessage and WhatsApp.

   DEV ONLY, run occasionally. Playwright is not a project dependency; see
   scripts/visual-qa.js for setup. Commit the generated .jpg.

   Once real shop photography exists, replace this with a photo-based card —
   a picture of Jose's actual work will outperform a typographic one. */
"use strict";

const fs = require("fs");
const path = require("path");

let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { console.error("playwright not found — see scripts/visual-qa.js header."); process.exit(2); }

const OUT_DIR = path.join(__dirname, "..", "assets", "media", "brand");

const CARD = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@500;600&display=swap" rel="stylesheet" />
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:#090A0D;
       font-family:'Inter',system-ui,sans-serif;position:relative}
  .bg{position:absolute;inset:0;background:linear-gradient(150deg,#071C3C 0%,#090A0D 62%)}
  .glow-o{position:absolute;top:-28%;left:-12%;width:70%;height:105%;
       background:radial-gradient(ellipse at center,rgba(255,114,0,.45) 0%,transparent 62%);filter:blur(18px)}
  .glow-b{position:absolute;bottom:-38%;right:-16%;width:78%;height:112%;
       background:radial-gradient(ellipse at center,rgba(22,119,255,.42) 0%,transparent 62%);filter:blur(22px)}
  .streaks{position:absolute;inset:0;opacity:.4;background-image:
      linear-gradient(105deg,transparent 0 46%,rgba(255,114,0,.55) 46% 46.7%,transparent 47%),
      linear-gradient(105deg,transparent 0 60%,rgba(22,119,255,.5) 60% 60.6%,transparent 61%),
      linear-gradient(105deg,transparent 0 74%,rgba(185,190,199,.25) 74% 74.4%,transparent 75%)}
  .in{position:relative;z-index:2;padding:74px 80px;height:100%;display:flex;flex-direction:column;justify-content:center}
  .eyebrow{font-family:'Oswald',sans-serif;font-size:23px;letter-spacing:.34em;
       text-transform:uppercase;color:#B9BEC7;margin-bottom:26px}
  h1{font-family:'Anton',Impact,sans-serif;font-size:172px;line-height:.82;
       letter-spacing:.012em;color:#F7F7F4;text-transform:uppercase}
  h1 span{color:#FF7200}
  .sub{font-family:'Anton',Impact,sans-serif;font-size:47px;letter-spacing:.155em;
       color:#FF7200;text-transform:uppercase;margin-top:16px}
  .rule{width:132px;height:5px;background:#FF7200;margin:38px 0 26px}
  .tag{font-family:'Oswald',sans-serif;font-size:31px;letter-spacing:.1em;
       text-transform:uppercase;color:#F7F7F4}
  .tag b{color:#1677FF;font-weight:600}
  .foot{position:absolute;bottom:52px;left:80px;right:80px;display:flex;
       justify-content:space-between;align-items:flex-end;
       font-family:'Oswald',sans-serif;font-size:20px;letter-spacing:.17em;
       text-transform:uppercase;color:#7C838F}
  .sku{border:1px solid rgba(255,212,59,.5);color:#FFD43B;padding:8px 16px;border-radius:3px;font-size:17px;letter-spacing:.19em}
</style></head><body>
  <div class="bg"></div><div class="glow-o"></div><div class="glow-b"></div><div class="streaks"></div>
  <div class="in">
    <div class="eyebrow">Troy, New York</div>
    <h1>NO <span>WAY</span></h1>
    <div class="sub">Barbershop</div>
    <div class="rule"></div>
    <div class="tag">See the cut. <b>Book the cut.</b></div>
  </div>
  <div class="foot"><span>nowaybarbershop.com</span><span class="sku">NWB Cut System</span></div>
</body></html>`;

function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  let entries = [];
  try { entries = fs.readdirSync(root); } catch (e) { return null; }
  for (const dir of entries) {
    for (const rel of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-linux/headless_shell"]) {
      const full = path.join(root, dir, rel);
      if (fs.existsSync(full)) return full;
    }
  }
  return null;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const exe = findChromium();
  /* Same proxy caveat as visual-qa.js: a headless browser inherits no proxy
     settings, and without the webfonts this card renders in a fallback face. */
  const opts = { args: ["--no-sandbox", "--disable-dev-shm-usage", "--ignore-certificate-errors"] };
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) opts.proxy = { server: proxy, bypass: "127.0.0.1,localhost" };
  if (exe) opts.executablePath = exe;
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  await page.setContent(CARD, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);

  const out = path.join(OUT_DIR, "og-default.jpg");
  await page.screenshot({ path: out, type: "jpeg", quality: 88 });
  await browser.close();

  console.log("✓ " + path.relative(path.join(__dirname, ".."), out) +
              " (" + Math.round(fs.statSync(out).size / 1024) + " KB)");
})();
