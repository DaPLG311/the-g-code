/* Day One MVP™ — renders a dedicated pricing-tier page from pricing-data.js.
   tier.html?p=<slug> */
(function () {
  var D = window.PRICING, root = document.getElementById('tierRoot');
  if (!D || !root) return;
  var p = new URLSearchParams(location.search).get('p');
  var t = D.tiers[p];
  function e(x){ return (x==null?'':String(x)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  if (!t) { location.replace('pricing.html'); return; }

  document.title = t.title + ' — Pricing — Day One MVP™';
  var m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', t.promise + ' ' + t.explanation.slice(0, 120));
  var c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute('href', 'https://dayonemvp.com/tier.html?p=' + p);

  var prev = t.prev && D.tiers[t.prev], next = t.next && D.tiers[t.next];
  var html = '';

  /* hero */
  html += '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
  html += '<div class="breadcrumb"><a href="index.html">Day One MVP™</a> / <a href="pricing.html">Pricing</a> / ' + e(t.title) + '</div>';
  html += '<span class="eyebrow">Pricing · ' + e(t.title) + '</span>';
  html += '<h1 class="mega" style="font-size:clamp(32px,5.4vw,64px);">' + e(t.promise) + '</h1>';
  html += '<p class="tier-price">' + e(t.price) + '</p>';
  html += '<div class="cta-row"><a href="' + e(t.cta.href) + '" class="btn btn-primary">' + e(t.cta.label) + ' &rarr;</a>';
  html += '<a href="pricing.html" class="btn btn-ghost-light">All Pricing</a></div>';
  html += '</div></div></header>';

  /* what this is */
  html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
  html += '<div class="kv"><h3>What this is</h3><p>' + e(t.explanation) + '</p></div>';
  if (t.payStructure && t.payStructure.length) {
    html += '<div class="pay-struct">' + t.payStructure.map(function (s){ return '<span>' + e(s) + '</span>'; }).join('') + '</div>';
  }
  if (t.research) html += '<div class="kv kv-note"><h3>' + e(t.research.title) + '</h3><p>' + e(t.research.body) + '</p></div>';
  html += '</div></div></section>';

  /* what's included */
  if (t.includes && t.includes.length) {
    html += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
    html += '<span class="eyebrow">' + e(t.includesTitle || "What's included") + '</span><h2>What you get.</h2>';
    html += '<ul class="incl">' + t.includes.map(function (x){ return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
    if (t.note) html += '<div class="kv kv-note" style="margin-top:22px;"><h3>' + e(t.note.title) + '</h3><p>' + e(t.note.body) + '</p></div>';
    if (t.qualification) html += '<p class="support" style="margin-top:20px;">' + e(t.qualification) + '</p>';
    html += '</div></div></section>';
  }

  /* bottom CTA + prev/next */
  html += '<section class="overlay-sec"><div class="wrap"><div class="smoke center wide reveal">';
  html += '<span class="eyebrow">Ready When You Are</span>';
  html += '<h2 class="statement">' + e(t.title) + '.<span class="accent">Let\'s scope it.</span></h2>';
  html += '<div class="cta-row" style="justify-content:center;"><a href="' + e(t.cta.href) + '" class="btn btn-primary">' + e(t.cta.label) + ' &rarr;</a>';
  html += '<a href="what-should-i-build-first.html" class="btn btn-ghost-light">Not sure? Compare</a></div>';
  html += '<p class="cta-sub">Founder-led from the first conversation — no handoff, no sales layer.</p>';
  var pn = '<div class="prevnext">';
  pn += prev ? '<a href="tier.html?p=' + t.prev + '">&larr; ' + e(prev.title) + '</a>' : '<span></span>';
  pn += next ? '<a href="tier.html?p=' + t.next + '">' + e(next.title) + ' &rarr;</a>' : '<span></span>';
  pn += '</div>';
  html += pn + '</div></div></section>';

  root.innerHTML = html;
  if (window.DOM_AUTOLINK) window.DOM_AUTOLINK(root);

  // per-view structured data — price only where it's a real, visible figure
  (function () {
    var url = 'https://dayonemvp.com/tier.html?p=' + p;
    var priceMap = { 'idea-session':{min:250,max:1000}, 'blueprint':{price:3500}, 'working-alpha':{price:15000}, 'mvp-launch':{price:30000}, 'platform':{min:50000} };
    var ps = priceMap[p];
    var offer = { "@type":"Offer", "priceCurrency":"USD", "category":"Service", "url":url, "description":t.promise };
    if (ps && ps.price) offer.price = String(ps.price);
    else if (ps && (ps.min || ps.max)) {
      offer.priceSpecification = { "@type":"PriceSpecification", "priceCurrency":"USD" };
      if (ps.min) offer.priceSpecification.minPrice = ps.min;
      if (ps.max) offer.priceSpecification.maxPrice = ps.max;
    }
    var graph = [
      {"@type":"WebPage","@id":url+"#webpage","url":url,"name":t.title+" — Pricing — Day One MVP™","description":t.promise,"isPartOf":{"@id":"https://dayonemvp.com/#website"},"breadcrumb":{"@id":url+"#bc"}},
      {"@type":"Service","name":t.title,"description":t.explanation,"serviceType":"Product build","provider":{"@type":"Organization","name":"Day One MVP","url":"https://dayonemvp.com/"},"url":url,"offers":offer},
      {"@type":"BreadcrumbList","@id":url+"#bc","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Pricing","item":"https://dayonemvp.com/pricing.html"},
        {"@type":"ListItem","position":2,"name":t.title}
      ]}
    ];
    try { var sc=document.createElement('script'); sc.type='application/ld+json'; sc.text=JSON.stringify({ "@context":"https://schema.org", "@graph":graph }); document.head.appendChild(sc); } catch(e){}
  })();
})();
