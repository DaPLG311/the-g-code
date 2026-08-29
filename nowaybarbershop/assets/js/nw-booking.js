/* NO WAY BARBERSHOP — booking provider abstraction.

   V1 PRINCIPLE: do not rebuild scheduling. Booksy already gives Jose real-time
   availability, reminders, confirmations and multiple booking channels. Our
   site owns discovery, the SKU and the style ticket, then hands off.

   This layer exists so that handoff is the ONLY place that knows about Booksy.
   Swapping provider, or upgrading to a real API integration later, is a change
   here and nowhere else.

     interface BookingProvider {
       provider: 'booksy' | 'square' | 'custom';
       bookingUrl?: string;
       embedCode?: string;
     }

   The config is injected server-side into window.NW_BOOKING by the page
   generator, sourced from data/business.js. */
(function () {
  "use strict";

  var NW = window.NW = window.NW || {};
  var cfg = window.NW_BOOKING || {};

  NW.booking = {
    provider: cfg.provider || "booksy",
    url: cfg.bookingUrl || "",
    hasEmbed: !!(cfg.embedCode && cfg.embedCode.trim()),

    /* Send the customer to the provider. The style ticket is already with Jose
       at this point — this is the calendar step, nothing more. */
    open: function (sku) {
      NW.track("booking_provider_clicked", {
        provider: this.provider, sku: sku || undefined, locale: NW.locale
      });
      if (this.url) window.open(this.url, "_blank", "noopener");
    }
  };

  function init() {
    /* Mount the official widget when Jose supplies his embed code. Until then
       the page's static fallback link stays in place — we never scrape Booksy
       or reverse-engineer private endpoints to fake an embed. */
    var slot = document.getElementById("nwBookingEmbed");
    if (slot && NW.booking.hasEmbed) {
      slot.innerHTML = cfg.embedCode;
      var fallback = document.getElementById("nwBookingFallback");
      if (fallback) fallback.hidden = true;
    }

    var links = document.querySelectorAll("[data-nw-booking]");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        NW.track("booking_provider_clicked", {
          provider: NW.booking.provider,
          sku: this.getAttribute("data-nw-sku") || undefined,
          locale: NW.locale
        });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
