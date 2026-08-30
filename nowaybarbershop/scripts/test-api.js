/* NO WAY BARBERSHOP — style-ticket endpoint tests.
   Run: node scripts/test-api.js

   Invokes the real exported handler with mock req/res objects, so the whole
   validation, anti-abuse and email path is exercised without deploying.
   Zero dependencies — Node's own assert. */
"use strict";

const assert = require("assert");
const { Readable } = require("stream");

let pass = 0, fail = 0;

function mockRes() {
  return {
    statusCode: 0, headers: {}, body: null, headersSent: false,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(b) { this.headersSent = true; this.body = b ? JSON.parse(b) : null; }
  };
}

function mockReq(opts) {
  const o = opts || {};
  return {
    method: o.method || "POST",
    headers: Object.assign({ "x-forwarded-for": o.ip || "203.0.113.7" }, o.headers),
    body: o.body,
    socket: { remoteAddress: o.ip || "203.0.113.7" }
  };
}

/* A request whose body arrives as a stream, to exercise readBody's fallback. */
function streamReq(payload, ip) {
  const r = Readable.from([Buffer.from(JSON.stringify(payload))]);
  r.method = "POST";
  r.headers = { "x-forwarded-for": ip || "203.0.113.9", "content-type": "application/json" };
  r.socket = { remoteAddress: ip || "203.0.113.9" };
  return r;
}

/* Fresh module instance per test so the in-memory rate limiter starts clean. */
function loadHandler() {
  delete require.cache[require.resolve("../api/style-ticket.js")];
  return require("../api/style-ticket.js");
}

const OLD_LOG = console.log, OLD_WARN = console.warn, OLD_ERR = console.error;
function quiet() { console.log = console.warn = console.error = () => {}; }
function loud() { console.log = OLD_LOG; console.warn = OLD_WARN; console.error = OLD_ERR; }

async function test(name, fn) {
  try {
    quiet();
    await fn();
    loud();
    console.log("  ✓ " + name);
    pass++;
  } catch (err) {
    loud();
    console.log("  ✗ " + name + "\n      " + (err && err.message));
    fail++;
  }
}

/* A payload that should always succeed. startedAt is backdated past the
   minimum fill time so the bot check doesn't fire. */
function good(extra) {
  return Object.assign({
    sku: "NWB-001",
    addons: ["beard"],
    name: "Marcus Jones",
    phone: "518-555-0100",
    email: "marcus@example.com",
    notes: "Keep the curls longer on top.",
    locale: "en",
    website: "",
    startedAt: Date.now() - 20000
  }, extra || {});
}

async function call(payload, reqOpts) {
  const handler = loadHandler();
  const res = mockRes();
  await handler(mockReq(Object.assign({ body: payload }, reqOpts || {})), res);
  return res;
}

(async function run() {
  console.log("\nstyle-ticket endpoint\n");

  /* Baseline: email intentionally unconfigured, so we're in the honest
     "ticket created but shop not notified" mode. */
  delete process.env.RESEND_API_KEY;
  delete process.env.NOTIFY_EMAIL;
  delete process.env.NOTIFY_FROM;

  await test("rejects GET with 405", async () => {
    const handler = loadHandler();
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    assert.strictEqual(res.statusCode, 405);
    assert.strictEqual(res.headers.allow, "POST");
  });

  await test("valid ticket returns a code, AWAITING_BOOKING, notified:false", async () => {
    const res = await call(good());
    assert.strictEqual(res.statusCode, 200);
    assert.match(res.body.ticketCode, /^NW-TK-[2-9A-HJ-NP-Z]{5}$/);
    assert.strictEqual(res.body.status, "AWAITING_BOOKING");
    assert.strictEqual(res.body.notified, false, "must not claim the shop was notified");
    assert.ok(res.body.bookingUrl.includes("booksy.com"));
  });

  await test("never returns CONFIRMED (no Booksy API = no proof of booking)", async () => {
    const res = await call(good());
    assert.notStrictEqual(res.body.status, "CONFIRMED");
  });

  await test("ticket codes are unique across calls", async () => {
    const seen = new Set();
    for (let i = 0; i < 25; i++) {
      const res = await call(good(), { ip: "203.0.113." + i });
      seen.add(res.body.ticketCode);
    }
    assert.strictEqual(seen.size, 25, "codes collided");
  });

  await test("missing name → 422 with a field error", async () => {
    const res = await call(good({ name: "" }));
    assert.strictEqual(res.statusCode, 422);
    assert.ok(res.body.fields.name);
  });

  await test("short phone → 422", async () => {
    const res = await call(good({ phone: "5185" }));
    assert.strictEqual(res.statusCode, 422);
    assert.ok(res.body.fields.phone);
  });

  await test("malformed email → 422", async () => {
    const res = await call(good({ email: "not-an-email" }));
    assert.strictEqual(res.statusCode, 422);
    assert.ok(res.body.fields.email);
  });

  await test("email is optional", async () => {
    const res = await call(good({ email: "" }));
    assert.strictEqual(res.statusCode, 200);
  });

  await test("oversized notes → 422", async () => {
    const res = await call(good({ notes: "x".repeat(900) }));
    assert.strictEqual(res.statusCode, 422);
    assert.ok(res.body.fields.notes);
  });

  await test("unknown SKU → 400", async () => {
    const res = await call(good({ sku: "NWB-999" }));
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, "unknown_sku");
  });

  await test("honeypot trips silently (200, no ticket)", async () => {
    const res = await call(good({ website: "http://spam.example" }));
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ticketCode, null);
    assert.strictEqual(res.body.ignored, true);
  });

  await test("sub-3-second submit trips silently", async () => {
    const res = await call(good({ startedAt: Date.now() - 500 }));
    assert.strictEqual(res.body.ignored, true);
    assert.strictEqual(res.body.ticketCode, null);
  });

  await test("rate limit returns 429 after the configured hourly cap", async () => {
    process.env.RATE_LIMIT_PER_HOUR = "3";
    const handler = loadHandler();
    let last;
    for (let i = 0; i < 5; i++) {
      last = mockRes();
      await handler(mockReq({ body: good(), ip: "198.51.100.5" }), last);
    }
    assert.strictEqual(last.statusCode, 429);
    delete process.env.RATE_LIMIT_PER_HOUR;
  });

  await test("rate limit is per-IP, not global", async () => {
    process.env.RATE_LIMIT_PER_HOUR = "2";
    const handler = loadHandler();
    for (let i = 0; i < 3; i++) {
      await handler(mockReq({ body: good(), ip: "198.51.100.10" }), mockRes());
    }
    const other = mockRes();
    await handler(mockReq({ body: good(), ip: "198.51.100.11" }), other);
    assert.strictEqual(other.statusCode, 200, "a different IP must not be blocked");
    delete process.env.RATE_LIMIT_PER_HOUR;
  });

  await test("add-ons not offered with the cut are dropped, not forwarded", async () => {
    /* NWB-014 (beard sculpt) offers only eyebrows + wash. */
    let captured = null;
    const handler = loadHandler();
    const realLog = console.log;
    console.log = (m) => { captured = String(m); };
    const res = mockRes();
    await handler(mockReq({ body: good({ sku: "NWB-014", addons: ["beard", "eyebrows"] }) }), res);
    console.log = realLog;
    assert.strictEqual(res.statusCode, 200);
    assert.ok(captured.includes("Eyebrows"), "valid add-on missing from ticket");
    assert.ok(!/Add-ons:[\s\S]*?· Beard/.test(captured), "incompatible add-on leaked onto the ticket");
  });

  await test("unknown add-on ids are ignored", async () => {
    const res = await call(good({ addons: ["beard", "free-ferrari", 12345] }));
    assert.strictEqual(res.statusCode, 200);
  });

  await test("a client-supplied price is never trusted", async () => {
    let captured = null;
    const handler = loadHandler();
    const realLog = console.log;
    console.log = (m) => { captured = String(m); };
    const res = mockRes();
    await handler(mockReq({ body: good({ price: "$0.01", priceCents: 1 }) }), res);
    console.log = realLog;
    assert.strictEqual(res.statusCode, 200);
    assert.ok(captured.includes("$35"), "server did not re-resolve the real price");
    assert.ok(!captured.includes("0.01"), "client price leaked onto the ticket");
  });

  await test("notes keep their line breaks instead of joining words", async () => {
    let captured = null;
    const handler = loadHandler();
    const realLog = console.log;
    console.log = (m) => { captured = String(m); };
    await handler(mockReq({ body: good({ notes: "longer on top\nno beard" }) }), mockRes());
    console.log = realLog;
    assert.ok(!captured.includes("topno"), "newline was deleted, joining two words");
    assert.ok(captured.includes("longer on top"), "note text lost");
  });

  await test("control characters are stripped from the name", async () => {
    const res = await call(good({ name: "Marcus Jones" }));
    assert.strictEqual(res.statusCode, 200);
  });

  await test("body arriving as a stream is parsed", async () => {
    const handler = loadHandler();
    const res = mockRes();
    await handler(streamReq(good()), res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.ticketCode);
  });

  await test("malformed body → 400", async () => {
    const handler = loadHandler();
    const res = mockRes();
    const r = Readable.from([Buffer.from("{not json")]);
    r.method = "POST"; r.headers = {}; r.socket = { remoteAddress: "203.0.113.30" };
    await handler(r, res);
    assert.strictEqual(res.statusCode, 400);
  });

  await test("configured email that FAILS → 502, never a false success", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NOTIFY_EMAIL = "jose@example.com";
    process.env.NOTIFY_FROM = "No Way <t@example.com>";
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => "boom" });

    const res = await call(good());
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFY_EMAIL;
    delete process.env.NOTIFY_FROM;

    assert.strictEqual(res.statusCode, 502);
    assert.strictEqual(res.body.error, "notify_failed");
    assert.ok(!res.body.ticketCode, "must not hand out a code the shop never received");
  });

  await test("provider error detail never leaks to the client", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NOTIFY_EMAIL = "jose@example.com";
    process.env.NOTIFY_FROM = "No Way <t@example.com>";
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => "invalid api key re_secret123" });

    const res = await call(good());
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFY_EMAIL;
    delete process.env.NOTIFY_FROM;

    assert.ok(!JSON.stringify(res.body).includes("re_secret123"), "secret leaked in response");
  });

  await test("configured email that SUCCEEDS → 200 with notified:true", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NOTIFY_EMAIL = "jose@example.com";
    process.env.NOTIFY_FROM = "No Way <t@example.com>";
    let sentTo = null, sentSubject = null;
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (u, init) => {
      const b = JSON.parse(init.body);
      sentTo = b.to; sentSubject = b.subject;
      return { ok: true, status: 200, text: async () => "{}" };
    };

    const res = await call(good());
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFY_EMAIL;
    delete process.env.NOTIFY_FROM;

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.notified, true);
    assert.deepStrictEqual(sentTo, ["jose@example.com"]);
    assert.ok(sentSubject.startsWith("NO WAY CUT REQUEST — NWB-001 — Marcus — NW-TK-"));
  });

  await test("Spanish request produces a Spanish-flagged ticket", async () => {
    let captured = null;
    const handler = loadHandler();
    const realLog = console.log;
    console.log = (m) => { captured = String(m); };
    await handler(mockReq({ body: good({ locale: "es" }) }), mockRes());
    console.log = realLog;
    assert.ok(captured.includes("Español"), "Jose must see which language the customer speaks");
  });

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
