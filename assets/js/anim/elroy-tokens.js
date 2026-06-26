/* ELROY motion tokens — single source of truth (vanilla, no build step).
   CSS owns layer 2 (tiles/hover/trace) via the Elite Box system; GSAP owns
   layer 1 (cinematic hero) + layer 3 (pinned/scrubbed scroll). These tokens
   keep both layers speaking the same language. */
window.ELROY = window.ELROY || {};
window.ELROY.TOKENS = {
  /* milliseconds */
  timings: { instant: 0, micro: 120, short: 160, medium: 280, long: 520, cinematic: 700 },
  /* GSAP ease strings (CSS layer uses its own cubic-beziers in styles.css) */
  easing: { responsive: "back.out(1.6)", standard: "power2.out", smooth: "power1.inOut" },
  /* seconds (GSAP stagger unit) */
  stagger: { tight: 0.04, medium: 0.08, loose: 0.12 },
  /* px */
  distance: { none: 0, tight: 4, standard: 8, loose: 16, cascade: 40 }
};
