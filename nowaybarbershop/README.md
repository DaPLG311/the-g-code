# NO WAY BARBERSHOP — V1

Bilingual (EN/ES) website + visual haircut catalog + **No Way Cut System™** SKU
ordering + style-ticket handoff into Booksy, for No Way Barbershop LLC in Troy, NY.

**The product in one line:** see the cut, tap the cut, book the cut.
A customer who doesn't know the words "low taper fade" taps a photo instead. That
photo carries a permanent SKU (`NWB-001`), and Jose receives a complete digital
barber ticket by email before the customer sits down.

```
PHOTO → NWB SKU → OPTIONS → CUSTOMER → STYLE TICKET → EMAIL JOSE → BOOKSY
```

---

## Stack

Static HTML/CSS/vanilla JS + one Vercel serverless function. **Zero npm
dependencies** — no `package.json`, no `node_modules`, no build toolchain. The
email call uses Node 22's global `fetch`.

This folder is **fully self-contained**. It shares nothing with the Day One MVP
site it currently sits beside — its own CSS, its own `vercel.json`, its own CSP.
It deploys as its own Vercel project, and `git subtree split` will lift it into
its own repository whenever that's wanted, with no rewrite.

---

## Commands

```bash
node scripts/build.js        # regenerate every page, sitemap.xml, vercel.json
node scripts/dev-server.js   # local server at :4173 (emulates Vercel cleanUrls,
                             # redirects and /api/style-ticket)
node scripts/qa.js           # structural QA: hreflang, canonicals, schema, CSP, secrets
node scripts/test-api.js     # style-ticket endpoint tests
```

`build.js` is idempotent — running it twice produces no diff. **Never hand-edit
the generated HTML**; edit the data or the generator and rebuild.

Visual QA needs Playwright, which is deliberately not a project dependency:

```bash
npm install playwright --prefix /tmp/pw
node scripts/dev-server.js &
NODE_PATH=/tmp/pw/node_modules node scripts/visual-qa.js
```

---

## Where things live

| Edit this | To change |
|---|---|
| `data/business.js` | Address, phone, hours, domain, Booksy URL, **confirmation flags** |
| `data/cuts.js` | The cut catalog — SKUs, names, descriptions, categories |
| `data/services.js` | Prices and durations (cuts inherit these; price is never duplicated) |
| `data/addons.js` | Beard, eyebrows, enhancement, wash |
| `data/copy.js` | All UI copy in both languages + the EN↔ES route map |
| `data/reviews.js` | Customer reviews (ships empty — see below) |
| `data/content.js` | Content series and video items |

Everything else is generated.

### The confirmation flags

`data/business.js` gates anything Jose hasn't personally confirmed. While a flag
is `false` the site renders an honest fallback rather than publishing an
unverified fact:

| Flag | State | Effect while false |
|---|---|---|
| `ADDRESS_CONFIRMED` | **true** — 32 112th Street | — |
| `PRICING_CONFIRMED` | false | Prices show as "From $35" with a notice; no `offers` in schema |
| `HOURS_CONFIRMED` | false | Location card points at Booksy instead of listing hours |
| `REVIEWS_APPROVED` | false | Reviews section does not render; no `aggregateRating` |

`scripts/qa.js` enforces these — it fails the build if an unconfirmed fact leaks
into structured data.

---

## The SKU system

Every cut has a permanent `NWB-###`. **SKUs are never renumbered or recycled** —
social captions, QR codes and printed cards point at them forever. Retire a cut
with `active: false` instead.

Shortlinks are generated automatically:

```
nowaybarbershop.com/nwb-004   →  /en/cuts/skin-fade
nowaybarbershop.com/es/nwb-004 →  /es/cortes/skin-fade
```

So a Reel captioned *"ask for NWB-004"* sends people to that exact cut with a
Select button on it. That's the social→sale loop.

Adding a cut: one entry in `data/cuts.js`, then `node scripts/build.js`. Pages,
sitemap entries and shortlinks all appear.

---

## Photos

`photoPending: true` on every cut, because **no shop photography exists yet**.
Those cards render a clearly-labelled brand placeholder.

**Do not fill these with stock or AI-generated haircuts.** A barbershop's photos
are its proof of work; fake ones misrepresent Jose's craft and would be the one
genuinely dishonest thing on the site. Shoot the real cuts, drop them in at
`assets/media/cuts/<SKU>/` using the naming below, and flip the flag.

```
assets/media/cuts/NWB-001/NWB-001-hero.webp
                          NWB-001-front.webp
                          NWB-001-left.webp
                          NWB-001-right.webp
                          NWB-001-back.webp
```

---

## Booking

Booksy stays the source of truth for availability, scheduling and confirmations.
This site owns discovery, the SKU, the ticket and the brand.

**A style ticket is not an appointment.** The endpoint only ever returns
`AWAITING_BOOKING`; without a Booksy API connection we have no evidence a booking
exists and we never claim one. The success screen says so to the customer.

When Jose supplies his official Booksy widget code, paste it into
`booking.embedCode` in `data/business.js` and rebuild — it mounts automatically
and the fallback link hides itself. The CSP already allows the Booksy iframe.

---

## Deploying

1. **New Vercel project**, pointed at this repository.
2. **Root Directory:** `nowaybarbershop` — this is essential; it makes Vercel
   treat this folder as the whole site and keeps it separate from the Day One MVP
   deployment in the repo root.
3. Framework preset: **Other**. No build command, no install command. Output is
   the directory itself.
4. Set the environment variables from `.env.example` (`RESEND_API_KEY`,
   `NOTIFY_EMAIL`, `NOTIFY_FROM`). Verify the sending domain in Resend first, or
   delivery fails.
5. Add the domain `nowaybarbershop.com`.
6. Point the Google Business Profile's appointment link at
   `https://nowaybarbershop.com/en/book` so search traffic enters the visual
   funnel instead of a generic scheduler.

Until `RESEND_API_KEY` is set the endpoint runs in an honest degraded mode: it
still issues a ticket code, logs the full ticket to the function logs, returns
`notified: false`, and the customer is told on screen to call the shop. It never
pretends the email was sent.

---

## Still needed from Jose

- Confirmed service menu and prices → `data/services.js`, then flip `PRICING_CONFIRMED`
- Posted hours → `data/business.js`, then flip `HOURS_CONFIRMED`
- Which of these 15 cuts he actually offers, and what he calls them in Spanish
- Haircut photography (hero + 4 angles per SKU) and shop/Jose portraits
- Logo/signage files for vectorising
- Instagram / TikTok / Facebook handles → `data/business.js` (empty entries are
  simply not rendered — no dead links)
- Destination inbox for cut requests → `NOTIFY_EMAIL`
- Official Booksy widget embed code, if he wants the calendar inline
- Cancellation policy wording → `policiesPage()` in `scripts/build.js`
- A fluent human review of the Spanish copy before launch

---

## Not in V1

Customer accounts, rebooking, SMS, loyalty, merch, gift cards, deposits, Booksy
API integration, multi-barber. The data model is shaped so `/rebook/<token>` and
SKU↔appointment sync are additive later rather than a rebuild.
