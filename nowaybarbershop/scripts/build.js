/* NO WAY BARBERSHOP — site generator.
   Run: node scripts/build.js      (from the nowaybarbershop/ folder or repo root)

   Writes every static page in BOTH languages, the per-locale runtime config,
   robots.txt, sitemap.xml and vercel.json (including the CSP hashes for the
   JSON-LD blocks and the NWB SKU shortlink redirects).

   Why generate instead of rendering client-side: each cut page needs its own
   title, description and OG image so Jose can share a single cut straight to
   Instagram and have it unfurl properly. A ?slug= view cannot do that. This
   follows the same data-in / files-out idiom as the sibling Day One MVP site's
   scripts/gen-sitemap.js.

   The generator is idempotent — running it twice produces no diff. */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const L = require("./lib.js");
const { ROOT, ASSET_V, BUSINESS, COPY, CUTS, SERVICES, ADDONS, REVIEWS, CONTENT,
        esc, attr, routeFor, priceLabel, durationLabel, head, footer, shopSchema } = L;

const LOCALES = ["en", "es"];
const written = [];

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  written.push(rel);
}

/* Route -> file on disk. vercel.json sets cleanUrls, so /en/cuts/x is served
   from en/cuts/x.html and /en/cuts from en/cuts/index.html. */
function fileFor(route) {
  return (route.endsWith("/") ? route + "index.html" : route + ".html").replace(/^\//, "");
}

/* ====================================================================== */
/*  SHARED SECTIONS                                                       */
/* ====================================================================== */

function cutCard(cut, locale) {
  const t = COPY.T[locale];
  const svc = SERVICES.get(cut.serviceId);
  const href = routeFor("cut", locale, cut.slug);
  const name = locale === "es" ? cut.name_es : cut.name_en;

  const media = cut.photoPending
    ? `<div class="nw-ph">
         <span class="nw-ph-mark">NO<br />WAY</span>
         <span class="nw-ph-label">${esc(t.cuts.photoPending)}</span>
       </div>`
    : `<img src="${attr(cut.heroImage)}" alt="${attr(name)}" loading="lazy" width="400" height="500" />`;

  return `<a class="nw-card" href="${attr(href)}" data-nw-cut-card data-nw-sku="${attr(cut.sku)}" data-nw-cat="${attr(cut.category)}">
  <div class="nw-card-media">
    <span class="nw-sku">${esc(cut.sku)}</span>
    ${media}
  </div>
  <div class="nw-card-body">
    <h3 class="nw-card-name">${esc(name)}</h3>
    <p class="nw-card-meta">${esc([priceLabel(svc, locale), durationLabel(svc, locale)].filter(Boolean).join(" · "))}</p>
    <span class="nw-card-go">${esc(t.cuts.view)} &rarr;</span>
  </div>
</a>`;
}

function ctaSection(locale) {
  const t = COPY.T[locale];
  return `<section class="nw-section nw-section--alt nw-section--edge">
  <div class="nw-wrap nw-reveal" style="text-align:center;">
    <p class="nw-kicker" style="justify-content:center;">${esc(t.cta.kicker)}</p>
    <h2>${esc(t.cta.title)}</h2>
    <p class="nw-lead" style="margin-left:auto;margin-right:auto;">${esc(t.cta.sub)}</p>
    <div class="nw-btn-row" style="justify-content:center;">
      <a class="nw-btn nw-btn--primary" href="${attr(routeFor("cuts", locale))}">${esc(t.cta.button)}</a>
      <a class="nw-btn nw-btn--ghost" href="${attr(BUSINESS.phoneHref)}" data-nw-track="phone_clicked">${esc(t.cta.call)}</a>
    </div>
  </div>
</section>`;
}

function locationSection(locale) {
  const t = COPY.T[locale];
  const A = BUSINESS.address;
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(BUSINESS.mapsQuery);

  const hours = BUSINESS.HOURS_CONFIRMED && BUSINESS.hours.length
    ? `<ul style="list-style:none;padding:0;margin:0;color:var(--nw-steel);">` +
      BUSINESS.hours.map((h) => `<li style="display:flex;justify-content:space-between;gap:16px;padding:5px 0;"><span>${esc(h.day)}</span><span>${esc(h.open)}–${esc(h.close)}</span></li>`).join("") +
      `</ul>`
    : `<p class="nw-note" style="margin:0 0 14px;">${esc(t.location.hoursFallback)}</p>
       <a class="nw-btn nw-btn--ghost" href="${attr(BUSINESS.booking.bookingUrl)}" target="_blank" rel="noopener" data-nw-booking>${esc(t.location.hoursCta)}</a>`;

  return `<section class="nw-section nw-section--edge">
  <div class="nw-wrap nw-reveal">
    <p class="nw-kicker">${esc(t.location.kicker)}</p>
    <h2>${esc(t.location.title)}</h2>
    <div class="nw-loc" style="margin-top:26px;">
      <div class="nw-loc-card">
        <address>
          <strong>${esc(BUSINESS.name)}</strong><br />
          ${esc(A.street)}<br />
          ${esc(A.locality)}, ${esc(A.region)} ${esc(A.postalCode)}<br />
          <span class="nw-note">${esc(locale === "es" ? BUSINESS.neighborhood_es : BUSINESS.neighborhood_en)}</span>
        </address>
        <div class="nw-btn-row">
          <a class="nw-btn nw-btn--ghost" href="${attr(maps)}" target="_blank" rel="noopener" data-nw-track="directions_clicked">${esc(t.location.directions)}</a>
          <a class="nw-btn nw-btn--quiet" href="${attr(BUSINESS.phoneHref)}" data-nw-track="phone_clicked">${esc(t.location.call)}</a>
        </div>
      </div>
      <div class="nw-loc-card">
        <h3 style="font-size:19px;">${esc(t.location.hoursTitle)}</h3>
        ${hours}
      </div>
    </div>
  </div>
</section>`;
}

/* Reviews render only when Jose has approved real ones. Empty = section absent,
   never a fabricated testimonial. */
function reviewsSection(locale) {
  const approved = REVIEWS.approved();
  if (!BUSINESS.REVIEWS_APPROVED || !approved.length) return "";
  const t = COPY.T[locale];
  return `<section class="nw-section nw-section--alt">
  <div class="nw-wrap nw-reveal">
    <p class="nw-kicker">${esc(t.reviews.kicker)}</p>
    <h2>${esc(t.reviews.title)}</h2>
    <div class="nw-grid nw-grid--wide" style="margin-top:24px;">
      ${approved.map((r) => `<blockquote class="nw-loc-card" style="margin:0;">
        <p style="margin:0 0 12px;color:var(--nw-white);">${esc(r.reviewText)}</p>
        <cite class="nw-card-meta" style="font-style:normal;">${esc(r.reviewerDisplayName)}${r.source ? " · " + esc(r.source) : ""}</cite>
      </blockquote>`).join("")}
    </div>
  </div>
</section>`;
}

/* ====================================================================== */
/*  PAGES                                                                 */
/* ====================================================================== */

function homePage(locale) {
  const t = COPY.T[locale];
  const feat = CUTS.featured();

  const body = `
<section class="nw-hero">
  <div class="nw-energy" aria-hidden="true"></div>
  <div class="nw-streaks" aria-hidden="true"></div>
  <div class="nw-wrap nw-hero-in">
    <div>
      <p class="nw-hero-eyebrow">${esc(t.hero.eyebrow)}</p>
      <h1>${esc(t.hero.line1)}<span class="l2">${esc(t.hero.line2)}</span></h1>
      <p class="nw-hero-head">${t.hero.headline}</p>
      <p>${esc(t.hero.sub)}</p>
      <div class="nw-btn-row">
        <a class="nw-btn nw-btn--primary" href="${attr(routeFor("cuts", locale))}">${esc(t.hero.cta1)}</a>
        <a class="nw-btn nw-btn--ghost" href="${attr(routeFor("book", locale))}">${esc(t.hero.cta2)}</a>
      </div>
    </div>
    <div class="nw-hero-media">
      <div class="nw-ph">
        <span class="nw-ph-mark">NO WAY</span>
        <span class="nw-ph-label">${esc(t.cuts.photoPending)}</span>
      </div>
    </div>
  </div>
</section>

<section class="nw-section">
  <div class="nw-wrap">
    <div class="nw-reveal">
      <p class="nw-kicker">${esc(t.pick.kicker)}</p>
      <h2>${esc(t.pick.title)}</h2>
      <p class="nw-lead">${esc(t.pick.sub)}</p>
    </div>
    <div class="nw-grid nw-reveal">${feat.map((c) => cutCard(c, locale)).join("\n")}</div>
    <div class="nw-btn-row" style="margin-top:26px;">
      <a class="nw-btn nw-btn--ghost" href="${attr(routeFor("cuts", locale))}">${esc(t.cuts.title)} &rarr;</a>
    </div>
  </div>
</section>

<section class="nw-section nw-section--alt nw-section--edge">
  <div class="nw-wrap">
    <div class="nw-reveal">
      <p class="nw-kicker nw-kicker--blue">${esc(t.how.kicker)}</p>
      <h2>${esc(t.how.title)}</h2>
    </div>
    <div class="nw-steps nw-reveal" style="margin-top:26px;">
      ${t.how.steps.map((s) => `<div class="nw-step">
        <div class="nw-step-n">${esc(s.n)}</div>
        <h3>${esc(s.t)}</h3>
        <p>${esc(s.d)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>

<section class="nw-section">
  <div class="nw-wrap nw-reveal">
    <p class="nw-kicker">${esc(t.jose.kicker)}</p>
    <h2>${esc(t.jose.title)}</h2>
    <p class="nw-lead">${esc(t.jose.lead)}</p>
    <p class="nw-body">${esc(t.jose.body)}</p>
    <div class="nw-btn-row" style="margin-top:20px;">
      <a class="nw-btn nw-btn--ghost" href="${attr(routeFor("jose", locale))}">${esc(t.jose.cta)}</a>
    </div>
  </div>
</section>

${reviewsSection(locale)}
${locationSection(locale)}
${ctaSection(locale)}
`;

  return head({
    locale,
    routeKey: "home",
    title: `${BUSINESS.name} — ${locale === "es" ? BUSINESS.tagline_es : BUSINESS.tagline_en}`,
    description: locale === "es"
      ? "Barbería en Troy, NY. Mira el corte, elige la foto y reserva. Desvanecidos, tapers, barba y cortes para niños con Jose. Atendemos en español e inglés."
      : "Barbershop in Troy, NY. See the cut, tap the photo, book it. Fades, tapers, beards and kids' cuts with Jose. English and Spanish.",
    jsonLd: [shopSchema(locale)]
  }) + body + footer(locale, {
    scripts: `<script src="/assets/js/nw-booking.js?v=${ASSET_V}"></script>`
  });
}

function cutsPage(locale) {
  const t = COPY.T[locale];
  const cuts = CUTS.active();
  const cats = CUTS.usedCategories();

  const chips = [`<button class="nw-chip" type="button" data-nw-filter="all" aria-pressed="true">${esc(t.cuts.filterAll)}</button>`]
    .concat(cats.map((c) => `<button class="nw-chip" type="button" data-nw-filter="${attr(c.id)}" aria-pressed="false">${esc(locale === "es" ? c.name_es : c.name_en)}</button>`))
    .join("");

  const body = `
<section class="nw-section">
  <div class="nw-wrap">
    <div class="nw-reveal">
      <p class="nw-kicker">${esc(t.pick.kicker)}</p>
      <h2>${esc(t.cuts.title)}</h2>
      <p class="nw-lead">${esc(t.cuts.intro)}</p>
      ${BUSINESS.PRICING_CONFIRMED ? "" : `<p class="nw-seed">${esc(t.misc.seedNotice)}</p>`}
    </div>
    <div class="nw-filters" role="group" aria-label="${attr(t.cuts.title)}">${chips}</div>
    <div class="nw-grid">${cuts.map((c) => cutCard(c, locale)).join("\n")}</div>
    <div class="nw-state nw-state--empty" id="nwCutsEmpty" hidden>
      <p style="margin:0;">${esc(t.cuts.empty)}</p>
    </div>
  </div>
</section>
${ctaSection(locale)}
`;

  return head({
    locale,
    routeKey: "cuts",
    title: `${t.cuts.metaTitle} — ${BUSINESS.name}`,
    description: t.cuts.metaDesc,
    jsonLd: [shopSchema(locale)]
  }) + body + footer(locale, {
    scripts: `<script src="/assets/js/nw-cuts.js?v=${ASSET_V}"></script>`
  });
}

function cutDetailPage(cut, locale) {
  const t = COPY.T[locale];
  const svc = SERVICES.get(cut.serviceId);
  const name = locale === "es" ? cut.name_es : cut.name_en;
  const desc = locale === "es" ? cut.description_es : cut.description_en;
  const svcName = svc ? (locale === "es" ? svc.name_es : svc.name_en) : "";

  const heroMedia = cut.photoPending
    ? `<div class="nw-ph">
         <span class="nw-ph-mark">${esc(cut.sku)}</span>
         <span class="nw-ph-label">${esc(t.cuts.photoPending)}</span>
       </div>`
    : `<img src="${attr(cut.heroImage)}" alt="${attr(name)}" width="800" height="1000" />`;

  const angles = ["front", "left", "right", "back"].map((k) => `<div class="nw-angle">
    ${cut.photoPending
      ? `<div class="nw-ph"><span class="nw-ph-label">${esc(t.cuts.angles[k])}</span></div>`
      : `<img src="${attr(cut.images[k])}" alt="${attr(name + " — " + t.cuts.angles[k])}" loading="lazy" width="200" height="200" /><span class="nw-angle-tag">${esc(t.cuts.angles[k])}</span>`}
  </div>`).join("");

  const cutAddons = cut.addons.map((id) => ADDONS.get(id)).filter(Boolean);
  const related = CUTS.active().filter((c) => c.category === cut.category && c.sku !== cut.sku).slice(0, 4);

  const body = `
<section class="nw-section">
  <div class="nw-wrap">
    <p class="nw-crumb"><a href="${attr(routeFor("cuts", locale))}">${esc(t.cuts.backToCuts)}</a> / ${esc(name)}</p>
    <div class="nw-detail">
      <div>
        <div class="nw-detail-hero">
          <span class="nw-sku nw-sku--lg" style="position:absolute;top:12px;left:12px;z-index:2;background:rgba(9,10,13,.9);">${esc(cut.sku)}</span>
          ${heroMedia}
        </div>
        <div class="nw-angles">${angles}</div>
        ${cut.photoPending ? `<p class="nw-note" style="margin-top:12px;">${esc(t.cuts.photoPendingNote)}</p>` : ""}
      </div>
      <div>
        <h1 style="font-size:clamp(30px,8vw,48px);">${esc(name)}</h1>
        <p class="nw-body">${esc(desc)}</p>

        <ul class="nw-facts">
          <li><span class="k">${esc(t.cuts.sku)}</span><span class="v">${esc(cut.sku)}</span></li>
          ${svcName ? `<li><span class="k">${esc(locale === "es" ? "Servicio" : "Service")}</span><span class="v">${esc(svcName)}</span></li>` : ""}
          ${svc ? `<li><span class="k">${esc(locale === "es" ? "Precio" : "Price")}</span><span class="v">${esc(priceLabel(svc, locale))}</span></li>` : ""}
          ${svc ? `<li><span class="k">${esc(locale === "es" ? "Tiempo" : "Time")}</span><span class="v">${esc(durationLabel(svc, locale))}</span></li>` : ""}
        </ul>
        ${BUSINESS.PRICING_CONFIRMED ? "" : `<p class="nw-seed">${esc(t.misc.seedNotice)}</p>`}

        ${cutAddons.length ? `<h3 style="font-size:17px;margin-top:24px;">${esc(t.cuts.addons)}</h3>
        <p class="nw-note" style="margin-bottom:16px;">${esc(cutAddons.map((a) => locale === "es" ? a.name_es : a.name_en).join(" · "))}</p>` : ""}

        <button class="nw-btn nw-btn--primary nw-btn--wide" type="button"
          data-nw-select
          data-nw-sku="${attr(cut.sku)}"
          data-nw-slug="${attr(cut.slug)}"
          data-nw-name="${attr(name)}"
          data-nw-service="${attr(svcName)}"
          data-nw-price="${attr(svc ? priceLabel(svc, locale) : "")}"
          data-nw-duration="${attr(svc ? durationLabel(svc, locale) : "")}"
          data-nw-url="${attr(BUSINESS.domain + routeFor("cut", locale, cut.slug))}"
          data-nw-book="${attr(routeFor("book", locale))}">${esc(t.cuts.select)}</button>

        <div class="nw-loc-card" style="margin-top:22px;">
          <h3 style="font-size:16px;">${esc(t.cuts.shareTitle)}</h3>
          <p class="nw-note" style="margin:0 0 10px;">${esc(t.cuts.shareBody)}</p>
          <code style="display:block;word-break:break-all;color:var(--nw-gold);font-size:13px;">${esc(BUSINESS.domain)}/${esc(cut.sku.toLowerCase())}</code>
        </div>
      </div>
    </div>
  </div>
</section>

${related.length ? `<section class="nw-section nw-section--alt nw-section--edge">
  <div class="nw-wrap">
    <h2 style="font-size:clamp(24px,6vw,34px);">${esc(t.cuts.alsoLike)}</h2>
    <div class="nw-grid" style="margin-top:20px;">${related.map((c) => cutCard(c, locale)).join("\n")}</div>
  </div>
</section>` : ""}
`;

  /* Service schema without `offers` — we do not publish prices as offers until
     Jose confirms the menu. */
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: name,
    serviceType: svcName || "Haircut",
    description: desc,
    provider: { "@id": BUSINESS.domain + "/#shop" },
    areaServed: { "@type": "City", name: "Troy" },
    url: BUSINESS.domain + routeFor("cut", locale, cut.slug)
  };

  return head({
    locale,
    routeKey: "cut",
    slug: cut.slug,
    title: `${name} (${cut.sku}) — ${BUSINESS.name}`,
    description: desc.slice(0, 300),
    ogImage: cut.photoPending ? null : cut.heroImage,
    jsonLd: [shopSchema(locale), serviceLd]
  }) + body + footer(locale, {
    scripts: `<script src="/assets/js/nw-cuts.js?v=${ASSET_V}"></script>`
  });
}

function bookPage(locale) {
  const t = COPY.T[locale];
  const addons = ADDONS.active();

  const addonInputs = addons.map((a) => `<label class="nw-addon">
    <input type="checkbox" data-nw-addon="${attr(a.id)}" name="addons" value="${attr(a.id)}" />
    <span class="nw-addon-box" aria-hidden="true"></span>
    <span class="nw-addon-txt">
      <span class="nw-addon-name">${esc(locale === "es" ? a.name_es : a.name_en)}</span>
      <span class="nw-addon-meta">${esc([SERVICES.formatPrice(a.priceCents) + (a.priceFrom ? "+" : ""), a.durationMinutes + " " + t.cuts.minutes].join(" · "))}</span>
    </span>
  </label>`).join("");

  const body = `
<section class="nw-section">
  <div class="nw-wrap" style="max-width:760px;">
    <p class="nw-kicker">${esc(t.pick.kicker)}</p>
    <h1 style="font-size:clamp(32px,9vw,52px);">${esc(t.book.title)}</h1>

    <!-- EMPTY: arrived without picking a cut.
         Deliberately NOT hidden: this is also the no-JS state. Every other
         panel starts hidden, so without this the page would render blank for
         anyone with JS off or still loading. JS hides it once a cut is found. -->
    <div class="nw-state nw-state--empty" id="nwTicketEmpty">
      <h3>${esc(t.book.noCut)}</h3>
      <a class="nw-btn nw-btn--primary" href="${attr(routeFor("cuts", locale))}">${esc(t.book.noCutCta)}</a>
    </div>

    <!-- IDLE: the form -->
    <form id="nwTicketForm" novalidate hidden>
      <div class="nw-loc-card" style="margin-bottom:26px;">
        <p class="nw-kicker" style="margin-bottom:14px;">${esc(t.book.step1)}</p>
        <div id="nwCutSummary"></div>
        <a class="nw-btn nw-btn--quiet" style="margin-top:14px;" href="${attr(routeFor("cuts", locale))}">${esc(t.book.change)}</a>
      </div>

      <fieldset style="border:0;padding:0;margin:0 0 26px;">
        <legend class="nw-kicker" style="padding:0;">${esc(t.book.step2)}</legend>
        <div class="nw-addons">${addonInputs}</div>
      </fieldset>

      <p class="nw-kicker">${esc(t.book.step3)}</p>

      <div class="nw-field">
        <label class="nw-label" for="nwName">${esc(t.book.name)} <span class="req">*</span></label>
        <input class="nw-input" id="nwName" name="name" type="text" autocomplete="name"
               placeholder="${attr(t.book.namePh)}" required maxlength="80" />
        <span class="nw-err" id="nwNameErr" role="alert" hidden></span>
      </div>

      <div class="nw-field">
        <label class="nw-label" for="nwPhone">${esc(t.book.phone)} <span class="req">*</span></label>
        <input class="nw-input" id="nwPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel"
               placeholder="${attr(t.book.phonePh)}" required maxlength="25" />
        <span class="nw-err" id="nwPhoneErr" role="alert" hidden></span>
      </div>

      <div class="nw-field">
        <label class="nw-label" for="nwEmail">${esc(t.book.email)}</label>
        <input class="nw-input" id="nwEmail" name="email" type="email" autocomplete="email"
               placeholder="${attr(t.book.emailPh)}" maxlength="120" />
        <span class="nw-err" id="nwEmailErr" role="alert" hidden></span>
      </div>

      <div class="nw-field">
        <label class="nw-label" for="nwNotes">${esc(t.book.notes)}</label>
        <textarea class="nw-textarea" id="nwNotes" name="notes" maxlength="600"
                  placeholder="${attr(t.book.notesPh)}"></textarea>
        <span class="nw-hint">${esc(t.book.notesHint)}</span>
        <span class="nw-err" id="nwNotesErr" role="alert" hidden></span>
      </div>

      <fieldset style="border:0;padding:0;margin:0 0 26px;">
        <legend class="nw-label" style="padding:0;">${esc(t.book.lang)}</legend>
        <div class="nw-radio-row">
          <label class="nw-radio"><input type="radio" name="prefLang" value="en" ${locale === "en" ? "checked" : ""} /><span>English</span></label>
          <label class="nw-radio"><input type="radio" name="prefLang" value="es" ${locale === "es" ? "checked" : ""} /><span>Español</span></label>
        </div>
      </fieldset>

      <!-- honeypot: invisible to people, irresistible to dumb bots -->
      <div class="nw-hp" aria-hidden="true">
        <label for="nwWebsite">Website</label>
        <input id="nwWebsite" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>
      <input type="hidden" id="nwStartedAt" name="startedAt" value="0" />

      <button class="nw-btn nw-btn--primary nw-btn--wide" id="nwSubmit" type="submit">${esc(t.book.submit)}</button>
    </form>

    <!-- SENDING -->
    <div class="nw-state" id="nwTicketSending" hidden aria-live="polite">
      <p style="margin:0;display:flex;align-items:center;gap:12px;">
        <span class="nw-spinner" style="border-top-color:var(--nw-orange);border-color:rgba(255,114,0,.25);border-top-color:var(--nw-orange);"></span>
        ${esc(t.book.sending)}
      </p>
    </div>

    <!-- SUCCESS -->
    <div class="nw-state nw-state--ok" id="nwTicketSuccess" hidden aria-live="polite">
      <h3>${esc(t.book.successTitle)}</h3>
      <p class="nw-note" style="margin:0 0 4px;">${esc(t.book.successTicket)}</p>
      <span class="nw-ticket-code" id="nwTicketCode"></span>
      <p>${esc(t.book.successBody)}</p>
      <div class="nw-warn" id="nwNotNotified" hidden>
        ${esc(locale === "es"
          ? "No pudimos avisar a la barbería automáticamente. Guarda tu número de ticket y llama al 518-238-5037 para confirmar."
          : "We could not notify the shop automatically. Save your ticket number and call 518-238-5037 to confirm.")}
      </div>
      <div class="nw-warn">${esc(t.book.successNotBooked)}</div>
      <a class="nw-btn nw-btn--primary nw-btn--wide" id="nwBooksyCta"
         href="${attr(BUSINESS.booking.bookingUrl)}" target="_blank" rel="noopener"
         data-nw-booking>${esc(t.book.successCta)}</a>
    </div>

    <!-- ERROR -->
    <div class="nw-state nw-state--err" id="nwTicketError" hidden aria-live="assertive">
      <h3>${esc(t.book.errorTitle)}</h3>
      <p>${esc(t.book.errorBody)}</p>
      <div class="nw-btn-row">
        <button class="nw-btn nw-btn--primary" type="button" id="nwRetry">${esc(t.book.retry)}</button>
        <a class="nw-btn nw-btn--ghost" href="${attr(BUSINESS.phoneHref)}" data-nw-track="phone_clicked">${esc(t.cta.call)}</a>
      </div>
    </div>
  </div>
</section>

<section class="nw-section nw-section--alt nw-section--edge">
  <div class="nw-wrap" style="max-width:900px;">
    <p class="nw-kicker nw-kicker--blue">${esc(t.book.step4)}</p>
    <h2>${esc(t.book.bookingTitle)}</h2>
    <p class="nw-lead">${esc(t.book.bookingBody)}</p>
    <div id="nwBookingEmbed"></div>
    <div id="nwBookingFallback">
      <a class="nw-btn nw-btn--primary" href="${attr(BUSINESS.booking.bookingUrl)}" target="_blank" rel="noopener" data-nw-booking>${esc(t.book.bookingCta)}</a>
      <p class="nw-note" style="margin-top:14px;">${esc(t.book.bookingFallback)}</p>
    </div>
  </div>
</section>
`;

  return head({
    locale,
    routeKey: "book",
    title: `${t.book.metaTitle} — ${BUSINESS.name}`,
    description: t.book.metaDesc,
    jsonLd: [shopSchema(locale)]
  }) + body + footer(locale, {
    noMobileBar: true,
    scripts: `<script src="/assets/js/runtime-${locale}.js?v=${ASSET_V}"></script>
<script src="/assets/js/nw-booking.js?v=${ASSET_V}"></script>
<script src="/assets/js/nw-ticket.js?v=${ASSET_V}"></script>`
  });
}

function josePage(locale) {
  const t = COPY.T[locale];
  const isEs = locale === "es";

  const paras = isEs ? [
    "Jose Rivera es el dueño y el barbero principal de No Way Barbershop, en la 112th Street en Troy. Corta en inglés y en español, y la conversación cambia de idioma a mitad de frase sin que nadie lo note.",
    "Lo que hace distinto a No Way no es una silla de lujo ni un carro alquilado en una foto. Es que aquí de verdad te preguntan qué quieres, y si no sabes cómo se llama, te ayudan a encontrarlo — por eso existe el sistema de fotos y números de esta página.",
    "Padres e hijos, clientes de siempre, primeros cortes, gente del barrio. Eso es la silla."
  ] : [
    "Jose Rivera owns No Way Barbershop and runs the main chair on 112th Street in Troy. He cuts in English and Spanish, and the conversation switches languages mid-sentence without anybody noticing.",
    "What makes No Way different isn't a luxury chair or a rented car in a photo. It's that somebody actually asks what you want — and if you don't know what it's called, helps you find it. That's exactly why the photo-and-number system on this site exists.",
    "Fathers and sons, regulars, first haircuts, people from the neighborhood. That's the chair."
  ];

  const body = `
<section class="nw-section">
  <div class="nw-wrap">
    <div class="nw-detail">
      <div class="nw-detail-hero">
        <div class="nw-ph">
          <span class="nw-ph-mark">JOSE</span>
          <span class="nw-ph-label">${esc(t.cuts.photoPending)}</span>
        </div>
      </div>
      <div>
        <p class="nw-kicker">${esc(t.jose.kicker)}</p>
        <h1 style="font-size:clamp(40px,12vw,72px);">${esc(BUSINESS.owner.name)}</h1>
        <p class="nw-lead">${esc(isEs ? BUSINESS.owner.role_es : BUSINESS.owner.role_en)} · ${esc(t.jose.lead)}</p>
        ${paras.map((p) => `<p class="nw-body">${esc(p)}</p>`).join("\n")}
        <div class="nw-btn-row" style="margin-top:24px;">
          <a class="nw-btn nw-btn--primary" href="${attr(routeFor("cuts", locale))}">${esc(t.cta.button)}</a>
          <a class="nw-btn nw-btn--ghost" href="${attr(BUSINESS.phoneHref)}" data-nw-track="phone_clicked">${esc(t.location.call)}</a>
        </div>
      </div>
    </div>
  </div>
</section>
${locationSection(locale)}
${ctaSection(locale)}
`;

  return head({
    locale,
    routeKey: "jose",
    title: `${BUSINESS.owner.name} — ${BUSINESS.name}`,
    description: isEs
      ? "Conoce a Jose Rivera, dueño y barbero de No Way Barbershop en Troy, NY. Corta en español e inglés en la 112th Street."
      : "Meet Jose Rivera, owner and barber at No Way Barbershop in Troy, NY. Cutting on 112th Street in English and Spanish.",
    jsonLd: [shopSchema(locale), {
      "@context": "https://schema.org",
      "@type": "Person",
      name: BUSINESS.owner.name,
      jobTitle: isEs ? BUSINESS.owner.role_es : BUSINESS.owner.role_en,
      worksFor: { "@id": BUSINESS.domain + "/#shop" },
      knowsLanguage: ["en", "es"]
    }]
  }) + body + footer(locale, {});
}

function galleryPage(locale) {
  const t = COPY.T[locale];
  const shot = CUTS.active().filter((c) => !c.photoPending);

  const body = `
<section class="nw-section">
  <div class="nw-wrap">
    <div class="nw-reveal">
      <p class="nw-kicker">${esc(t.gallery.kicker)}</p>
      <h1 style="font-size:clamp(32px,9vw,52px);">${esc(t.gallery.title)}</h1>
      <p class="nw-lead">${esc(t.gallery.sub)}</p>
    </div>
    ${shot.length
      ? `<div class="nw-grid">${shot.map((c) => cutCard(c, locale)).join("\n")}</div>`
      : `<div class="nw-state nw-state--empty">
           <h3>${esc(t.cuts.photoPending)}</h3>
           <p>${esc(locale === "es"
             ? "Estamos fotografiando el trabajo real de la barbería. Mientras tanto, mira el catálogo de cortes — cada uno ya tiene su número."
             : "We're shooting the shop's real work right now. In the meantime, browse the cut catalog — every one already has its number.")}</p>
           <a class="nw-btn nw-btn--primary" href="${attr(routeFor("cuts", locale))}">${esc(t.cta.button)}</a>
         </div>`}
  </div>
</section>
${ctaSection(locale)}
`;

  return head({
    locale,
    routeKey: "gallery",
    title: `${t.gallery.title} — ${BUSINESS.name}`,
    description: locale === "es"
      ? "Galería de cortes reales de No Way Barbershop en Troy, NY."
      : "Gallery of real cuts from No Way Barbershop in Troy, NY.",
    jsonLd: [shopSchema(locale)]
  }) + body + footer(locale, {});
}

function contentPage(locale) {
  const t = COPY.T[locale];
  const items = CONTENT.active();

  const body = `
<section class="nw-section">
  <div class="nw-wrap">
    <div class="nw-reveal">
      <p class="nw-kicker nw-kicker--blue">${esc(t.content.kicker)}</p>
      <h1 style="font-size:clamp(32px,9vw,52px);">${esc(t.content.title)}</h1>
      <p class="nw-lead">${esc(t.content.sub)}</p>
    </div>

    ${items.length
      ? `<div class="nw-grid nw-grid--wide">${items.map((i) => `<a class="nw-card" href="${attr(i.videoUrl)}" target="_blank" rel="noopener" data-nw-track="content_viewed">
           <div class="nw-card-media">${i.thumbnail ? `<img src="${attr(i.thumbnail)}" alt="" loading="lazy" />` : `<div class="nw-ph"><span class="nw-ph-mark">NO WAY</span></div>`}</div>
           <div class="nw-card-body"><h3 class="nw-card-name">${esc(locale === "es" ? i.title_es : i.title_en)}</h3></div>
         </a>`).join("")}</div>`
      : `<div class="nw-state nw-state--empty" style="margin-bottom:34px;">
           <p style="margin:0;">${esc(locale === "es"
             ? "Los primeros clips se están grabando en la barbería. Las series de abajo son el plan."
             : "The first clips are being filmed in the shop. The series below are the plan.")}</p>
         </div>`}

    <h2 style="font-size:clamp(24px,6vw,34px);margin-top:34px;">${esc(locale === "es" ? "Las series" : "The series")}</h2>
    <div class="nw-series" style="margin-top:20px;">
      ${CONTENT.SERIES.map((s) => `<div class="nw-series-card">
        <h3>${esc(locale === "es" ? s.name_es : s.name_en)}</h3>
        <p>${esc(locale === "es" ? s.description_es : s.description_en)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>
${ctaSection(locale)}
`;

  return head({
    locale,
    routeKey: "content",
    title: `${t.content.title} — ${BUSINESS.name}`,
    description: locale === "es"
      ? "Videos, transformaciones y consejos de barbero de No Way Barbershop en Troy, NY. En inglés y español."
      : "Videos, transformations and barber tips from No Way Barbershop in Troy, NY. English and Spanish.",
    jsonLd: [shopSchema(locale)]
  }) + body + footer(locale, {});
}

function contactPage(locale) {
  const t = COPY.T[locale];
  const isEs = locale === "es";

  const body = `
<section class="nw-section">
  <div class="nw-wrap">
    <p class="nw-kicker">${esc(t.location.kicker)}</p>
    <h1 style="font-size:clamp(32px,9vw,52px);">${esc(t.nav.contact)}</h1>
    <p class="nw-lead">${esc(isEs
      ? "Llama, pasa por la barbería, o elige tu corte aquí y reserva en Booksy. Te atendemos en español o en inglés."
      : "Call, walk in, or pick your cut here and book on Booksy. We'll take care of you in English or Spanish.")}</p>
  </div>
</section>
${locationSection(locale)}
${ctaSection(locale)}
`;

  return head({
    locale,
    routeKey: "contact",
    title: `${t.nav.contact} — ${BUSINESS.name}`,
    description: isEs
      ? `Contacta a No Way Barbershop en ${BUSINESS.address.street}, Troy, NY. Teléfono ${BUSINESS.phoneDisplay}. Atendemos en español e inglés.`
      : `Contact No Way Barbershop at ${BUSINESS.address.street}, Troy, NY. Call ${BUSINESS.phoneDisplay}. English and Spanish.`,
    jsonLd: [shopSchema(locale)]
  }) + body + footer(locale, {});
}

function policiesPage(locale) {
  const isEs = locale === "es";
  const t = COPY.T[locale];

  /* Privacy text describes exactly what this site actually does — nothing
     aspirational. Cancellation policy is Jose's to set, so we say so rather
     than inventing terms customers could be held to. */
  const sections = isEs ? [
    ["Privacidad", [
      "Cuando envías un corte por esta página, recogemos solo lo necesario para que Jose pueda atenderte: tu nombre, tu teléfono, tu correo si lo das, el corte que elegiste, los extras y tus notas.",
      "Esa información se envía por correo a la barbería. No la vendemos, no la compartimos con anunciantes y no recogemos datos demográficos.",
      "Esta página no usa cookies de seguimiento ni scripts publicitarios de terceros.",
      "La reserva se completa en Booksy, que es un servicio de terceros con su propia política de privacidad. Lo que hagas dentro de Booksy se rige por sus términos, no por los nuestros."
    ]],
    ["Cancelaciones", [
      "La política de cancelación la establece la barbería y todavía no está publicada aquí. Para cambiar o cancelar una cita, hazlo en Booksy o llama al " + BUSINESS.phoneDisplay + "."
    ]],
    ["Sobre los precios", [
      "Los precios que ves en esta página son precios iniciales tomados del perfil público de la barbería y se confirman al reservar. El precio final depende del servicio y del tiempo que tome tu corte."
    ]],
    ["Accesibilidad", [
      "Queremos que esta página funcione para todo el mundo: navegación con teclado, buen contraste, texto alternativo y respeto por la preferencia de movimiento reducido. Si algo no te funciona, llámanos al " + BUSINESS.phoneDisplay + " y lo arreglamos."
    ]]
  ] : [
    ["Privacy", [
      "When you send a cut through this site we collect only what Jose needs to take care of you: your name, your phone number, your email if you give one, the cut you picked, any add-ons, and your notes.",
      "That information is emailed to the shop. We don't sell it, we don't share it with advertisers, and we don't collect demographic data.",
      "This site sets no tracking cookies and loads no third-party advertising scripts.",
      "Booking is completed on Booksy, a third-party service with its own privacy policy. Anything you do inside Booksy is governed by their terms, not ours."
    ]],
    ["Cancellations", [
      "The cancellation policy is the shop's to set and is not published here yet. To change or cancel an appointment, do it in Booksy or call " + BUSINESS.phoneDisplay + "."
    ]],
    ["About pricing", [
      "Prices shown on this site are starting prices taken from the shop's public booking profile, and they're confirmed when you book. What you pay depends on the service and how long your cut takes."
    ]],
    ["Accessibility", [
      "We want this site to work for everybody: keyboard navigation, solid contrast, alt text, and respect for reduced-motion preferences. If something doesn't work for you, call us at " + BUSINESS.phoneDisplay + " and we'll fix it."
    ]]
  ];

  const body = `
<section class="nw-section">
  <div class="nw-wrap" style="max-width:760px;">
    <h1 style="font-size:clamp(32px,9vw,52px);">${esc(isEs ? "Políticas" : "Policies")}</h1>
    ${sections.map(([h, ps]) => `<h2 style="font-size:clamp(22px,5vw,30px);margin-top:34px;">${esc(h)}</h2>
      ${ps.map((p) => `<p class="nw-body">${esc(p)}</p>`).join("\n")}`).join("\n")}
  </div>
</section>
`;

  return head({
    locale,
    routeKey: "policies",
    title: `${isEs ? "Políticas" : "Policies"} — ${BUSINESS.name}`,
    description: isEs
      ? "Privacidad, cancelaciones, precios y accesibilidad de No Way Barbershop."
      : "Privacy, cancellations, pricing and accessibility for No Way Barbershop.",
    jsonLd: []
  }) + body + footer(locale, {});
}

/* ====================================================================== */
/*  RUNTIME CONFIG (per locale, external file — keeps CSP free of inline JS) */
/* ====================================================================== */
function runtimeJs(locale) {
  const t = COPY.T[locale];
  return `/* Generated by scripts/build.js — do not edit by hand. */
window.NW_I18N = ${JSON.stringify({
    required: t.book.required,
    invalidPhone: t.book.invalidPhone,
    invalidEmail: t.book.invalidEmail,
    tooLong: t.book.tooLong
  }, null, 2)};
window.NW_BOOKING = ${JSON.stringify({
    provider: BUSINESS.booking.provider,
    bookingUrl: BUSINESS.booking.bookingUrl,
    embedCode: BUSINESS.booking.embedCode
  }, null, 2)};
`;
}

/* ====================================================================== */
/*  SITEMAP / ROBOTS / VERCEL CONFIG                                      */
/* ====================================================================== */

function allRoutes() {
  const keys = ["home", "cuts", "book", "gallery", "jose", "content", "contact", "policies"];
  const out = [];
  LOCALES.forEach((loc) => {
    keys.forEach((k) => out.push({ route: routeFor(k, loc), key: k, locale: loc, slug: null }));
    CUTS.active().forEach((c) => out.push({ route: routeFor("cut", loc, c.slug), key: "cut", locale: loc, slug: c.slug }));
  });
  return out;
}

function sitemap() {
  const D = BUSINESS.domain;
  const today = new Date().toISOString().slice(0, 10);
  const priority = { home: "1.0", cuts: "0.95", cut: "0.9", book: "0.9", jose: "0.7", gallery: "0.7", content: "0.6", contact: "0.6", policies: "0.3" };

  const entries = allRoutes().map((r) => {
    const alts = LOCALES.map((loc) =>
      `    <xhtml:link rel="alternate" hreflang="${loc}" href="${esc(D + routeFor(r.key, loc, r.slug))}" />`
    ).join("\n");
    return `  <url>
    <loc>${esc(D + r.route)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority[r.key] || "0.5"}</priority>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(D + routeFor(r.key, "en", r.slug))}" />
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${BUSINESS.domain}/sitemap.xml
`;
}

/* CSP: hash every inline JSON-LD block we generated, so script-src stays strict
   with no 'unsafe-inline'. All real JavaScript is external, so these hashes are
   the only ones needed. This is computed, never hand-maintained. */
function cspHashes() {
  const hashes = new Set();
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!/^(node_modules|\.git|assets)$/.test(e.name)) walk(full); return; }
      if (!e.name.endsWith(".html")) return;
      const html = fs.readFileSync(full, "utf8");
      const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
      let m;
      while ((m = re.exec(html))) {
        hashes.add("'sha256-" + crypto.createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
      }
    });
  };
  ["en", "es"].forEach((d) => { const p = path.join(ROOT, d); if (fs.existsSync(p)) walk(p); });
  return Array.from(hashes).sort();
}

function vercelJson() {
  const hashes = cspHashes();
  const booksy = "https://booksy.com https://*.booksy.com";

  const csp = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://fonts.gstatic.com " + booksy,
    "connect-src 'self'",
    /* Booksy's official widget renders in an iframe; without this the embed
       would be silently blocked once Jose supplies his code. */
    "frame-src " + booksy,
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ].join("; ");

  /* SKU shortlinks: nowaybarbershop.com/nwb-017 -> the exact cut page.
     This is what makes "ask for NWB-017" in a Reel caption actually work. */
  const skuRedirects = CUTS.active().map((c) => ({
    source: "/" + c.sku.toLowerCase(),
    destination: routeFor("cut", "en", c.slug),
    permanent: false
  }));
  const skuRedirectsEs = CUTS.active().map((c) => ({
    source: "/es/" + c.sku.toLowerCase(),
    destination: routeFor("cut", "es", c.slug),
    permanent: false
  }));

  return JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    redirects: [
      { source: "/", destination: "/en", permanent: false },
      { source: "/cuts", destination: "/en/cuts", permanent: false },
      { source: "/book", destination: "/en/book", permanent: false },
      { source: "/cortes", destination: "/es/cortes", permanent: false },
      { source: "/reservar", destination: "/es/reservar", permanent: false }
    ].concat(skuRedirects, skuRedirectsEs),
    headers: [{
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        { key: "Content-Security-Policy", value: csp }
      ]
    }]
  }, null, 2) + "\n";
}

/* ====================================================================== */
/*  RUN                                                                   */
/* ====================================================================== */
function run() {
  LOCALES.forEach((loc) => {
    write(fileFor(routeFor("home", loc)),     homePage(loc));
    write(fileFor(routeFor("cuts", loc) + "/"), cutsPage(loc));
    write(fileFor(routeFor("book", loc)),     bookPage(loc));
    write(fileFor(routeFor("gallery", loc)),  galleryPage(loc));
    write(fileFor(routeFor("jose", loc)),     josePage(loc));
    write(fileFor(routeFor("content", loc)),  contentPage(loc));
    write(fileFor(routeFor("contact", loc)),  contactPage(loc));
    write(fileFor(routeFor("policies", loc)), policiesPage(loc));

    CUTS.active().forEach((c) => {
      write(fileFor(routeFor("cut", loc, c.slug)), cutDetailPage(c, loc));
    });

    write(`assets/js/runtime-${loc}.js`, runtimeJs(loc));
  });

  write("sitemap.xml", sitemap());
  write("robots.txt", robots());
  write("vercel.json", vercelJson());   /* must run after the HTML exists */

  console.log(`✓ built ${written.length} files`);
  console.log(`  ${CUTS.active().length} cuts × ${LOCALES.length} locales`);
  console.log(`  CSP: ${cspHashes().length} JSON-LD hashes pinned`);
}

run();
