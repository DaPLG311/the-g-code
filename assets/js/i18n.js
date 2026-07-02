/* Day One MVP™ — language switchboard + client-side i18n (CSP 'self'-safe).
   4 mains: EN · ES · العربية · 中文. Dictionaries live in assets/js/lang/<code>.js
   (window.I18N.<code> = { key: html }), lazy-loaded on first switch.
   Elements opt in via data-i18n="key" (innerHTML) / data-i18n-ph="key" (placeholder).
   English is the source of truth: originals are cached before the first swap so
   EN always restores perfectly. Arabic flips the document to RTL. */
(function () {
  "use strict";
  var LANGS = [
    { code: "en", label: "EN", lang: "en", dir: "ltr" },
    { code: "es", label: "ES", lang: "es", dir: "ltr" },
    { code: "ar", label: "ع", lang: "ar", dir: "rtl" },
    { code: "zh", label: "中", lang: "zh-CN", dir: "ltr" }
  ];
  var KEY = "d1_lang";
  var originals = null;   // Map<el, html> — captured lazily before first non-EN apply
  var phOriginals = null;

  function captureOriginals() {
    if (originals) return;
    originals = new Map(); phOriginals = new Map();
    document.querySelectorAll("[data-i18n]").forEach(function (el) { originals.set(el, el.innerHTML); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { phOriginals.set(el, el.getAttribute("placeholder") || ""); });
  }

  function meta(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i]; return LANGS[0]; }

  function setDocLang(code) {
    var m = meta(code);
    document.documentElement.setAttribute("lang", m.lang);
    document.documentElement.setAttribute("dir", m.dir);
    document.body.classList.toggle("rtl", m.dir === "rtl");
  }

  function applyDict(dict) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict) { if (dict[k]) el.innerHTML = dict[k]; }
      else if (originals && originals.has(el)) el.innerHTML = originals.get(el);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      if (dict) { if (dict[k]) el.setAttribute("placeholder", dict[k]); }
      else if (phOriginals && phOriginals.has(el)) el.setAttribute("placeholder", phOriginals.get(el));
    });
  }

  function loadDict(code, cb) {
    if (window.I18N && window.I18N[code]) { cb(window.I18N[code]); return; }
    var s = document.createElement("script");
    s.src = "assets/js/lang/" + code + ".js?v=20260702a";
    s.onload = function () { cb(window.I18N && window.I18N[code]); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  function setLang(code, persist) {
    if (persist !== false) { try { localStorage.setItem(KEY, code); } catch (e) {} }
    markActive(code);
    if (code === "en") { setDocLang("en"); applyDict(null); return; }
    captureOriginals();
    loadDict(code, function (dict) {
      if (!dict) { setDocLang("en"); return; }   // dictionary missing → stay EN, no broken state
      setDocLang(code); applyDict(dict);
    });
  }

  // ---- switchboard UI (injected; styles inline-injected — CSP style-src allows it) ----
  var bar = null;
  function markActive(code) {
    if (!bar) return;
    Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang") === code);
    });
  }
  function build() {
    var css = document.createElement("style");
    css.textContent =
      ".d1-langbar{position:fixed;top:0;left:0;right:0;z-index:1300;display:flex;justify-content:center;align-items:center;gap:3px;" +
      "padding:4px 10px;background:rgba(6,7,10,0.94);border-bottom:1px solid rgba(200,168,106,0.28);" +
      "-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);}" +
      "body:not(.galaxy-page){padding-top:33px;}" +                          /* make room for the strip */
      "body:not(.galaxy-page) nav#nav{top:33px !important;}" +               /* push the fixed nav below the strip */
      "body.galaxy-page .d1-langbar{display:none;}" +                        /* immersive galaxy: no strip */
      ".d1-langbar button{appearance:none;border:0;background:transparent;color:#C9CCD3;cursor:pointer;" +
      "font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:0.09em;line-height:1;padding:5px 13px;border-radius:999px;" +
      "transition:background .2s ease,color .2s ease;}" +
      ".d1-langbar button:hover{color:#F4F1EA;}" +
      ".d1-langbar button.on{background:linear-gradient(180deg,#F4DBA1,#C8A86A 60%,#A9863F);color:#0B0B0D;font-weight:600;}" +
      "html[dir=rtl] body{direction:rtl;}" +
      "html[dir=rtl] .smoke,html[dir=rtl] .foot-col,html[dir=rtl] .cat,html[dir=rtl] .method-card,html[dir=rtl] .aud-card{text-align:right;}" +
      "html[dir=rtl] .cta-sub-left,html[dir=rtl] .cta-sub{text-align:right;}" +
      "html[dir=rtl] .breadcrumb{direction:rtl;}";
    document.head.appendChild(css);
    bar = document.createElement("div");
    bar.className = "d1-langbar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Language");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = l.label;
      b.setAttribute("data-lang", l.code);
      b.setAttribute("aria-label", l.code === "en" ? "English" : l.code === "es" ? "Español" : l.code === "ar" ? "العربية" : "中文");
      b.addEventListener("click", function () { setLang(l.code); });
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
  }

  function init() {
    build();
    var saved = "en";
    try { saved = localStorage.getItem(KEY) || "en"; } catch (e) {}
    if (saved !== "en") setLang(saved, false); else markActive("en");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
