/* Day One MVP™ — renders the What We Build world from build-data.js.
   build.html?cat=<slug>  -> category hub (clickable service tiles)
   build.html?s=<slug>    -> full service page
   build.html             -> the six worlds */
(function () {
  var D = window.BUILD, root = document.getElementById("buildRoot");
  if (!D || !root) return;
  // merge interior-page extension copy (How DOM approaches it / Who it's for)
  if (window.BUILD_EXT) Object.keys(window.BUILD_EXT).forEach(function (k) {
    if (D.services[k]) { var x = window.BUILD_EXT[k]; D.services[k].approach = x.approach; D.services[k].whoFor = x.whoFor; }
  });
  var p = new URLSearchParams(location.search);
  var sSlug = p.get("s"), cSlug = p.get("cat");
  var catBy = function (s) { return D.categories.filter(function (c) { return c.slug === s; })[0]; };

  // Primary action per page: product builds push the MVP CTA; everything else
  // pushes the founder conversation. Calm-giant voice, one primary action.
  function primaryCTA(catSlug){
    if (catSlug === "build-the-product") return {
      label: "Start My MVP With Jack",
      href: "start.html?path=" + catSlug,
      sub: "Talk directly with the founder to scope the right first version."
    };
    return {
      label: "Tell Jack the Idea",
      href: "start.html?path=" + catSlug,
      sub: "Founder-led from the first conversation — no handoff, no sales layer."
    };
  }
  function ctaBlock(cta, extraClass){
    return '<div class="cta-row' + (extraClass ? ' ' + extraClass : '') + '" style="justify-content:center;">' +
           '<a href="' + cta.href + '" class="btn btn-primary">' + e(cta.label) + ' &rarr;</a></div>' +
           '<p class="cta-sub">' + e(cta.sub) + '</p>';
  }

  function e(x){ return (x==null?"":String(x)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function crumb(parts){ // [{t,h}] ; last has no link
    return '<div class="breadcrumb">' + parts.map(function(x,i){
      return (x.h && i<parts.length-1) ? '<a href="'+x.h+'">'+e(x.t)+'</a>' : e(x.t);
    }).join(' / ') + '</div>';
  }
  function tile(href, kicker, title, clue, dev){
    var inner = '<span class="st-k">'+e(kicker)+'</span><h3>'+e(title)+'</h3><p>'+e(clue)+'</p>'+
                '<span class="st-go">'+(dev?'In Development':'Explore →')+'</span>';
    return dev ? '<div class="svc-tile dev">'+inner+'</div>'
               : '<a class="svc-tile" href="'+href+'">'+inner+'</a>';
  }
  function setMeta(t, d){
    document.title = t;
    var m=document.querySelector('meta[name="description"]'); if(m&&d) m.setAttribute("content", d);
    var c=document.querySelector('link[rel="canonical"]'); if(c) c.setAttribute("href","https://dayonemvp.com/build.html"+(sSlug?"?s="+encodeURIComponent(sSlug):cSlug?"?cat="+encodeURIComponent(cSlug):""));
  }

  function renderService(slug){
    var s = D.services[slug]; if(!s){ return renderWorlds(); }
    var cat = catBy(s.cat);
    var cta = primaryCTA(cat.slug);
    setMeta(s.title+" — Day One MVP™", s.definition);
    var prev = s.prev && D.services[s.prev], next = s.next && D.services[s.next];
    var rel = (s.related||[]).map(function(r){ return D.services[r]; }).filter(Boolean);
    var html = '';

    /* 1 — TOP: title, one-line explanation, primary CTA */
    html += '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
    html += crumb([{t:"What We Build",h:"what-we-build.html"},{t:cat.title,h:"build.html?cat="+cat.slug},{t:s.title}]);
    html += '<span class="eyebrow">'+e(cat.title)+'</span>';
    html += '<h1 class="mega" style="font-size:clamp(34px,5.6vw,68px);">'+e(s.title)+'</h1>';
    html += '<p class="support hero-q">'+e(s.definition)+'</p>';
    html += '<div class="cta-row"><a href="'+cta.href+'" class="btn btn-primary">'+e(cta.label)+' &rarr;</a>'+
            '<a href="build.html?cat='+cat.slug+'" class="btn btn-ghost-light">Back to '+e(cat.title)+'</a></div>';
    html += '<p class="cta-sub cta-sub-left">'+e(cta.sub)+'</p>';
    html += '</div></div></header>';

    /* 2 — WHAT THIS IS  &  3 — WHY IT MATTERS */
    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    html += '<div class="kv"><h3>What this is</h3><p>'+e(s.heroQuestion)+' '+e(s.businessExample)+'</p></div>';
    html += '<div class="kv"><h3>Why it matters</h3><p>'+e(s.whyItMatters)+'</p></div>';
    if(s.commonMistake){ html += '<div class="kv kv-note"><h3>The common mistake</h3><p>'+e(s.commonMistake)+'</p></div>'; }
    html += '</div></div></section>';

    /* 4 — HOW DOM APPROACHES IT (+ mid CTA) */
    html += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
    html += '<span class="eyebrow">How Day One MVP™ approaches it</span>';
    html += '<p class="support lead-p">'+e(s.approach || s.definition)+'</p>';
    if(s.jackQuestion){ html += '<blockquote class="pull">"'+e(s.jackQuestion)+'"<span class="pull-by">— Jack Rodriguez</span></blockquote>'; }
    html += ctaBlock(cta, 'cta-mid');
    html += '</div></div></section>';

    /* 5 — WHAT GETS DELIVERED  &  6 — WHO IT'S FOR */
    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    html += '<div class="kv"><h3>What gets delivered</h3><ul class="incl">'+ (s.whatWeBuild||[]).map(function(x){return '<li>'+e(x)+'</li>';}).join('') +'</ul></div>';
    if(s.whoFor){ html += '<div class="kv"><h3>Who it’s for</h3><p>'+e(s.whoFor)+'</p></div>'; }
    html += '</div></div></section>';

    /* RELATED */
    if(rel.length){
      html += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
      html += '<span class="eyebrow">Continue the Build</span><h2>Related concepts.</h2>';
      html += '<div class="svc-grid">'+ rel.map(function(r){ return tile("build.html?s="+r.slugKey, catBy(r.cat).title, r.title, r.clue, r.status!=="live"); }).join('') +'</div>';
      html += '</div></div></section>';
    }

    /* 7 — BOTTOM CTA */
    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke center wide reveal">';
    html += '<span class="eyebrow">Where this could go for you</span>';
    html += '<h2 class="statement">This may feel complicated.<span class="accent">We know how to simplify it.</span></h2>';
    html += ctaBlock(cta);
    var pn = '<div class="prevnext">';
    pn += prev ? '<a href="build.html?s='+s.prev+'">&larr; '+e(prev.title)+'</a>' : '<span></span>';
    pn += next ? '<a href="build.html?s='+s.next+'">'+e(next.title)+' &rarr;</a>' : '<span></span>';
    pn += '</div>';
    html += pn + '</div></div></section>';
    root.innerHTML = html;
  }

  function renderCategory(slug){
    var cat = catBy(slug); if(!cat){ return renderWorlds(); }
    setMeta(cat.title+" — What We Build — Day One MVP™", cat.promise);
    var html = '';
    html += '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
    html += crumb([{t:"What We Build",h:"what-we-build.html"},{t:cat.title}]);
    html += '<span class="eyebrow">World '+e(cat.n)+'</span>';
    html += '<h1 class="mega" style="font-size:clamp(36px,6vw,76px);">'+e(cat.title)+'</h1>';
    html += '<p class="support hero-q">'+e(cat.promise)+'</p>';
    html += '<div class="cta-row"><a href="start.html?path='+cat.slug+'" class="btn btn-primary">Tell Jack the Idea →</a></div>';
    html += '</div></div></header>';

    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    html += '<span class="eyebrow">The Learning Map</span><h2>Tap any piece to learn what it is.</h2>';
    if(cat.mission) html += '<p class="support">'+e(cat.mission)+'</p>';
    html += '<div class="svc-grid">';
    cat.order.forEach(function(slug,i){
      var s = D.services[slug];
      var num = (i+1<10?'0':'')+(i+1);
      if(s && s.status==="live") html += tile("build.html?s="+slug, num, s.title, s.clue, false);
      else { // dev tile: show humanized title from slug
        var t = slug.replace(/-/g," ").replace(/\b\w/g,function(m){return m.toUpperCase();});
        html += tile("", num, t, (window.BUILD_DEV_CLUES&&window.BUILD_DEV_CLUES[cat.slug])||"Deep-dive page coming soon.", true);
      }
    });
    html += '</div></div></div></section>';

    var nx = catBy(cat.next);
    if(nx){
      html += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke center reveal">';
      html += '<span class="eyebrow">Next World</span><h2 class="statement">'+e(cat.title)+' done.<span class="accent">Now '+e(nx.title)+'.</span></h2>';
      html += '<div class="cta-row" style="justify-content:center;"><a href="build.html?cat='+nx.slug+'" class="btn btn-primary">Enter '+e(nx.title)+' →</a><a href="what-we-build.html" class="btn btn-ghost-light">All Six Worlds</a></div>';
      html += '</div></div></section>';
    }
    root.innerHTML = html;
  }

  function renderWorlds(){
    setMeta("What We Build — Day One MVP™","The six worlds of building a company with Day One MVP™.");
    var html = '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
    html += crumb([{t:"What We Build"}]);
    html += '<span class="eyebrow">The Six Worlds</span><h1 class="mega" style="font-size:clamp(38px,6.4vw,80px);">Enter the Build.</h1>';
    html += '<p class="support hero-q">Every part of building a company — as a place you can explore.</p></div></div></header>';
    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal"><div class="svc-grid">';
    html += D.categories.map(function(c){ return tile("build.html?cat="+c.slug, "World "+c.n, c.title, c.theme, false); }).join('');
    html += '</div></div></div></section>';
    root.innerHTML = html;
  }

  // attach slugKey to services for related tiles
  Object.keys(D.services).forEach(function(k){ D.services[k].slugKey = k; });

  if (sSlug) renderService(sSlug);
  else if (cSlug) renderCategory(cSlug);
  else renderWorlds();
})();
