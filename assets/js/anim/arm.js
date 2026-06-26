/* ELROY arm — tiny render-blocking <head> script. Adds html.elroy so the CSS
   can pre-hide hero items (no flash-of-content before GSAP animates them in).
   Skips reduced-motion. Failsafe timer reveals content if elroy.js never runs. */
(function (d) {
  try {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    d.documentElement.classList.add("elroy");
    setTimeout(function () { d.documentElement.classList.remove("elroy"); }, 2500);
  } catch (e) { /* no-op: content stays visible */ }
})(document);
