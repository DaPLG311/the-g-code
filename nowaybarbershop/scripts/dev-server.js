/* NO WAY BARBERSHOP — local dev server.
   Run: node scripts/dev-server.js [port]      (default 4173)

   A plain static server would not tell us the truth here: production runs on
   Vercel with cleanUrls, redirects and a serverless /api route. This emulates
   all three from the generated vercel.json, so what we test locally is what
   ships. Zero dependencies — Node's own http module. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2]) || 4173;

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
const redirects = new Map((cfg.redirects || []).map((r) => [r.source, r]));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".mp4": "video/mp4", ".ico": "image/x-icon"
};

/* Resolve a request path to a file the way Vercel's cleanUrls does. */
function resolveFile(pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, "");
  const base = path.join(ROOT, rel);

  /* Refuse to serve outside the project, and never serve the data/scripts/api
     source directories as static files. */
  if (!base.startsWith(ROOT)) return null;
  if (/^(scripts|api|data|node_modules|\.git)(\/|$)/.test(rel)) return null;

  const candidates = pathname.endsWith("/")
    ? [path.join(base, "index.html")]
    : [base, base + ".html", path.join(base, "index.html")];

  for (const c of candidates) {
    try { if (fs.statSync(c).isFile()) return c; } catch (e) { /* next */ }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname.replace(/\/{2,}/g, "/");

  /* --- serverless function --- */
  if (pathname === "/api/style-ticket") {
    delete require.cache[require.resolve("../api/style-ticket.js")];
    const handler = require("../api/style-ticket.js");
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) { res.statusCode = 500; res.end('{"error":"server_error"}'); }
    }
    return;
  }

  /* --- redirects (vercel.json) --- */
  const hit = redirects.get(pathname) || redirects.get(pathname.replace(/\/$/, ""));
  if (hit) {
    res.statusCode = hit.permanent ? 308 : 307;
    res.setHeader("Location", hit.destination);
    return res.end();
  }

  /* --- static --- */
  const file = resolveFile(pathname);
  if (!file) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end("<h1>404</h1><p>Not found: " + pathname.replace(/[<>&]/g, "") + "</p>");
  }

  const body = fs.readFileSync(file);
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
  res.setHeader("Content-Length", body.length);
  res.end(body);
});

server.listen(PORT, () => {
  console.log("No Way dev server → http://127.0.0.1:" + PORT + "/en");
  console.log("(emulates Vercel cleanUrls + redirects + /api/style-ticket)");
});
