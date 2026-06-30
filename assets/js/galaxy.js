/* Day One Galaxy — fake-3D rotating SPIRAL galaxy (Canvas 2D, self-hosted, CSP-safe).
   A tilted spiral star-system that slowly rotates (distant-travel feel), with depth
   layers, twinkle, shooting stars, mouse parallax, AND constellation lines drawn
   between the real HTML portal nodes (so the lines always track them).
   Reduced-motion: one static frame, no loop. Pauses on hidden tab. */
(function () {
  "use strict";
  var canvas = document.getElementById("galaxy");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = 1, cx = 0, cy = 0, maxR = 0;
  var stars = [], shooting = [], rot = 0, t = 0, raf = null;
  var mx = 0, my = 0, ex = 0, ey = 0;
  var TILT = 0.6;            // disk tilt (perspective): squashes Y
  var ARMS = 2, SPIN = 5.2;  // spiral arms + how hard they wind

  // node adjacency for constellation lines (ids set in galaxy.html)
  var LINKS = [
    ["gx-core", "n-oc"], ["gx-core", "n-maestro"], ["gx-core", "n-wwb"], ["gx-core", "n-pricing"],
    ["n-oc", "n-hiw"], ["n-maestro", "n-wwh"], ["n-wwb", "n-ta"], ["n-pricing", "n-mj"]
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H * 0.5;
    maxR = Math.hypot(W, H) * 0.62;
    build();
  }

  function build() {
    stars = [];
    var mobile = window.innerWidth < 760;
    var count = mobile ? 360 : 900;
    var core = ["#fff7e6", "#ffe7bf", "#f1c66a"];           // warm core
    var mid = ["#cfe0ff", "#bff1ff", "#e6c6ff", "#ffd6ef"]; // cool arms
    var out = ["#ffffff", "#cfe0ff"];                        // far field
    for (var i = 0; i < count; i++) {
      var arm = Math.random() < 0.72;
      var dist = Math.pow(Math.random(), 0.62);              // 0 core .. 1 rim
      var r = dist * maxR;
      var th;
      if (arm) {
        th = (i % ARMS) * (6.283 / ARMS) + dist * SPIN + gauss() * (0.5 / (0.18 + dist));
      } else { th = Math.random() * 6.283; }
      var pal = dist < 0.16 ? core : (dist < 0.6 ? mid : out);
      stars.push({
        r: r, th: th, dist: dist,
        size: (dist < 0.16 ? rand(0.6, 2.0) : rand(0.35, 1.5)) * (Math.random() * 0.7 + 0.6),
        c: pal[(Math.random() * pal.length) | 0],
        ph: Math.random() * 6.283, sp: rand(0.5, 1.7), base: rand(0.3, 0.95)
      });
    }
    stars.sort(function (a, b) { return a.dist - b.dist; });
  }

  function render(px, py) {
    ctx.clearRect(0, 0, W, H);
    // core bloom
    var g = ctx.createRadialGradient(cx + px * 0.4, cy + py * 0.4, 0, cx, cy, maxR * 0.34);
    g.addColorStop(0, "rgba(241,198,106,0.16)"); g.addColorStop(0.4, "rgba(176,50,134,0.07)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.th + rot * (1.0 - s.dist * 0.35);            // inner rotates a touch faster
      var depth = 0.3 + s.dist * 0.9;
      var x = cx + Math.cos(a) * s.r + px * depth;
      var y = cy + Math.sin(a) * s.r * TILT + py * depth;
      var tw = reduce ? 0.85 : (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
      ctx.globalAlpha = s.base * tw;
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(x, y, s.size, 0, 6.283); ctx.fill();
      if (s.size > 1.4) { ctx.globalAlpha = s.base * tw * 0.22; ctx.beginPath(); ctx.arc(x, y, s.size * 3.2, 0, 6.283); ctx.fill(); }
    }
    // shooting stars
    for (var j = shooting.length - 1; j >= 0; j--) {
      var sh = shooting[j], al = 1 - sh.life / sh.max;
      if (al <= 0) { shooting.splice(j, 1); continue; }
      ctx.globalAlpha = al; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x - sh.vx * 5, sh.y - sh.vy * 5); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    drawLinks();
  }

  function center(id) {
    var el = document.getElementById(id); if (!el) return null;
    var t = el.querySelector(".gx-orb") || el;   // connect planet-to-planet, not label boxes
    var r = t.getBoundingClientRect(); var cr = canvas.getBoundingClientRect();
    return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2 };
  }
  function drawLinks() {
    var pulse = reduce ? 0.5 : (0.4 + 0.18 * Math.sin(t * 0.8));
    ctx.lineWidth = 1; ctx.lineCap = "round";
    for (var i = 0; i < LINKS.length; i++) {
      var a = center(LINKS[i][0]), b = center(LINKS[i][1]);
      if (!a || !b) continue;
      var grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, "rgba(200,168,106," + (pulse * 0.7) + ")");
      grad.addColorStop(0.5, "rgba(200,168,106," + (pulse * 0.28) + ")");
      grad.addColorStop(1, "rgba(150,120,200," + (pulse * 0.5) + ")");
      ctx.strokeStyle = grad;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  var field = null;
  function frame() {
    t += 0.016; rot += 0.00055;
    ex += (mx - ex) * 0.04; ey += (my - ey) * 0.04;
    render(ex * 0.018, ey * 0.018);          // stars: distant, move least
    if (field === null) field = document.querySelector(".gx-field") || false;
    if (field) field.style.transform = "translate(" + (-ex * 0.03).toFixed(1) + "px," + (-ey * 0.03).toFixed(1) + "px)"; // nodes: foreground, move more
    if (Math.random() < 0.005 && shooting.length < 2) {
      shooting.push({ x: rand(W * 0.1, W), y: rand(-10, H * 0.5), vx: rand(-7, -3.5), vy: rand(2.5, 5), life: 0, max: rand(40, 70) });
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
  // a couple static frames so links pick up node positions after layout settles
  if (reduce) { setTimeout(function () { render(0, 0); }, 120); }
  else { raf = requestAnimationFrame(frame); }
})();
