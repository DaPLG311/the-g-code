/* ELROY engine — named, reusable GSAP sequences for the static site.
   Layer 1 = cinematic hero entrance. Layer 3 = scrubbed scroll reveal (defined
   here, wired per-page as needed). Guarded for reduced-motion, mobile, and
   missing-GSAP. Self-hosted GSAP => CSP 'self' clean.

   SAFETY: the hero resting state is always VISIBLE. We animate with
   immediateRender:false, so the hidden start-state is only applied once the
   tween actually ticks. If GSAP never loads, the tab is throttled, or the tween
   stalls, content simply stays visible — it can never get stuck hidden. */
(function () {
  "use strict";
  var d = document;

  if (!window.gsap) return; // no GSAP -> nothing hidden, nothing to do

  var mqReduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = mqReduce && mqReduce.matches;
  var isMobile = window.matchMedia && matchMedia("(max-width: 768px)").matches;
  var T = (window.ELROY && ELROY.TOKENS) || {};
  var ease = (T.easing && T.easing.standard) || "power2.out";
  var easeBack = (T.easing && T.easing.responsive) || "back.out(1.6)";
  var dur = function (k, fb) { return ((T.timings && T.timings[k]) || fb) / 1000; };

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- named sequence factories (reusable across pages) ---------- */

  // Layer 1 — cinematic hero cascade (plays on load).
  // Auto-targets the direct children of the hero content box on any page.
  function heroSequence(scopeSel) {
    var sel = scopeSel
      ? (scopeSel + " .elroy-hero-item")
      : ".hero .smoke > *, .page-hero .smoke > *";
    var items = d.querySelectorAll(sel);
    if (!items.length) return;
    var y = isMobile ? 20 : (T.distance ? T.distance.cascade : 40);
    var stg = isMobile ? (T.stagger ? T.stagger.medium : 0.08) : (T.stagger ? T.stagger.loose : 0.12);
    gsap.from(items, {
      opacity: 0, y: y, duration: dur("long", 520), ease: easeBack, stagger: stg,
      immediateRender: false,        // never pre-apply the hidden state
      clearProps: "opacity,transform" // leave no inline styles behind
    });
  }

  // Layer 3 — scrubbed progressive reveal of a card stack (no pin; safe).
  // Also immediateRender:false so cards rest visible if anything goes wrong.
  function revealStack(sectionEl) {
    var cards = sectionEl.querySelectorAll(".elroy-stack-item");
    if (!cards.length) return;
    gsap.from(cards, {
      opacity: 0, y: 40, ease: ease, stagger: 0.12, immediateRender: false,
      scrollTrigger: { trigger: sectionEl, start: "top 80%", once: true }
    });
  }
  ELROY.heroSequence = heroSequence;
  ELROY.revealStack = revealStack;

  /* ---------------------------- init ---------------------------- */
  function init() {
    if (reduce) return;            // resting state is visible; just don't animate
    heroSequence();
    if (window.ScrollTrigger) {
      d.querySelectorAll("[data-elroy='reveal-stack']").forEach(revealStack);
    }
  }

  if (d.readyState !== "loading") init();
  else d.addEventListener("DOMContentLoaded", init);
})();
