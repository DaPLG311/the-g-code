/* NO WAY BARBERSHOP — service + pricing layer.

   ⚠ SEED DATA. These services and prices come from the shop's PUBLIC Booksy
   listing. They are the shop's own published starting prices, not invented —
   but Jose has NOT confirmed them for this site.

   While BUSINESS.PRICING_CONFIRMED is false:
     · prices render as starting prices ("From $35") with an honest notice
     · no `offers` / `priceRange` is emitted in structured data
     · nothing treats a price as final

   Cuts reference a service by id and inherit its price and duration. Price is
   never duplicated onto a cut, so correcting a price here corrects it
   everywhere — site, ticket and email included.

   TO CONFIRM: replace the values below with Jose's real menu, then flip
   PRICING_CONFIRMED to true in data/business.js. */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.SERVICES = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SERVICES = {
    "haircut": {
      id: "haircut",
      name_en: "Modern Haircut & Styling",
      name_es: "Corte Moderno y Estilizado",
      priceCents: 3500,
      priceFrom: true,
      durationMinutes: 45,
      source: "booksy-public",
      confirmed: false
    },
    "haircut-beard": {
      id: "haircut-beard",
      name_en: "Haircut & Beard",
      name_es: "Corte y Barba",
      priceCents: 4000,
      priceFrom: true,
      durationMinutes: 50,
      source: "booksy-public",
      confirmed: false
    },
    "kids": {
      id: "kids",
      name_en: "Kids (12 & Under)",
      name_es: "Niños (12 años o menos)",
      priceCents: 2500,
      priceFrom: true,
      durationMinutes: 30,
      source: "booksy-public",
      confirmed: false
    },
    "beard": {
      id: "beard",
      name_en: "Beard Grooming",
      name_es: "Arreglo de Barba",
      priceCents: 2000,
      priceFrom: true,
      durationMinutes: 30,
      source: "booksy-public",
      confirmed: false
    },
    "tape-up": {
      id: "tape-up",
      name_en: "Tape Up",
      name_es: "Tape Up",
      priceCents: 2000,
      priceFrom: true,
      durationMinutes: 25,
      source: "booksy-public",
      confirmed: false
    },
    "wash-dry": {
      id: "wash-dry",
      name_en: "Wash / Dry",
      name_es: "Lavado / Secado",
      priceCents: 1500,
      priceFrom: true,
      durationMinutes: 10,
      source: "booksy-public",
      confirmed: false
    }
  };

  /* Formats cents for display. Kept here so every surface — cards, detail
     pages, the ticket form and the email to Jose — formats identically. */
  function formatPrice(cents) {
    if (cents == null) return "";
    return "$" + (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2));
  }

  function get(id) { return SERVICES[id] || null; }

  return { SERVICES: SERVICES, get: get, formatPrice: formatPrice };
});
