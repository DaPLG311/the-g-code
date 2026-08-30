/* NO WAY BARBERSHOP — add-ons a customer can attach to a cut.

   ⚠ SEED DATA from the shop's public Booksy listing, same rules as
   data/services.js. Prices are starting prices until Jose confirms them.

   Add-on ids travel on the style ticket. The server re-resolves every id
   against this file before emailing Jose — a client can send an id, never a
   price. */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.ADDONS = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ADDONS = [
    {
      id: "beard",
      name_en: "Beard",
      name_es: "Barba",
      description_en: "Line the beard up with the cut.",
      description_es: "Perfilar la barba junto con el corte.",
      priceCents: 2000,
      priceFrom: true,
      durationMinutes: 30,
      active: true,
      source: "booksy-public"
    },
    {
      id: "eyebrows",
      name_en: "Eyebrows",
      name_es: "Cejas",
      description_en: "Clean up the brows.",
      description_es: "Limpieza de cejas.",
      priceCents: 1500,
      priceFrom: true,
      durationMinutes: 20,
      active: true,
      source: "booksy-public"
    },
    {
      id: "enhancement",
      name_en: "Enhancement",
      name_es: "Enhancement",
      description_en: "Fill in and sharpen the hairline.",
      description_es: "Rellenar y definir la línea del cabello.",
      priceCents: 1000,
      priceFrom: true,
      durationMinutes: 30,
      active: true,
      source: "booksy-public"
    },
    {
      id: "wash",
      name_en: "Wash & Dry",
      name_es: "Lavado y Secado",
      description_en: "Wash and dry before the cut.",
      description_es: "Lavado y secado antes del corte.",
      priceCents: 1500,
      priceFrom: true,
      durationMinutes: 10,
      active: true,
      source: "booksy-public"
    }
  ];

  function get(id) {
    for (var i = 0; i < ADDONS.length; i++) if (ADDONS[i].id === id) return ADDONS[i];
    return null;
  }
  function active() {
    return ADDONS.filter(function (a) { return a.active; });
  }

  return { ADDONS: ADDONS, get: get, active: active };
});
