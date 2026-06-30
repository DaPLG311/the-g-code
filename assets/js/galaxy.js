/* Day One Galaxy — canvas starfield with depth, twinkle, drift, parallax + shooting stars.
   Lighter layered-motion approach (Canvas 2D, not WebGL): ~90% of the effect, fast + safe.
   Self-hosted => CSP script-src 'self' clean. Reduced-motion: one static frame, no loop.
   Pauses when the tab is hidden. */
(function () {
  "use strict";
  var canvas = document.getElementById("galaxy");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = 1, cx = 0, cy = 0;
  var stars = [], shooting = [], t = 0, raf = null;
  var mx = 0, my = 0, ex = 0, ey = 0; // mouse target + eased

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
    build();
  }

  function build() {
    stars = [];
    var mobile = window.innerWidth < 760;
    var target = Math.min((W * H) / (mobile ? 3600 : 1700), mobile ? 230 : 560);
    var palette = ["#ffffff", "#cfe0ff", "#ffe7bf", "#e6c6ff", "#bff1ff", "#ffd6ef"];
    for (var i = 0; i < target; i++) {
      var z = Math.random(); // 0 far .. 1 near
      stars.push({
        x: Math.random() * W, y: Math.random() * H, z: z,
        r: (0.4 + z * 1.9) * (Math.random() * 0.8 + 0.55),
        c: palette[(Math.random() * palette.length) | 0],
        ph: Math.random() * 6.283, sp: rand(0.5, 1.7), base: rand(0.32, 0.95)
      });
    }
  }

  function star(s, px, py) {
    var tw = reduce ? 0.85 : (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
    var a = s.base * tw;
    var x = s.x + px * s.z, y = s.y + py * s.z;
    ctx.globalAlpha = a; ctx.fillStyle = s.c;
    ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
    if (s.r > 1.5) { ctx.globalAlpha = a * 0.22; ctx.beginPath(); ctx.arc(x, y, s.r * 3.4, 0, 6.283); ctx.fill(); }
  }

  function render(px, py) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < stars.length; i++) star(stars[i], px, py);
    for (var j = shooting.length - 1; j >= 0; j--) {
      var sh = shooting[j];
      var a = 1 - sh.life / sh.max;
      if (a <= 0) { shooting.splice(j, 1); continue; }
      ctx.globalAlpha = a; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x - sh.vx * 5, sh.y - sh.vy * 5); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  function frame() {
    t += 0.016;
    ex += (mx - ex) * 0.045; ey += (my - ey) * 0.045;
    render(ex * 0.025, ey * 0.025);
    // gentle drift + recycle
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += 0.015 * (0.4 + s.z); s.y += 0.004 * (0.4 + s.z);
      if (s.x > W + 4) s.x = -4; if (s.y > H + 4) s.y = -4;
    }
    // occasional shooting star
    if (Math.random() < 0.005 && shooting.length < 2) {
      shooting.push({ x: rand(W * 0.1, W), y: rand(-10, H * 0.45), vx: rand(-7, -3.5), vy: rand(2.5, 5), life: 0, max: rand(38, 66) });
    }
    for (var k = 0; k < shooting.length; k++) { shooting[k].x += shooting[k].vx; shooting[k].y += shooting[k].vy; shooting[k].life++; }
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });
  if (!reduce) {
    window.addEventListener("mousemove", function (e) { mx = e.clientX - cx; my = e.clientY - cy; }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else if (!raf) { raf = requestAnimationFrame(frame); }
    });
  }
  resize();
  if (reduce) render(0, 0); else raf = requestAnimationFrame(frame);
})();
