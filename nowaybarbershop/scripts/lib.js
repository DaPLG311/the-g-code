/* NO WAY BARBERSHOP — shared page-building helpers.
   Used by scripts/build.js to write every static page in both languages.
   Nothing here reaches the browser; this is author-time only. */
"use strict";

const path = require("path");
const ROOT = path.join(__dirname, "..");

const BUSINESS = require(path.join(ROOT, "data/business.js"));
const COPY     = require(path.join(ROOT, "data/copy.js"));
const CUTS     = require(path.join(ROOT, "data/cuts.js"));
const SERVICES = require(path.join(ROOT, "data/services.js"));
const ADDONS   = require(path.join(ROOT, "data/addons.js"));
const REVIEWS  = require(path.join(ROOT, "data/reviews.js"));
const CONTENT  = require(path.join(ROOT, "data/content.js"));

/* Bump when assets/css or assets/js change, so returning visitors get the new
   files instead of a cached mix. Mirrors the cache-bust discipline already used
   on the Day One MVP site. */
const ASSET_V = "20260829a";

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

/* Attribute-safe: also escapes single quotes. */
const attr = (s) => esc(s).replace(/'/g, "&#39;");

const other = (locale) => (locale === "en" ? "es" : "en");

/* Resolve a page key (or a cut) to its path in a given locale. This is the one
   function that knows EN<->ES pairing, so the language switcher, the hreflang
   tags and the sitemap can never disagree with each other. */
function routeFor(key, locale, slug) {
  if (key === "cut") {
    return (locale === "es" ? "/es/cortes/" : "/en/cuts/") + slug;
  }
  const r = COPY.ROUTES[key];
  if (!r) throw new Error("Unknown route key: " + key);
  return r[locale];
}

function priceLabel(service, locale) {
  if (!service) return "";
  const t = COPY.T[locale];
  const money = SERVICES.formatPrice(service.priceCents);
  return service.priceFrom ? `${t.cuts.from} ${money}` : money;
}

function durationLabel(service, locale) {
  if (!service) return "";
  return `${service.durationMinutes} ${COPY.T[locale].cuts.minutes}`;
}

/* ------------------------------------------------------------------ head */
function head(o) {
  const { locale, title, description, routeKey, slug, ogImage, jsonLd, bodyClass } = o;
  const t = COPY.T[locale];
  const D = BUSINESS.domain;

  const selfPath  = routeFor(routeKey, locale, slug);
  const otherPath = routeFor(routeKey, other(locale), slug);
  const canonical = D + selfPath;
  const image     = D + (ogImage || "/assets/media/brand/og-default.jpg");

  const ld = (jsonLd || []).map(
    (block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}" />
<link rel="canonical" href="${attr(canonical)}" />
<link rel="alternate" hreflang="en" href="${attr(D + routeFor(routeKey, "en", slug))}" />
<link rel="alternate" hreflang="es" href="${attr(D + routeFor(routeKey, "es", slug))}" />
<link rel="alternate" hreflang="x-default" href="${attr(D + routeFor(routeKey, "en", slug))}" />
<meta property="og:site_name" content="${attr(BUSINESS.name)}" />
<meta property="og:locale" content="${locale === "es" ? "es_US" : "en_US"}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${attr(title)}" />
<meta property="og:description" content="${attr(description)}" />
<meta property="og:url" content="${attr(canonical)}" />
<meta property="og:image" content="${attr(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${attr(title)}" />
<meta name="twitter:description" content="${attr(description)}" />
<meta name="twitter:image" content="${attr(image)}" />
<meta name="theme-color" content="#090A0D" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/css/noway.css?v=${ASSET_V}" />
${ld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="nw-skip" href="#main">${esc(t.nav.skip)}</a>
${langbar(locale, otherPath)}
${header(locale, routeKey)}
<main id="main">`;
}

/* --------------------------------------------------------------- langbar */
/* Real links to the counterpart URL — not a JS dictionary swap. The customer
   keeps their place when they switch, and crawlers see two real documents. */
function langbar(locale, otherPath) {
  const t = COPY.T[locale];
  const en = locale === "en"
    ? `<span class="on" aria-current="true">EN</span>`
    : `<a href="${attr(otherPath)}" hreflang="en" lang="en" data-nw-track="language_selected">EN</a>`;
  const es = locale === "es"
    ? `<span class="on" aria-current="true">ES</span>`
    : `<a href="${attr(otherPath)}" hreflang="es" lang="es" data-nw-track="language_selected">ES</a>`;
  return `<div class="nw-langbar" role="group" aria-label="${attr(t.misc.langLabel)}">
<span class="nw-sr">${esc(t.switchTo)}</span>${en}${es}
</div>`;
}

/* ---------------------------------------------------------------- header */
function header(locale, current) {
  const t = COPY.T[locale];
  const link = (key, label) => {
    const href = routeFor(key, locale);
    const cur = key === current ? ' aria-current="page"' : "";
    return `<a href="${attr(href)}"${cur}>${esc(label)}</a>`;
  };

  return `<header class="nw-head">
  <div class="nw-wrap nw-head-in">
    <a class="nw-brand" href="${attr(routeFor("home", locale))}" aria-label="${attr(t.nav.home)}">
      <b>NO <em>WAY</em></b><small>Barbershop · Troy NY</small>
    </a>
    <button class="nw-burger" id="nwBurger" type="button" aria-expanded="false" aria-controls="nwNav" aria-label="${attr(t.nav.menu)}">
      <span></span><span></span><span></span>
    </button>
    <nav class="nw-nav" id="nwNav" aria-label="${attr(t.nav.menu)}">
      ${link("cuts", t.nav.cuts)}
      ${link("gallery", t.nav.gallery)}
      ${link("jose", t.nav.jose)}
      ${link("content", t.nav.content)}
      ${link("contact", t.nav.contact)}
      <a class="nw-btn nw-btn--primary" href="${attr(routeFor("book", locale))}">${esc(t.nav.book)}</a>
    </nav>
  </div>
</header>`;
}

/* ---------------------------------------------------------------- footer */
function footer(locale, opts) {
  const t = COPY.T[locale];
  const o = opts || {};
  const A = BUSINESS.address;
  const year = new Date().getFullYear();

  const social = Object.keys(BUSINESS.social)
    .filter((k) => BUSINESS.social[k])
    .map((k) => `<a href="${attr(BUSINESS.social[k])}" rel="noopener" target="_blank" data-nw-track="${k}_clicked">${esc(k.charAt(0).toUpperCase() + k.slice(1))}</a>`)
    .join("");

  /* Sticky bottom bar on phones — the dominant journey is a phone, and Book
     should never be more than a thumb away. Hidden at >=900px by CSS. */
  const mobilebar = o.noMobileBar ? "" : `<div class="nw-mobilebar">
  <a class="nw-btn nw-btn--ghost" href="${attr(BUSINESS.phoneHref)}" data-nw-track="phone_clicked">${esc(BUSINESS.phoneDisplay)}</a>
  <a class="nw-btn nw-btn--primary" href="${attr(routeFor("book", locale))}">${esc(t.nav.book)}</a>
</div>`;

  return `</main>
<footer class="nw-foot">
  <div class="nw-wrap">
    <div class="nw-foot-grid">
      <div class="nw-foot-col">
        <b style="font-family:var(--nw-display);font-size:24px;letter-spacing:.04em;">NO WAY</b>
        <p class="nw-note" style="margin:8px 0 14px;">${esc(t.footer.tagline)}</p>
        <address style="font-style:normal;color:var(--nw-steel);font-size:14px;line-height:1.7;">
          ${esc(A.street)}<br />${esc(A.locality)}, ${esc(A.region)} ${esc(A.postalCode)}<br />
          <a href="${attr(BUSINESS.phoneHref)}" data-nw-track="phone_clicked">${esc(BUSINESS.phoneDisplay)}</a>
        </address>
      </div>
      <div class="nw-foot-col">
        <h4>${esc(t.footer.navTitle)}</h4>
        <a href="${attr(routeFor("cuts", locale))}">${esc(t.nav.cuts)}</a>
        <a href="${attr(routeFor("book", locale))}">${esc(t.nav.book)}</a>
        <a href="${attr(routeFor("gallery", locale))}">${esc(t.nav.gallery)}</a>
        <a href="${attr(routeFor("jose", locale))}">${esc(t.nav.jose)}</a>
        <a href="${attr(routeFor("content", locale))}">${esc(t.nav.content)}</a>
        <a href="${attr(routeFor("contact", locale))}">${esc(t.nav.contact)}</a>
      </div>
      <div class="nw-foot-col">
        <h4>${esc(t.footer.legalTitle)}</h4>
        <a href="${attr(routeFor("policies", locale))}">${esc(t.footer.privacy)} · ${esc(t.footer.terms)}</a>
        ${social}
      </div>
    </div>
    <div class="nw-foot-bottom">
      <span>&copy; ${year} ${esc(BUSINESS.legalName)}. ${esc(t.footer.rights)}</span>
      <span>${esc(t.footer.built)}</span>
    </div>
  </div>
</footer>
${mobilebar}
<script src="/assets/js/nw-core.js?v=${ASSET_V}"></script>
${o.scripts || ""}
</body>
</html>
`;
}

/* ------------------------------------------------------------ structured data */
/* Only facts we can stand behind. No aggregateRating (no approved reviews),
   no priceRange or offers (pricing unconfirmed), no openingHours (unconfirmed),
   no geo coordinates (never verified against the confirmed street address). */
function shopSchema(locale) {
  const A = BUSINESS.address;
  const s = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    "@id": BUSINESS.domain + "/#shop",
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: BUSINESS.domain + routeFor("home", locale),
    telephone: BUSINESS.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: A.street,
      addressLocality: A.locality,
      addressRegion: A.region,
      postalCode: A.postalCode,
      addressCountry: A.country
    },
    areaServed: [
      { "@type": "City", name: "Troy" },
      { "@type": "AdministrativeArea", name: "Rensselaer County" }
    ],
    availableLanguage: [
      { "@type": "Language", name: "English", alternateName: "en" },
      { "@type": "Language", name: "Spanish", alternateName: "es" }
    ],
    employee: { "@type": "Person", name: BUSINESS.owner.name, jobTitle: BUSINESS.owner.role_en },
    knowsLanguage: ["en", "es"]
  };
  const sameAs = [BUSINESS.booking.bookingUrl].concat(
    Object.keys(BUSINESS.social).map((k) => BUSINESS.social[k])
  ).filter(Boolean);
  if (sameAs.length) s.sameAs = sameAs;
  if (BUSINESS.HOURS_CONFIRMED && BUSINESS.hours.length) s.openingHoursSpecification = BUSINESS.hours;
  if (BUSINESS.geo) s.geo = { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng };
  return s;
}

module.exports = {
  ROOT, ASSET_V,
  BUSINESS, COPY, CUTS, SERVICES, ADDONS, REVIEWS, CONTENT,
  esc, attr, other, routeFor, priceLabel, durationLabel,
  head, header, footer, langbar, shopSchema
};
