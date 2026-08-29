/* NO WAY BARBERSHOP — canonical business data.
   SINGLE SOURCE OF TRUTH. Every page, generator, schema block and API response
   reads from here. Nothing about the business is hardcoded anywhere else.

   CONFIRMATION FLAGS: anything Jose has not personally confirmed is gated by a
   flag below. When a flag is false the site renders an honest fallback instead
   of publishing an unverified fact. Flip the flag, redeploy, done.

   Works in both the browser (window.NW.BUSINESS) and Node (require). */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.BUSINESS = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  return {
    /* ---------- identity ---------- */
    legalName: "No Way Barbershop LLC",
    name: "No Way Barbershop",
    shortName: "No Way",
    owner: { name: "Jose Rivera", role_en: "Owner & Barber", role_es: "Dueño y Barbero" },
    tagline_en: "See the cut. Book the cut.",
    tagline_es: "Mira el corte. Reserva tu cita.",

    /* ---------- contact ---------- */
    /* From the physical shop signage and the public business listing. */
    phoneDisplay: "518-238-5037",
    phoneHref: "tel:+15182385037",

    /* ---------- address ----------
       CONFIRMED by the build owner. Public sources showed 32 / 34 / 32-34;
       32 is the confirmed storefront. */
    ADDRESS_CONFIRMED: true,
    address: {
      street: "32 112th Street",
      locality: "Troy",
      region: "NY",
      regionName: "New York",
      postalCode: "12182",
      country: "US"
    },
    neighborhood_en: "Lansingburgh · North Troy",
    neighborhood_es: "Lansingburgh · North Troy",
    /* No lat/long published until it is verified against the confirmed address.
       An invented coordinate would send customers to the wrong door. */
    geo: null,
    mapsQuery: "No Way Barbershop, 32 112th Street, Troy, NY 12182",

    /* ---------- hours ----------
       NOT CONFIRMED. Booksy owns live availability, so until Jose confirms a
       posted schedule the site points at Booksy instead of inventing hours. */
    HOURS_CONFIRMED: false,
    hours: [],

    /* ---------- pricing ----------
       NOT CONFIRMED. data/services.js carries Booksy's public seed prices,
       rendered as starting prices only. No `offers` in structured data and no
       price is ever treated as final until this flag is true. */
    PRICING_CONFIRMED: false,

    /* ---------- reviews ----------
       NOT APPROVED. data/reviews.js ships empty. No aggregateRating is emitted.
       Nothing is ever fabricated here. */
    REVIEWS_APPROVED: false,

    /* ---------- social ----------
       Handles unknown at build time. Empty entries are simply not rendered —
       we do not guess a handle and ship a dead link. */
    social: { instagram: "", tiktok: "", facebook: "", youtube: "" },

    /* ---------- booking ----------
       Booksy remains the source of truth for availability, scheduling,
       calendar and confirmations. Our site owns discovery and the style ticket.
       `embedCode` stays empty until Jose supplies his official Booksy widget;
       the booking page falls back to the verified public URL. */
    booking: {
      provider: "booksy",
      bookingUrl: "https://booksy.com/en-us/648695_nowaybarbershop_barber-shop_134588_troy",
      embedCode: "",
      embedAllowedOrigins: ["https://booksy.com", "https://*.booksy.com"]
    },

    /* ---------- site ---------- */
    domain: "https://nowaybarbershop.com",
    defaultLocale: "en",
    locales: ["en", "es"],

    /* ---------- style ticket ---------- */
    ticketPrefix: "NW-TK-",
    skuPrefix: "NWB-",

    /* Ticket lifecycle. We never emit CONFIRMED from V1: without a Booksy API
       connection we have no evidence an appointment exists, and claiming one
       would be a lie to both the customer and Jose. */
    ticketStatuses: [
      "DRAFT", "STYLE_SELECTED", "AWAITING_BOOKING",
      "BOOKING_REPORTED", "CONFIRMED", "COMPLETED", "CANCELLED"
    ]
  };
});
