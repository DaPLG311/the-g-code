/* Day One MVP™ — renders an audience pathway page from who-we-help-data.js.
   audience.html?a=<slug> */
(function () {
  var D = window.AUDIENCE, root = document.getElementById('audienceRoot');
  if (!D || !root) return;
  var a = new URLSearchParams(location.search).get('a');
  var t = D.people[a];
  function e(x){ return (x==null?'':String(x)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  if (!t) { location.replace('who-we-help.html'); return; }

  document.title = t.title + ' — Who We Help — Day One MVP™';
  var m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', t.headline + ' ' + t.intro);
  var c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute('href', 'https://dayonemvp.com/audience.html?a=' + a);
  var og = document.querySelector('meta[property="og:title"]'); if (og) og.setAttribute('content', t.title + ' — Day One MVP™');
  var ogd = document.querySelector('meta[property="og:description"]'); if (ogd) ogd.setAttribute('content', t.headline);
  var ou = document.querySelector('meta[property="og:url"]'); if (ou) ou.setAttribute('content', 'https://dayonemvp.com/audience.html?a=' + a);

  var prev = t.prev && D.people[t.prev], next = t.next && D.people[t.next];
  var h = '';

  /* hero */
  h += '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
  h += '<div class="breadcrumb"><a href="index.html">Day One MVP™</a> / <a href="who-we-help.html">Who We Help</a> / ' + e(t.title) + '</div>';
  h += '<span class="eyebrow">' + e(t.eyebrow) + '</span>';
  h += '<h1 class="mega" style="font-size:clamp(30px,5vw,62px);">' + e(t.headline) + '</h1>';
  h += '<p class="support" style="font-size:clamp(16px,2vw,19px);color:#E7E8EA;">' + e(t.intro) + '</p>';
  h += '<div class="cta-row"><a href="' + e(t.cta.href) + '" class="btn btn-primary">' + e(t.cta.label) + ' &rarr;</a>';
  if (t.secondaryCta) h += '<a href="' + e(t.secondaryCta.href) + '" class="btn btn-ghost-light">' + e(t.secondaryCta.label) + '</a>';
  else h += '<a href="who-we-help.html" class="btn btn-ghost-light">Who We Help</a>';
  h += '</div></div></div></header>';

  /* the reality + research */
  h += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
  h += '<div class="kv"><h3>The reality</h3><p>' + e(t.reality) + '</p></div>';
  if (t.research) h += '<div class="kv kv-note"><h3>' + e(t.research.title) + '</h3><p>' + e(t.research.body) + '</p></div>';
  h += '</div></div></section>';

  /* what you carry alone */
  if (t.carrying && t.carrying.length) {
    h += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
    h += '<span class="eyebrow">Sound familiar?</span><h2>' + (a === 'youth-in-tech' ? 'What you can learn.' : "What you're often carrying alone.") + '</h2>';
    h += '<ul class="prob-list">' + t.carrying.map(function (x){ return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
    h += '</div></div></section>';
  }

  /* what we can help build */
  if (t.build && t.build.length) {
    h += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    h += '<span class="eyebrow">What we can help build</span><h2>Built around your situation.</h2>';
    h += '<ul class="incl">' + t.build.map(function (x){ return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
    h += '</div></div></section>';
  }

  /* youth programs (with honest status tags) */
  if (t.programs && t.programs.length) {
    h += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    h += '<span class="eyebrow">Programs</span><h2>What we\'re building for young people.</h2>';
    h += '<div class="prog-grid">' + t.programs.map(function (p){
      return '<div class="prog"><span class="prog-name">' + e(p.name) + '</span><span class="prog-status">' + e(p.status) + '</span></div>';
    }).join('') + '</div>';
    h += '</div></div></section>';
  }

  /* youth safety */
  if (t.safety && t.safety.length) {
    h += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
    h += '<span class="eyebrow">Built Safely</span><h2>Responsible by default.</h2>';
    h += '<ul class="incl">' + t.safety.map(function (x){ return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
    h += '</div></div></section>';
  }

  /* where to start (pricing paths) */
  if (t.paths && t.paths.length) {
    h += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    h += '<span class="eyebrow">Where to start</span><h2>Recommended starting paths.</h2>';
    h += '<div class="cta-row" style="flex-wrap:wrap;">' + t.paths.map(function (p){
      return '<a class="btn btn-ghost-light" href="' + e(p.href) + '">' + e(p.label) + ' &rarr;</a>';
    }).join('') + '</div></div></div></section>';
  }

  /* related building blocks + builds */
  if (t.services && t.services.length) {
    h += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
    h += '<span class="eyebrow">Related building blocks</span><h2>Pieces that often fit.</h2>';
    h += '<div class="svc-grid" data-elroy=\"swipe\">' + t.services.map(function (s){
      return '<a class="svc-tile" href="build.html?s=' + e(s.slug) + '"><h3>' + e(s.label) + '</h3><span class="st-go">Explore →</span></a>';
    }).join('') + '</div>';
    if (t.buildsHref) h += '<div class="cta-row" style="margin-top:8px;"><a class="btn btn-ghost-light" href="' + e(t.buildsHref) + '">' + e(t.buildsLabel || 'See the build world') + ' &rarr;</a></div>';
    h += '</div></div></section>';
  }

  /* bottom CTA + status + prev/next */
  h += '<section class="overlay-sec"><div class="wrap"><div class="smoke center wide reveal">';
  h += '<span class="eyebrow">A Real Next Step</span>';
  h += '<h2 class="statement">' + e(t.title) + '?<span class="accent">Let\'s talk.</span></h2>';
  h += '<div class="cta-row" style="justify-content:center;flex-wrap:wrap;"><a href="' + e(t.cta.href) + '" class="btn btn-primary">' + e(t.cta.label) + ' &rarr;</a>';
  h += '<a href="tel:+15189126142" class="btn btn-ghost-light">Call 518 912 6142</a></div>';
  if (t.status) h += '<p class="cta-sub">' + e(t.status) + '</p>';
  var pn = '<div class="prevnext">';
  pn += prev ? '<a href="audience.html?a=' + t.prev + '">&larr; ' + e(prev.title) + '</a>' : '<span></span>';
  pn += next ? '<a href="audience.html?a=' + t.next + '">' + e(next.title) + ' &rarr;</a>' : '<span></span>';
  pn += '</div>';
  h += pn + '</div></div></section>';

  root.innerHTML = h;
  if (window.DOM_AUTOLINK) window.DOM_AUTOLINK(root);

  // per-view structured data
  (function () {
    var url = 'https://dayonemvp.com/audience.html?a=' + a;
    var graph = [
      {"@type":"WebPage","@id":url+"#webpage","url":url,"name":t.title+" — Who We Help — Day One MVP™","description":t.headline,"isPartOf":{"@id":"https://dayonemvp.com/#website"},"breadcrumb":{"@id":url+"#bc"}},
      {"@type":"Service","name":"Day One MVP™ for "+t.title,"description":t.intro,"provider":{"@type":"Organization","name":"Day One MVP","url":"https://dayonemvp.com/"},"audience":{"@type":"Audience","audienceType":t.title},"url":url},
      {"@type":"BreadcrumbList","@id":url+"#bc","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Who We Help","item":"https://dayonemvp.com/who-we-help.html"},
        {"@type":"ListItem","position":2,"name":t.title}
      ]}
    ];
    try { var sc=document.createElement('script'); sc.type='application/ld+json'; sc.text=JSON.stringify({ "@context":"https://schema.org", "@graph":graph }); document.head.appendChild(sc); } catch(e){}
  })();
})();
