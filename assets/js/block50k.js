/* =====================================================================
   #block50k populator — the spinning $50K cash block
   ---------------------------------------------------------------------
   Ported from the 1v1 podcast site (Projects/day1v1) 2026-08-12.
   The page ships an empty anchor:
     <a id="block50k" class="block50k" href="start.html"
        data-eyebrow="…" data-title="…" data-sub="…"
        aria-label="…"></a>
   This file builds the inner markup with DOM APIs + textContent (no
   innerHTML, so nothing here can inject), then wires ONE
   IntersectionObserver that pauses the CSS animations while offscreen.
   CSS owns all motion — no rAF, no per-frame work.
   JS fails -> the empty anchor paints nothing (contract-accepted).
   ===================================================================== */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text) { n.textContent = text; }
    return n;
  }

  function build(block) {
    var stage = el('span', 'b50k-stage');
    stage.setAttribute('aria-hidden', 'true');
    stage.appendChild(el('span', 'b50k-glow'));

    var float = el('span', 'b50k-float');
    var tilt = el('span', 'b50k-tilt');
    var cube = el('span', 'b50k-cube');

    var faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    for (var i = 0; i < faces.length; i++) {
      var face = el('span', 'b50k-face b50k-' + faces[i]);
      if (faces[i] === 'front' || faces[i] === 'back') {
        face.appendChild(el('b', 'b50k-cash', block.getAttribute('data-cash') || '$50K'));
      }
      cube.appendChild(face);
    }
    tilt.appendChild(cube);
    float.appendChild(tilt);
    stage.appendChild(float);

    var copy = el('span', 'b50k-copy');
    copy.appendChild(el('span', 'b50k-eyebrow', block.getAttribute('data-eyebrow') || 'Day One MVP'));
    copy.appendChild(el('span', 'b50k-title', block.getAttribute('data-title') || 'The $50K Build'));

    var sub = el('span', 'b50k-sub', block.getAttribute('data-sub') || 'Start the conversation');
    var arrow = el('span', 'b50k-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    sub.appendChild(arrow);
    copy.appendChild(sub);

    block.appendChild(stage);
    block.appendChild(copy);
  }

  function init() {
    var block = document.getElementById('block50k');
    if (!block || block.getAttribute('data-b50k') === 'ready') { return; }

    build(block);
    block.setAttribute('data-b50k', 'ready');
    block.classList.add('is-ready');

    /* Reduced motion: CSS already renders the static pose — nothing to pause. */
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) { return; }

    var io = new IntersectionObserver(function (entries) {
      var last = entries[entries.length - 1];
      block.classList.toggle('is-offscreen', !last.isIntersecting);
    }, { rootMargin: '80px 0px' });
    io.observe(block);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
