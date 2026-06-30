/* Day One Galaxy — top-down 3D spiral galaxy (Three.js r149, self-hosted, CSP 'self').
   Sun = Home at the core. 8 service-stack planets sit on the rotating spiral arms.
   The galaxy (stars + dust + nebula) spins; planets stay put (clickable) and spin on axis.
   Pseudo-realistic procedural planet textures (NASA-toned art direction, never labeled by analog).
   Fallbacks: no-WebGL → card list; prefers-reduced-motion → static frame; mobile → lighter scene. */
(function () {
  "use strict";
  var THREE = window.THREE;
  var canvas = document.getElementById("gx3-canvas");
  var stage = document.getElementById("gx3-stage");
  var labelLayer = document.getElementById("gx3-labels");
  if (!canvas || !stage) return;

  function hasWebGL() {
    try { var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
    catch (e) { return false; }
  }
  if (!THREE || !hasWebGL()) { document.body.classList.add("gx3-nowebgl"); return; }
  document.body.classList.add("gx3-live");

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia && matchMedia("(max-width: 820px)").matches;

  // ---- planet model (public service stack). analog = art direction only, never shown ----
  var SUN = { id: "home", name: "Home", kicker: "Day One MVP™", line: "Return to the home world.", href: "index.html" };
  var PLANETS = [
    { id: "start",   name: "Start the Company",   analog: "earth",   href: "build.html?cat=start-the-company",
      kicker: "Begin", head: "Turn the idea into a real business direction.",
      copy: "We clarify the customer, problem, offer, pricing, and the first responsible move before expensive work begins.", cta: "Explore Start the Company" },
    { id: "build",   name: "Build the Product",   analog: "mars",    href: "build.html?cat=build-the-product",
      kicker: "Make", head: "Build the first version that proves the idea.",
      copy: "Websites, portals, MVPs, dashboards, and booking systems built around the real user journey — not a feature pile.", cta: "Explore Build the Product" },
    { id: "install", name: "Install the Systems", analog: "uranus",  href: "build.html?cat=install-the-systems",
      kicker: "Connect", head: "Connect the work behind the business.",
      copy: "CRM, workflows, communication, reporting, and onboarding so the company operates with less chaos.", cta: "Explore Install the Systems" },
    { id: "grow",    name: "Grow the Business",   analog: "jupiter", href: "build.html?cat=grow-the-business",
      kicker: "Expand", head: "Turn attention into customers.",
      copy: "Offers, sales paths, follow-up, campaigns, search readiness, reputation, retention, and referral systems.", cta: "Explore Grow the Business" },
    { id: "train",   name: "Train the People",    analog: "venus",   href: "build.html?cat=train-the-people",
      kicker: "Transfer", head: "Make sure people can operate what gets built.",
      copy: "Workshops, private sessions, onboarding, role-play, and learning portals that transfer real capability.", cta: "Explore Training" },
    { id: "media",   name: "Produce the Media",   analog: "neptune", href: "build.html?cat=produce-the-media",
      kicker: "Voice", head: "Give the company a voice people understand.",
      copy: "Founder content, product demos, training media, social clips, audio, and video tied to the business purpose.", cta: "Explore Media" },
    { id: "operated",name: "Operated Calls™",   analog: "saturn",  href: "operated-calls.html",
      kicker: "Engage", head: "Stop passing the idea around.",
      copy: "Speak with the operator shaping the work — real information, real decisions, real movement. Not another sales call.", cta: "Book an Operated Call™" },
    { id: "maestro", name: "The Maestro Method™", analog: "violet", href: "maestro-method.html",
      kicker: "Method", head: "Complex work. One direction. Less time lost.",
      copy: "We do not remove the work — we remove the delay around it. The method is invisible. The progress is not.", cta: "See the Method" }
  ];

  // per-world "scan" copy — sci-fi landing report tied to the business meaning
  var SCAN = {
    start:    { terr: "Bedrock of customer, offer, and price",   land: "Where the idea takes root as a real direction" },
    build:    { terr: "Raw ground shaped into a first build",     land: "The smallest version that proves the idea" },
    install:  { terr: "Cool networks of CRM, flow, and reporting", land: "The quiet wiring that runs the business" },
    grow:     { terr: "Vast storm-bands of offers and campaigns", land: "Where attention is pulled into customers" },
    train:    { terr: "Dense atmosphere of skill transfer",       land: "People learning to operate what is built" },
    media:    { terr: "Deep currents of story, sound, and video", land: "The company's voice, made visible" },
    operated: { terr: "Ringed channel of real-time decisions",    land: "Speak with the operator shaping the work" },
    maestro:  { terr: "Hidden architecture that removes delay",   land: "Complex work, one direction, less time lost" }
  };

  // alien-glyph decode: scramble cryptic glyphs that resolve to the target text, left→right
  var GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾﾀﾁﾂﾃﾄﾅﾆﾇﾊﾋﾌﾍﾎΛΨΩΞΣΔΦΘ◊◈△▽▶◀⟁⌁01".split("");
  function decode(el, target, dur) {
    if (!el) return; el._tok = target; var t0 = performance.now();
    (function tick(now) {
      if (el._tok !== target) return;                       // a newer decode took over
      var p = Math.min(1, (now - t0) / dur), lock = Math.floor(p * target.length), s = "";
      for (var i = 0; i < target.length; i++) { var ch = target[i]; s += (ch === " " || i < lock) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
      el.textContent = s;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    })(t0);
  }
  function runScan(p) {
    var L = p._lab; if (!L) return;
    decode(L.sec, L.secT, 680); decode(L.name, L.nameT, 940); decode(L.terr, L.terrT, 1180); decode(L.land, L.landT, 1380);
  }

  // ---- renderer / scene / camera ----
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050507);
  scene.fog = new THREE.FogExp2(0x05060a, 0.0026);

  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
  var camBase = new THREE.Vector3(0, 92, 75);   // single resting framing (cursor-zoom removed)
  camera.position.copy(camBase);
  camera.lookAt(0, 0, 0);

  var galaxy = new THREE.Group();   // spins: stars, dust, nebula, core glow
  var planetsGrp = new THREE.Group(); // steady: planets + sun (clickable)
  scene.add(galaxy); scene.add(planetsGrp);

  // ---- lights (the sun is the source) ----
  scene.add(new THREE.AmbientLight(0x2a3550, 0.7));
  var sunLight = new THREE.PointLight(0xfff0d2, 2.4, 0, 0);
  sunLight.position.set(0, 0, 0); scene.add(sunLight);
  var rim = new THREE.DirectionalLight(0x6a86ff, 0.35); rim.position.set(-1, 0.6, -1); scene.add(rim);

  // ---- helpers: radial sprite + canvas textures ----
  function radialSprite(c1, c2) {
    var s = 128, cv = document.createElement("canvas"); cv.width = cv.height = s;
    var x = cv.getContext("2d"), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, c1); g.addColorStop(0.4, c2); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function planetTexture(type) {
    var W = 512, H = 256, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d"), i;
    function band(y0, y1, col) { x.fillStyle = col; x.fillRect(0, y0, W, y1 - y0); }
    function blob(cx, cy, r, col) { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, r, r * rnd(0.5, 0.9), 0, 0, 7); x.fill(); }
    function caps(col) { x.fillStyle = col; x.fillRect(0, 0, W, H * 0.07); x.fillRect(0, H * 0.93, W, H * 0.07); }
    if (type === "earth") {
      band(0, H, "#12345f"); for (i = 0; i < 26; i++) blob(rnd(0, W), rnd(H * 0.15, H * 0.85), rnd(10, 40), i % 3 ? "#2f6b3a" : "#6b5a36");
      for (i = 0; i < 24; i++) { x.globalAlpha = rnd(0.18, 0.4); blob(rnd(0, W), rnd(0, H), rnd(14, 46), "#eef3ff"); } x.globalAlpha = 1; caps("#eaf2ff");
    } else if (type === "mars") {
      band(0, H, "#9c4a2a"); for (i = 0; i < 34; i++) { x.globalAlpha = rnd(0.15, 0.4); blob(rnd(0, W), rnd(0, H), rnd(8, 34), i % 2 ? "#7a3420" : "#c47a4a"); } x.globalAlpha = 1; caps("#f3e9e2");
    } else if (type === "jupiter") {
      var jb = ["#caa97e", "#a9855a", "#d8c39c", "#8f6a44", "#c2a274", "#e0d2b4"];
      var y = 0; while (y < H) { var h = rnd(10, 26); band(y, y + h, jb[(Math.random() * jb.length) | 0]); y += h; }
      x.globalAlpha = 0.5; blob(W * 0.66, H * 0.6, 26, "#b5563a"); x.globalAlpha = 1;
    } else if (type === "venus") {
      band(0, H, "#d8b27a"); for (i = 0; i < 30; i++) { x.globalAlpha = rnd(0.12, 0.3); var yy = rnd(0, H); x.fillStyle = i % 2 ? "#efd9ad" : "#bd9056"; x.fillRect(0, yy, W, rnd(6, 16)); } x.globalAlpha = 1;
    } else if (type === "uranus") {
      band(0, H, "#9fd9dd"); for (i = 0; i < 10; i++) { x.globalAlpha = 0.16; x.fillStyle = i % 2 ? "#c4eef0" : "#7fbfc6"; x.fillRect(0, rnd(0, H), W, rnd(8, 20)); } x.globalAlpha = 1;
    } else if (type === "neptune") {
      band(0, H, "#2b4fb0"); for (i = 0; i < 12; i++) { x.globalAlpha = 0.2; x.fillStyle = i % 2 ? "#4f78d8" : "#1d3a86"; x.fillRect(0, rnd(0, H), W, rnd(8, 18)); } x.globalAlpha = 0.55; blob(W * 0.4, H * 0.45, 20, "#11245e"); x.globalAlpha = 1;
    } else if (type === "saturn") {
      var sb = ["#e6d3a6", "#d8c08a", "#efe1bd", "#ccae78"]; var ys = 0; while (ys < H) { var hs = rnd(12, 24); band(ys, ys + hs, sb[(Math.random() * sb.length) | 0]); ys += hs; }
    } else { /* violet gas giant (maestro) */
      var vb = ["#5a3da0", "#7a57c8", "#43286f", "#9b7ce0", "#4e338f"]; var yv = 0; while (yv < H) { var hv = rnd(12, 24); band(yv, yv + hv, vb[(Math.random() * vb.length) | 0]); yv += hv; }
      x.globalAlpha = 0.4; blob(W * 0.32, H * 0.58, 22, "#c9b3ff"); x.globalAlpha = 1;
    }
    var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  var ATM = { earth: 0x5fa8ff, mars: 0xd87a44, uranus: 0x7fe6ec, jupiter: 0xe0b870, venus: 0xf0c98a, neptune: 0x4f78ff, saturn: 0xf1d48a, violet: 0x9b6cff };

  // ---- sun (home) ----
  var sun = new THREE.Mesh(new THREE.SphereGeometry(7.2, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffe7b0 }));
  sun.userData.node = SUN; planetsGrp.add(sun);
  var glowTex = radialSprite("rgba(255,240,200,0.95)", "rgba(241,198,106,0.5)");
  [26, 46, 80].forEach(function (s, i) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i === 2 ? 0xb86adf : 0xffe2a6, transparent: true, opacity: i === 2 ? 0.35 : 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.scale.set(s, s, 1); sun.add(sp);
  });

  // ---- planets on a log spiral ----
  var TURN = Math.PI * 1.7, R0 = 16, RMAX = 58;
  var sizes = { start: 4.4, build: 3.6, install: 3.4, grow: 5.2, train: 3.8, media: 3.9, operated: 4.8, maestro: 4.6 };
  var labelEls = [];
  PLANETS.forEach(function (p, idx) {
    var t = idx / (PLANETS.length - 1);
    var radius = R0 + t * (RMAX - R0);
    var ang = t * TURN + 0.5;
    var px = Math.cos(ang) * radius, pz = Math.sin(ang) * radius, py = (idx % 2 ? 1 : -1) * rnd(1.5, 4.5);
    var rad = sizes[p.id] || 4;
    var grp = new THREE.Group(); grp.position.set(px, py, pz);
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(rad, 40, 40),
      new THREE.MeshStandardMaterial({ map: planetTexture(p.analog), roughness: 0.95, metalness: 0.02 }));
    mesh.rotation.z = rnd(-0.25, 0.25); mesh.userData.node = p; mesh.userData.group = grp;
    grp.add(mesh);
    // atmosphere halo
    var halo = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.09, 32, 32),
      new THREE.MeshBasicMaterial({ color: ATM[p.analog], transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    grp.add(halo);
    // rings for saturn-analog (Operated Calls hero)
    if (p.analog === "saturn") {
      var rg = new THREE.Mesh(new THREE.RingGeometry(rad * 1.45, rad * 2.35, 64),
        new THREE.MeshBasicMaterial({ color: 0xe8cf9a, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
      rg.rotation.x = Math.PI * 0.5 - 0.42; rg.rotation.y = 0.2; grp.add(rg);
    }
    // invisible hit sphere — a "zoom window" larger than the planet so hover stays stable (no flicker as it bobs)
    var hit = new THREE.Mesh(new THREE.SphereGeometry(rad * 2.4, 12, 12), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
    hit.userData.node = p; hit.userData.group = grp; grp.add(hit); p._hit = hit;
    p._mesh = mesh; p._grp = grp; p._baseY = py; p._rad = rad; p._spin = rnd(0.0015, 0.004) * (idx % 2 ? 1 : -1);
    planetsGrp.add(grp);
    // html scan card (hover-reveal; alien text decodes to english)
    if (labelLayer) {
      var sc = SCAN[p.id] || { terr: "", land: "" };
      var el = document.createElement("div");
      el.className = "gx3-label"; el.setAttribute("data-id", p.id);
      el.innerHTML = '<span class="gx3-l-sec"></span><span class="gx3-l-name"></span>' +
        '<span class="gx3-l-row"><i>TERR</i><b class="gx3-l-terr"></b></span>' +
        '<span class="gx3-l-row"><i>LAND</i><b class="gx3-l-land"></b></span>';
      labelLayer.appendChild(el); p._label = el;
      p._lab = { sec: el.querySelector(".gx3-l-sec"), name: el.querySelector(".gx3-l-name"),
        terr: el.querySelector(".gx3-l-terr"), land: el.querySelector(".gx3-l-land"),
        secT: "SECTOR " + (idx < 9 ? "0" : "") + (idx + 1) + " · WORLD", nameT: p.name.toUpperCase(), terrT: sc.terr, landT: sc.land };
      labelEls.push(p);
    }
  });

  // ---- starfield ----
  function points(count, build) {
    var pos = new Float32Array(count * 3), col = new Float32Array(count * 3), c = new THREE.Color();
    for (var i = 0; i < count; i++) build(i, pos, col, c);
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }
  var starGeo = points(mobile ? 1500 : 3400, function (i, pos, col, c) {
    var r = rnd(150, 950), th = rnd(0, 7), ph = Math.acos(rnd(-1, 1));
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.5; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    c.setHSL(rnd(0.55, 0.66), 0.4, rnd(0.6, 0.95)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  });
  var dotTex = radialSprite("rgba(255,255,255,1)", "rgba(255,255,255,0.4)");  // soft round particles (no hard squares)
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ map: dotTex, size: 2.4, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(stars);

  // ---- spiral arm dust (the visible galaxy structure) ----
  var ARMS = 2, armCols = [[0.95, 0.78, 0.42], [0.55, 0.7, 1.0], [0.8, 0.55, 1.0], [0.45, 0.9, 1.0], [1.0, 0.6, 0.85]];
  var dustGeo = points(mobile ? 3000 : 8200, function (i, pos, col, c) {
    var arm = i % ARMS, t = Math.pow(Math.random(), 0.62);
    var radius = 16 + t * 124, ang = arm * (Math.PI * 2 / ARMS) + t * 5.6 + (Math.random() - 0.5) * (0.55 / (0.22 + t));
    var jitter = (Math.random() - 0.5) * (3 + t * 13);
    pos[i * 3] = Math.cos(ang) * radius + jitter; pos[i * 3 + 1] = (Math.random() - 0.5) * (2 + t * 5); pos[i * 3 + 2] = Math.sin(ang) * radius + jitter;
    var cc = t < 0.18 ? armCols[0] : armCols[1 + ((Math.random() * (armCols.length - 1)) | 0)];
    var b = rnd(0.5, 1); col[i * 3] = cc[0] * b; col[i * 3 + 1] = cc[1] * b; col[i * 3 + 2] = cc[2] * b;
  });
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: dotTex, size: 2.7, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  galaxy.add(dust);

  // ---- nebula haze sprites ----
  [["rgba(60,90,210,0.5)", "rgba(40,60,150,0.18)", -90, 6, -60, 300, 0x3a5ad0],
   ["rgba(150,70,200,0.5)", "rgba(110,50,160,0.16)", 110, 4, 60, 340, 0x9648c8],
   ["rgba(50,200,220,0.4)", "rgba(40,150,170,0.12)", 20, -6, 110, 260, 0x39d0e0],
   ["rgba(120,60,180,0.4)", "rgba(80,40,130,0.12)", -140, -5, 90, 320, 0x7a3cc8],
   ["rgba(70,110,220,0.4)", "rgba(40,70,160,0.12)", 150, -3, -110, 300, 0x4a6ad8]].forEach(function (n) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialSprite(n[0], n[1]), color: n[6], transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(n[2], n[3], n[4]); sp.scale.set(n[5], n[5], 1); galaxy.add(sp);
  });
  var coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialSprite("rgba(255,230,180,0.7)", "rgba(180,60,140,0.18)"), color: 0xffd9a0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreGlow.scale.set(120, 120, 1); galaxy.add(coreGlow);

  // ---- interaction ----
  var ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), hover = null, downXY = null;
  var engaged = null, pendingOff = 0, DELAY = 2000;   // sticky hover: hold the zoom, then release after a delay
  function engage(nd) { engaged = nd; pendingOff = 0; document.body.classList.add("gx3-zoom"); labelEls.forEach(function (p) { p._label.classList.toggle("is-hover", p === nd); }); if (nd && nd._lab) runScan(nd); }
  function disengage() { engaged = null; pendingOff = 0; document.body.classList.remove("gx3-zoom"); labelEls.forEach(function (p) { p._label.classList.remove("is-hover"); }); }
  var hitMeshes = PLANETS.map(function (p) { return p._hit; }).concat([sun]);
  function setPointer(e) { var r = canvas.getBoundingClientRect(); pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1; }
  function pick() { ray.setFromCamera(pointer, camera); var h = ray.intersectObjects(hitMeshes, false); return h.length ? h[0].object : null; }
  canvas.addEventListener("pointermove", function (e) {
    setPointer(e); var o = pick(); hover = o; canvas.style.cursor = o ? "pointer" : "default";
    var nd = (o && o.userData && o.userData.node && o.userData.node._lab) ? o.userData.node : null;  // planet only
    if (o === sun) { if (engaged) disengage(); }                          // hover the sun → zoom out now (click = home)
    else if (nd) { if (nd !== engaged) engage(nd); else pendingOff = 0; } // on a world → engage / cancel release
    else if (engaged && !pendingOff) pendingOff = performance.now() + DELAY;  // off → start release countdown
  });
  canvas.addEventListener("pointerleave", function () { if (engaged && !pendingOff) pendingOff = performance.now() + DELAY; });
  canvas.addEventListener("pointerdown", function (e) { downXY = [e.clientX, e.clientY]; });
  canvas.addEventListener("pointerup", function (e) {
    if (!downXY || Math.abs(e.clientX - downXY[0]) + Math.abs(e.clientY - downXY[1]) > 8) { downXY = null; return; }
    downXY = null; setPointer(e); var o = pick();
    if (!o) return;
    if (o === sun) { window.location.href = SUN.href; return; }
    if (o.userData.node) openPanel(o.userData.node);
  });

  // ---- panel ----
  var panel = document.getElementById("gx3-panel");
  function openPanel(p) {
    if (!panel) { window.location.href = p.href; return; }
    panel.querySelector(".gx3-p-kicker").textContent = p.kicker;
    panel.querySelector(".gx3-p-name").textContent = p.name;
    var sc = SCAN[p.id], si = PLANETS.indexOf(p) + 1, sl = panel.querySelector(".gx3-p-scan");
    if (sl) sl.textContent = sc ? ("SECTOR " + (si < 10 ? "0" : "") + si + " · " + sc.terr) : "";
    panel.querySelector(".gx3-p-head").textContent = p.head || "";
    panel.querySelector(".gx3-p-copy").textContent = p.copy || "";
    var a = panel.querySelector(".gx3-p-cta"); a.textContent = p.cta || "Open"; a.href = p.href;
    panel.classList.add("open"); panel.setAttribute("aria-hidden", "false");
    a.focus();
  }
  function closePanel() { if (panel) { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); } }
  if (panel) {
    panel.querySelector(".gx3-p-close").addEventListener("click", closePanel);
    panel.addEventListener("click", function (e) { if (e.target === panel) closePanel(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });
  }
  // dot-nav (static buttons in HTML)
  Array.prototype.forEach.call(document.querySelectorAll("#gx3-dots [data-i]"), function (b) {
    b.addEventListener("click", function () { openPanel(PLANETS[+b.getAttribute("data-i")]); });
  });
  var homeBtn = document.getElementById("gx3-home-dot");
  if (homeBtn) homeBtn.addEventListener("click", function () { window.location.href = SUN.href; });

  // ---- labels projection ----
  var tmp = new THREE.Vector3();
  function updateLabels() {
    if (!labelLayer) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    labelEls.forEach(function (p) {
      tmp.setFromMatrixPosition(p._grp.matrixWorld); tmp.project(camera);
      var vis = tmp.z < 1;
      p._label.style.display = vis ? "flex" : "none";
      if (vis) { p._label.style.transform = "translate(-50%,-122%) translate(" + ((tmp.x * 0.5 + 0.5) * w) + "px," + ((-tmp.y * 0.5 + 0.5) * h) + "px)"; }
    });
  }

  // ---- mouse parallax + loop ----
  var mx = 0, my = 0, ex = 0, ey = 0;
  var land = 0, lookT = new THREE.Vector3(0, 0, 0), landPos = new THREE.Vector3(), tmpV = new THREE.Vector3();
  if (!reduce) window.addEventListener("pointermove", function (e) { mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5); }, { passive: true });
  var t0 = 0, raf = null;
  function frame(ms) {
    var t = ms * 0.001; var dt = t - t0; t0 = t;
    if (!reduce) {
      galaxy.rotation.y += 0.0006;
      if (pendingOff && performance.now() > pendingOff) disengage();     // sticky-hover release after the delay
      ex += (mx - ex) * 0.04; ey += (my - ey) * 0.04;
      var bx = camBase.x + ex * 14;                              // fixed resting distance + gentle parallax sway
      var by = camBase.y - ey * 9;
      var bz = camBase.z;
      // engaged world → wide, gentle reframe onto it (sticky until release delay)
      var hp = engaged;
      if (hp) landPos.setFromMatrixPosition(hp._grp.matrixWorld);
      land += ((hp ? 1 : 0) - land) * 0.05;
      if (land > 0.001) {
        tmpV.set(bx, by, bz).sub(landPos).normalize();           // planet→camera direction
        var LD = 48;                                             // wide snap — gentle reframe, lots of backdrop kept
        bx += ((landPos.x + tmpV.x * LD) - bx) * land;
        by += ((landPos.y + tmpV.y * LD) - by) * land;
        bz += ((landPos.z + tmpV.z * LD) - bz) * land;
      }
      var ltx = hp ? landPos.x * 0.92 : 0, lty = hp ? landPos.y * 0.92 : 0, ltz = hp ? landPos.z * 0.92 : 0;
      lookT.x += (ltx - lookT.x) * 0.08; lookT.y += (lty - lookT.y) * 0.08; lookT.z += (ltz - lookT.z) * 0.08;
      camera.position.set(bx, by, bz);
      camera.lookAt(lookT.x, lookT.y, lookT.z);
      PLANETS.forEach(function (p) {
        p._mesh.rotation.y += p._spin;
        p._grp.position.y = p._baseY + Math.sin(t * 0.5 + p._baseY) * 0.5;
        var tgt = (engaged === p) ? 1.08 : 1; p._grp.scale.x += (tgt - p._grp.scale.x) * 0.15; p._grp.scale.y = p._grp.scale.z = p._grp.scale.x;
      });
      var sp = 1 + Math.sin(t * 0.8) * 0.04; coreGlow.scale.set(120 * sp, 120 * sp, 1);
    }
    planetsGrp.updateMatrixWorld(); renderer.render(scene, camera); updateLabels();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
    else if (!raf && !reduce) { t0 = performance.now() * 0.001; raf = requestAnimationFrame(frame); }
  });

  resize();
  if (reduce) { camera.position.copy(camBase); camera.lookAt(0, 0, 0); planetsGrp.updateMatrixWorld(); renderer.render(scene, camera); updateLabels(); }
  else { raf = requestAnimationFrame(frame); }
})();
