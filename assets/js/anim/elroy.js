/* ELROY engine — named, reusable GSAP sequences for the static site.
   Layer 1 = cinematic hero entrance. Layer 3 = scrubbed scroll reveal + pinned
   rail (defined here, wired per-page as needed). Guarded for reduced-motion,
   mobile, and missing-GSAP. Self-hosted GSAP => CSP 'self' clean. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;

  // GSAP must be present; if not, reveal anything we pre-hid and bail.
  if (!window.gsap) { root.classList.remove("elroy"); return; }

  var mqReduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = mqReduce && mqReduce.matches;
  var isMobile = window.matchMedia && matchMedia("(max-width: 768px)").matches;
  var T = (window.ELROY && ELROY.TOKENS) || {};
  var ease = (T.easing && T.easing.standard) || "power2.out";
  var easeBack = (T.easing && T.easing.responsive) || "back.out(1.6)";
  var dur = function (k, fb) { return ((T.timings && T.timings[k]) || fb) / 1000; };

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- named sequence factories (reusable across pages) ---------- */

  // Layer 1 — cinematic hero cascade (plays on load)
  function heroSequence(scopeSel) {
    var sel = scopeSel ? (scopeSel + " .elroy-hero-item")
                       : ".hero .elroy-hero-item, .page-hero .elroy-hero-item";
    var items = d.querySelectorAll(sel);
    if (!items.length) return;
    var y = isMobile ? 20 : (T.distance ? T.distance.cascade : 40);
    var stg = isMobile ? (T.stagger ? T.stagger.medium : 0.08) : (T.stagger ? T.stagger.loose : 0.12);
    gsap.fromTo(items,
      { opacity: 0, y: y },
      { opacity: 1, y: 0, duration: dur("long", 520), ease: easeBack, stagger: stg, clearProps: "transform" }
    );
  }

  // Layer 3 — scrubbed progressive reveal of a card stack (no pin; safe everywhere)
  function revealStack(sectionEl) {
    var cards = sectionEl.querySelectorAll(".elroy-stack-item");
    if (!cards.length) return;
    gsap.fromTo(cards,
      { opacity: 0.35, y: 40 },
      {
        opacity: 1, y: 0, ease: ease, stagger: 0.12,
        scrollTrigger: { trigger: sectionEl, start: "top 75%", end: "top 35%", scrub: 0.5 }
      }
    );
  }
  ELROY.heroSequence = heroSequence;
  ELROY.revealStack = revealStack;

  /* ---------------------------- init ---------------------------- */
  function init() {
    if (reduce) { root.classList.remove("elroy"); return; } // never leave content hidden
    heroSequence();
    // selective: only sections that opt in via data-attr get scroll work
    if (window.ScrollTrigger) {
      d.querySelectorAll("[data-elroy='reveal-stack']").forEach(revealStack);
    }
  }

  if (d.readyState !== "loading") init();
  else d.addEventListener("DOMContentLoaded", init);
})();
