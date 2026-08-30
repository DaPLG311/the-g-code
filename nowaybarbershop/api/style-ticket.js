/* NO WAY BARBERSHOP — style ticket endpoint.
   POST /api/style-ticket

   Takes a cut selection and turns it into a digital barber ticket in Jose's
   inbox. Zero npm dependencies: Node 22 on Vercel has global fetch and crypto,
   so this project still has no package.json and no node_modules.

   HONESTY RULES BAKED IN
   · The price and service are re-resolved SERVER-SIDE from the SKU. A client
     can send us an id; it can never send us a price.
   · The response status is always AWAITING_BOOKING. We have no Booksy API
     connection, so we have no evidence an appointment exists and we never
     claim one.
   · If email is not configured we return the ticket with notified:false and the
     UI tells the customer plainly to call the shop. If email IS configured and
     the send fails, we return an error — we have no database, so the ticket
     really is lost and pretending otherwise would strand the customer. */
"use strict";

const path = require("path");
const crypto = require("crypto");

const BUSINESS = require(path.join(__dirname, "../data/business.js"));
const CUTS     = require(path.join(__dirname, "../data/cuts.js"));
const SERVICES = require(path.join(__dirname, "../data/services.js"));
const ADDONS   = require(path.join(__dirname, "../data/addons.js"));

const MAX_NOTES = 600;
const MIN_FILL_MS = 3000;   /* a human cannot fill this form in under 3 seconds */

/* ---------------------------------------------------------------- rate limit
   Best-effort only, and worth being clear about: Vercel runs many ephemeral
   instances, so this Map is per-instance and resets on cold start. It stops
   naive hammering, not a distributed attack. The honeypot and the fill-time
   check do the heavier lifting. Move to a shared store if abuse ever appears. */
const hits = new Map();

function rateLimited(ip) {
  const limit = Number(process.env.RATE_LIMIT_PER_HOUR || 5);
  const now = Date.now();
  const rec = hits.get(ip);

  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 3600000 });
    if (hits.size > 5000) hits.clear();          /* bound memory */
    return false;
  }
  rec.count += 1;
  return rec.count > limit;
}

/* ---------------------------------------------------------------- helpers */
const TICKET_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";  /* no 0/O, no 1/I */

/* Non-sequential and non-guessable: a ticket code must never let someone
   enumerate other customers' requests. */
function ticketCode() {
  const bytes = crypto.randomBytes(5);
  let out = "";
  for (let i = 0; i < 5; i++) out += TICKET_ALPHABET[bytes[i] % TICKET_ALPHABET.length];
  return BUSINESS.ticketPrefix + out;
}

/* Strip control characters, then collapse whitespace and bound the length.
   Control chars are replaced with a space rather than deleted: deleting a
   newline would silently join "longer on top" and "no beard" into one word on
   Jose's ticket. The class is written with escapes so this file stays plain
   text and reviewable in a diff. */
function clean(v, max) {
  return String(v == null ? "" : v)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/* Notes are the one field where the customer's own line breaks carry meaning,
   so newlines survive here while every other control character does not. */
function cleanMultiline(v, max) {
  return String(v == null ? "" : v)
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[ \n]+|[ \n]+$/g, "")
    .slice(0, max);
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

/* Vercel populates req.body for JSON requests, but read the stream when it
   hasn't (and when this runs under the local test harness). */
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return null; } }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) return null;               /* refuse oversized payloads */
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { return null; }
}

/* ---------------------------------------------------------------- validate */
function validate(input, locale) {
  const isEs = locale === "es";
  const msg = {
    required: isEs ? "Obligatorio" : "Required",
    phone: isEs ? "Escribe un número de teléfono válido." : "Please enter a valid phone number.",
    email: isEs ? "Escribe un correo electrónico válido." : "Please enter a valid email address.",
    long: isEs ? "Eso es un poco largo." : "That's a bit too long."
  };

  const fields = {};
  const name = clean(input.name, 80);
  if (!name) fields.name = msg.required;

  const phoneRaw = clean(input.phone, 25);
  const digits = phoneRaw.replace(/\D/g, "");
  if (!phoneRaw) fields.phone = msg.required;
  else if (digits.length < 10 || digits.length > 15) fields.phone = msg.phone;

  const email = clean(input.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = msg.email;

  const notes = cleanMultiline(input.notes, MAX_NOTES + 1);
  if (notes.length > MAX_NOTES) fields.notes = msg.long;

  return { fields, name, phone: phoneRaw, email, notes: notes.slice(0, MAX_NOTES) };
}

/* ------------------------------------------------------------------- email */
function buildEmail(ticket, locale) {
  const cut = ticket.cut;
  const svc = ticket.service;
  const isEs = ticket.customerLocale === "es";
  const cutName = isEs ? cut.name_es : cut.name_en;
  const svcName = svc ? (isEs ? svc.name_es : svc.name_en) : "—";
  const origin = process.env.SITE_ORIGIN || BUSINESS.domain;
  const cutUrl = origin + "/en/cuts/" + cut.slug;

  const addonLines = ticket.addons.length
    ? ticket.addons.map((a) => "  · " + a.name_en + " / " + a.name_es).join("\n")
    : "  None";

  const price = svc
    ? SERVICES.formatPrice(svc.priceCents) + (svc.priceFrom ? "+" : "")
    : "—";

  const text = `NEW NO WAY CUT REQUEST

Customer:        ${ticket.name}
Phone:           ${ticket.phone}
Email:           ${ticket.email || "—"}
Speaks:          ${ticket.customerLocale === "es" ? "Español" : "English"}

Cut:             ${cut.sku}
Style:           ${cutName}
Service:         ${svcName}
Price (from):    ${price}
Time:            ${svc ? svc.durationMinutes + " min" : "—"}

Add-ons:
${addonLines}

Notes:
${ticket.notes ? "  " + ticket.notes : "  —"}

Style Ticket:    ${ticket.code}
Booking status:  AWAITING BOOKING
                 The customer has NOT booked yet. They were sent to Booksy to
                 pick a time. Nothing is on the calendar until they do.

Cut page:        ${cutUrl}
Submitted:       ${ticket.createdAt}
`;

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const row = (k, v) =>
    `<tr><td style="padding:7px 14px 7px 0;color:#7C838F;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${esc(k)}</td>` +
    `<td style="padding:7px 0;color:#F7F7F4;font:400 15px/1.5 Arial,sans-serif;">${v}</td></tr>`;

  const html = `<div style="background:#090A0D;padding:26px;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#101218;border:1px solid rgba(185,190,199,.16);border-radius:6px;overflow:hidden;">
    <div style="background:#FF7200;padding:16px 22px;">
      <div style="color:#090A0D;font:700 12px/1 Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;">New No Way Cut Request</div>
    </div>
    <div style="padding:22px;">
      <div style="display:inline-block;background:#090A0D;border:1px solid rgba(255,212,59,.45);color:#FFD43B;font:700 15px/1 Arial,sans-serif;letter-spacing:.16em;padding:9px 15px;border-radius:3px;margin-bottom:6px;">${esc(cut.sku)}</div>
      <h1 style="color:#F7F7F4;font:700 24px/1.15 Arial,sans-serif;margin:12px 0 20px;">${esc(cutName)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Customer", esc(ticket.name))}
        ${row("Phone", `<a href="tel:${esc(ticket.phone.replace(/\D/g, ""))}" style="color:#FF7200;text-decoration:none;">${esc(ticket.phone)}</a>`)}
        ${row("Email", ticket.email ? `<a href="mailto:${esc(ticket.email)}" style="color:#FF7200;text-decoration:none;">${esc(ticket.email)}</a>` : "—")}
        ${row("Speaks", ticket.customerLocale === "es" ? "Español" : "English")}
        ${row("Service", esc(svcName))}
        ${row("Price from", esc(price))}
        ${row("Time", svc ? svc.durationMinutes + " min" : "—")}
        ${row("Add-ons", ticket.addons.length ? ticket.addons.map((a) => esc(a.name_en)).join(", ") : "None")}
        ${row("Notes", ticket.notes ? esc(ticket.notes) : "—")}
        ${row("Ticket", `<strong style="color:#FFD43B;letter-spacing:.12em;">${esc(ticket.code)}</strong>`)}
      </table>
      <div style="margin-top:20px;padding:13px 16px;background:rgba(255,212,59,.09);border:1px solid rgba(255,212,59,.35);border-radius:4px;color:#F7F7F4;font:400 13px/1.5 Arial,sans-serif;">
        <strong>Awaiting booking.</strong> The customer has not booked yet — they were sent to Booksy to pick a time. Nothing is on the calendar until they do.
      </div>
      <a href="${esc(cutUrl)}" style="display:inline-block;margin-top:18px;background:#FF7200;color:#090A0D;font:700 13px/1 Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:13px 20px;border-radius:4px;text-decoration:none;">View ${esc(cut.sku)}</a>
      <p style="color:#7C838F;font:400 12px/1.5 Arial,sans-serif;margin:18px 0 0;">Submitted ${esc(ticket.createdAt)}</p>
    </div>
  </div>
</div>`;

  const subject = `NO WAY CUT REQUEST — ${cut.sku} — ${ticket.name.split(/\s+/)[0]} — ${ticket.code}`;
  return { subject, text, html };
}

async function sendEmail(mail) {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.NOTIFY_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.NOTIFY_FROM;

  /* Not configured. Log it so it is recoverable from the function logs, and
     tell the caller honestly that nothing was sent. */
  if (!key || !to.length || !from) {
    console.log("[style-ticket] EMAIL NOT CONFIGURED — ticket logged only:\n" + mail.text);
    return { sent: false, configured: false };
  }

  const body = { from, to, subject: mail.subject, text: mail.text, html: mail.html };
  if (process.env.NOTIFY_BCC) body.bcc = process.env.NOTIFY_BCC.split(",").map((s) => s.trim()).filter(Boolean);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    /* Log the provider error server-side; never leak it to the browser. */
    console.error("[style-ticket] resend failed", res.status, detail.slice(0, 500));
    return { sent: false, configured: true };
  }
  return { sent: true, configured: true };
}

/* -------------------------------------------------------------------- main */
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "method_not_allowed" });
  }

  const input = await readBody(req);
  if (!input || typeof input !== "object") return send(res, 400, { error: "bad_request" });

  const locale = input.locale === "es" ? "es" : "en";

  /* Bot checks first — cheap, and they keep junk out of Jose's inbox.
     Both return 200 so a bot learns nothing from the response. */
  if (clean(input.website, 100)) {
    console.warn("[style-ticket] honeypot tripped");
    return send(res, 200, { ticketCode: null, ignored: true });
  }
  const startedAt = Number(input.startedAt) || 0;
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) {
    console.warn("[style-ticket] submitted too fast");
    return send(res, 200, { ticketCode: null, ignored: true });
  }

  if (rateLimited(clientIp(req))) return send(res, 429, { error: "rate_limited" });

  /* The SKU is the only thing we trust from the client, and only after we
     confirm it names a real, active cut. */
  const cut = CUTS.bySku(clean(input.sku, 12));
  if (!cut || !cut.active) return send(res, 400, { error: "unknown_sku" });

  const v = validate(input, locale);
  if (Object.keys(v.fields).length) return send(res, 422, { error: "invalid", fields: v.fields });

  /* Re-resolve add-ons against our own data. Anything unrecognised, or not
     offered with this cut, is dropped rather than forwarded to Jose. */
  const addons = (Array.isArray(input.addons) ? input.addons : [])
    .slice(0, 10)
    .map((id) => ADDONS.get(clean(id, 40)))
    .filter((a) => a && a.active && cut.addons.indexOf(a.id) !== -1);

  const ticket = {
    code: ticketCode(),
    cut,
    service: SERVICES.get(cut.serviceId),
    addons,
    name: v.name,
    phone: v.phone,
    email: v.email,
    notes: v.notes,
    customerLocale: locale,
    createdAt: new Date().toISOString(),
    status: "AWAITING_BOOKING"
  };

  let result;
  try {
    result = await sendEmail(buildEmail(ticket, locale));
  } catch (err) {
    console.error("[style-ticket] email threw", err && err.message);
    result = { sent: false, configured: true };
  }

  /* Configured but failed: we have no database, so this ticket is genuinely
     lost. Return an error so the customer retries or calls, rather than
     walking away believing Jose has their cut. */
  if (!result.sent && result.configured) {
    return send(res, 502, { error: "notify_failed" });
  }

  return send(res, 200, {
    ticketCode: ticket.code,
    status: ticket.status,
    notified: result.sent,
    bookingUrl: BUSINESS.booking.bookingUrl
  });
};
