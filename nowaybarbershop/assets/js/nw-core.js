/* NO WAY BARBERSHOP — core runtime.
   Namespace, analytics hooks, nav, scroll reveal, and the selected-cut store.
   Vanilla, no dependencies, no inline script (keeps the CSP hash-free for JS). */
(function () {
  "use strict";

  var NW = window.NW = window.NW || {};

  /* =======================================================================
     ANALYTICS
     Privacy-conscious by construction: no third-party script ships, no cookie
     is set, nothing leaves the page. Events are buffered on NW.events and
     forwarded to window.dataLayer if a tag manager is ever installed.
     Attach a real provider by overriding NW.sink.
     ==================================================================== */
  NW.events = [];
  NW.sink = null;

  NW.track = function (event, props) {
    var payload = { event: event, ts: Date.now() };
    if (props) for (var k in props) if (Object.prototype.hasOwnProperty.call(props, k)) payload[k] = props[k];
    NW.events.push(payload);
    if (window.dataLayer && typeof window.dataLayer.push === "function") window.dataLayer.push(payload);
    if (typeof NW.sink === "function") { try { NW.sink(payload); } catch (e) {} }
  };

  NW.locale = document.documentElement.getAttribute("lang") === "es" ? "es" : "en";

  /* =======================================================================
     SELECTED CUT
     Held in sessionStorage so the customer's choice survives the trip out to
     Booksy and back. Thor §72: never lose the user's selected cut.
     ==================================================================== */
  var CUT_KEY = "nw_selected_cut";

  NW.setCut = function (cut) {
    try { sessionStorage.setItem(CUT_KEY, JSON.stringify(cut)); } catch (e) {}
  };
  NW.getCut = function () {
    try {
      var raw = sessionStorage.getItem(CUT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };
  NW.clearCut = function () {
    try { sessionStorage.removeItem(CUT_KEY); } catch (e) {}
  };

  /* =======================================================================
     NAV
     ==================================================================== */
  function initNav() {
    var burger = document.getElementById("nwBurger");
    var nav = document.getElementById("nwNav");
    if (!burger || !nav) return;

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Close on Escape and return focus to the control that opened it. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  /* =======================================================================
     REVEAL
     The `js-on` class is added only here, so if this script never runs the
     content is simply visible rather than stuck at opacity:0. Reduced motion
     is honoured by revealing everything immediately.
     ==================================================================== */
  function initReveal() {
    var targets = document.querySelectorAll(".nw-reveal");
    if (!targets.length) return;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add("in");
      return;
    }

    document.documentElement.classList.add("js-on");

    function reveal(el) { el.classList.add("in"); }

    /* threshold 0 so a section taller than the viewport reveals the moment its
       top edge appears, rather than waiting for 5% of a very tall element. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);

    /* Safety net. Content that needs JS to become visible is content that can
       get stuck invisible — a mis-set rootMargin, a browser quirk, a page
       restored from bfcache. After 2.5s, reveal anything still hidden. A late
       fade-in is a cosmetic miss; an invisible cut catalog is a lost customer. */
    window.setTimeout(function () {
      for (var k = 0; k < targets.length; k++) {
        if (!targets[k].classList.contains("in")) reveal(targets[k]);
      }
      io.disconnect();
    }, 2500);
  }

  /* =======================================================================
     OUTBOUND / INTENT TRACKING
     Declarative: any element with data-nw-track fires that event on click.
     ==================================================================== */
  function initTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target && e.target.closest ? e.target.closest("[data-nw-track]") : null;
      if (!el) return;
      NW.track(el.getAttribute("data-nw-track"), {
        sku: el.getAttribute("data-nw-sku") || undefined,
        locale: NW.locale
      });
    });

    /* Cards entering the viewport count as impressions, so Jose can see which
       cuts get looked at versus which get booked. */
    var cards = document.querySelectorAll("[data-nw-cut-card]");
    if (cards.length && "IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          NW.track("cut_card_view", { sku: entry.target.getAttribute("data-nw-sku"), locale: NW.locale });
          seen.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      for (var i = 0; i < cards.length; i++) seen.observe(cards[i]);
    }
  }

  function init() { initNav(); initReveal(); initTracking(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
