/* NO WAY BARBERSHOP — cut catalog behaviour.
   Category filtering (progressive: the full grid is in the HTML and filtering
   only hides, so the catalog works with JS off and every cut stays crawlable)
   and "select this cut", which is the moment a browser becomes a booking. */
(function () {
  "use strict";

  var NW = window.NW = window.NW || {};

  /* ---------- category filter ---------- */
  function initFilters() {
    var chips = document.querySelectorAll("[data-nw-filter]");
    if (!chips.length) return;

    var cards = document.querySelectorAll("[data-nw-cut-card]");
    var empty = document.getElementById("nwCutsEmpty");

    function apply(cat) {
      var shown = 0;
      for (var i = 0; i < cards.length; i++) {
        var match = cat === "all" || cards[i].getAttribute("data-nw-cat") === cat;
        cards[i].hidden = !match;
        if (match) shown++;
      }
      if (empty) empty.hidden = shown > 0;

      for (var j = 0; j < chips.length; j++) {
        chips[j].setAttribute("aria-pressed", chips[j].getAttribute("data-nw-filter") === cat ? "true" : "false");
      }
    }

    for (var k = 0; k < chips.length; k++) {
      chips[k].addEventListener("click", function () {
        var cat = this.getAttribute("data-nw-filter");
        apply(cat);
        NW.track("cut_filter", { category: cat, locale: NW.locale });
      });
    }

    /* Deep link support: /en/cuts?c=fade — lets a campaign or a Reel caption
       drop someone straight into one category. */
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("c");
    if (initial) {
      for (var m = 0; m < chips.length; m++) {
        if (chips[m].getAttribute("data-nw-filter") === initial) { apply(initial); break; }
      }
    }
  }

  /* ---------- select a cut ---------- */
  function initSelect() {
    var buttons = document.querySelectorAll("[data-nw-select]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (e) {
        e.preventDefault();
        var el = this;
        var cut = {
          sku: el.getAttribute("data-nw-sku"),
          slug: el.getAttribute("data-nw-slug"),
          name: el.getAttribute("data-nw-name"),
          service: el.getAttribute("data-nw-service") || "",
          price: el.getAttribute("data-nw-price") || "",
          duration: el.getAttribute("data-nw-duration") || "",
          url: el.getAttribute("data-nw-url") || "",
          locale: NW.locale,
          addons: []
        };
        NW.setCut(cut);
        NW.track("cut_selected", { sku: cut.sku, locale: NW.locale });
        window.location.href = el.getAttribute("data-nw-book") || (NW.locale === "es" ? "/es/reservar" : "/en/book");
      });
    }
  }

  function init() { initFilters(); initSelect(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
