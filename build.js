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
  // merge category-hub content (hero question, explanation, problems, etc.)
  if (window.BUILD_CAT_EXT) D.categories.forEach(function (c) {
    var x = window.BUILD_CAT_EXT[c.slug]; if (x) Object.keys(x).forEach(function (k) { c[k] = x[k]; });
  });
  var p = new URLSearchParams(location.search);
  var sSlug = p.get("s"), cSlug = p.get("cat");
  var catBy = function (s) { return D.categories.filter(function (c) { return c.slug === s; })[0]; };

  // Primary action per page: product builds push the MVP CTA; everything else
  // pushes the founder conversation. Calm-giant voice, one primary action.
  function primaryCTA(catSlug){
    if (catSlug === "build-the-product") return {
      label: "Book an Operated Call™",
      href: "start.html?path=" + catSlug,
      sub: "A working session with the operator to scope the right first version — no handoff, no sales layer."
    };
    return {
      label: "Book an Operated Call™",
      href: "start.html?path=" + catSlug,
      sub: "Founder-led from the first conversation — speak directly with the operator shaping the work."
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

  // per-view structured data (JSON-LD data block — exempt from script-src CSP)
  function injectLD(graph){
    try { var sc=document.createElement('script'); sc.type='application/ld+json';
      sc.text=JSON.stringify({ "@context":"https://schema.org", "@graph":graph });
      document.head.appendChild(sc); } catch(e){}
  }
  var ORG = { "@type":"Organization", "name":"Day One MVP", "url":"https://dayonemvp.com/" };

  function renderService(slug){
    var s = D.services[slug]; if(!s){ return renderWorlds(); }
    var cat = catBy(s.cat);
    var cta = primaryCTA(cat.slug);
    setMeta(s.title+" — Day One MVP™", s.definition);
    var purl = "https://dayonemvp.com/build.html?s="+slug;
    injectLD([
      {"@type":"WebPage","@id":purl+"#webpage","url":purl,"name":s.title+" — Day One MVP™","description":s.definition,"isPartOf":{"@id":"https://dayonemvp.com/#website"},"breadcrumb":{"@id":purl+"#bc"}},
      {"@type":"Service","name":s.title,"description":s.definition,"category":cat.title,"provider":ORG,"url":purl},
      {"@type":"BreadcrumbList","@id":purl+"#bc","itemListElement":[
        {"@type":"ListItem","position":1,"name":"What We Build","item":"https://dayonemvp.com/what-we-build.html"},
        {"@type":"ListItem","position":2,"name":cat.title,"item":"https://dayonemvp.com/build.html?cat="+cat.slug},
        {"@type":"ListItem","position":3,"name":s.title}
      ]}
    ]);
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
      html += '<div class="svc-grid" data-elroy=\"swipe\">'+ rel.map(function(r){ return tile("build.html?s="+r.slugKey, catBy(r.cat).title, r.title, r.clue, r.status!=="live"); }).join('') +'</div>';
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
    if (window.DOM_AUTOLINK) window.DOM_AUTOLINK(root);
  }

  function renderCategory(slug){
    var cat = catBy(slug); if(!cat){ return renderWorlds(); }
    var ctaLabel = cat.ctaLabel || "Book an Operated Call™";
    setMeta(cat.title+" — What We Build — Day One MVP™", cat.explanation || cat.promise);
    var curl = "https://dayonemvp.com/build.html?cat="+slug;
    injectLD([
      {"@type":"CollectionPage","@id":curl+"#webpage","url":curl,"name":cat.title+" — What We Build — Day One MVP™","description":cat.explanation||cat.promise,"isPartOf":{"@id":"https://dayonemvp.com/#website"},"breadcrumb":{"@id":curl+"#bc"}},
      {"@type":"ItemList","itemListElement":cat.order.map(function(sl,i){ var sv=D.services[sl]; return {"@type":"ListItem","position":i+1,"name":(sv&&sv.title)||sl,"url":"https://dayonemvp.com/build.html?s="+sl}; })},
      {"@type":"BreadcrumbList","@id":curl+"#bc","itemListElement":[
        {"@type":"ListItem","position":1,"name":"What We Build","item":"https://dayonemvp.com/what-we-build.html"},
        {"@type":"ListItem","position":2,"name":cat.title}
      ]}
    ]);
    var html = '';

    /* Hero — the human question */
    html += '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
    html += crumb([{t:"What We Build",h:"what-we-build.html"},{t:cat.title}]);
    html += '<span class="eyebrow">World '+e(cat.n)+' · '+e(cat.title)+'</span>';
    html += '<h1 class="mega" style="font-size:clamp(30px,5vw,60px);">'+e(cat.heroQuestion || cat.promise)+'</h1>';
    html += '<div class="cta-row"><a href="start.html?path='+cat.slug+'" class="btn btn-primary">'+e(ctaLabel)+' &rarr;</a></div>';
    html += '</div></div></header>';

    /* What this is + research card */
    if(cat.explanation || cat.research){
      html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
      if(cat.explanation) html += '<p class="support lead-p">'+e(cat.explanation)+'</p>';
      if(cat.research) html += '<div class="kv kv-note"><h3>'+e(cat.research.title)+'</h3><p>'+e(cat.research.body)+'</p></div>';
      if(cat.note) html += '<div class="kv kv-note"><h3>'+e(cat.note.title)+'</h3><p>'+e(cat.note.body)+'</p></div>';
      html += '</div></div></section>';
    }

    /* Problems this solves */
    if(cat.problems && cat.problems.length){
      html += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke wide reveal">';
      html += '<span class="eyebrow">Sound familiar?</span><h2>What this solves.</h2>';
      html += '<ul class="prob-list">'+ cat.problems.map(function(p){return '<li>'+e(p)+'</li>';}).join('') +'</ul>';
      html += '</div></div></section>';
    }

    /* Learning map (the topic tiles) */
    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal">';
    html += '<span class="eyebrow">The Learning Map</span><h2>Tap any <a class="hlink" href="tech-answers.html">building block</a> to learn what it is.</h2>';
    if(cat.mission) html += '<p class="support">'+e(cat.mission)+'</p>';
    html += '<div class="svc-grid" data-elroy=\"swipe\">';
    cat.order.forEach(function(slug,i){
      var s = D.services[slug];
      var num = (i+1<10?'0':'')+(i+1);
      if(s && s.status==="live") html += tile("build.html?s="+slug, num, s.title, s.clue, false);
      else {
        var t = slug.replace(/-/g," ").replace(/\b\w/g,function(m){return m.toUpperCase();});
        html += tile("", num, t, (window.BUILD_DEV_CLUES&&window.BUILD_DEV_CLUES[cat.slug])||"Deep-dive page coming soon.", true);
      }
    });
    html += '</div>';
    if(cat.principle) html += '<p class="principle">'+e(cat.principle)+'</p>';
    if(cat.jackQuestion) html += '<blockquote class="pull">"'+e(cat.jackQuestion)+'"<span class="pull-by">— Jack Rodriguez</span></blockquote>';
    html += '<div class="cta-row"><a href="start.html?path='+cat.slug+'" class="btn btn-primary">'+e(ctaLabel)+' &rarr;</a></div>';
    html += '</div></div></section>';

    var nx = catBy(cat.next);
    if(nx){
      html += '<section class="overlay-sec spotlight"><div class="wrap"><div class="smoke center reveal">';
      html += '<span class="eyebrow">Next World</span><h2 class="statement">'+e(cat.title)+' done.<span class="accent">Now '+e(nx.title)+'.</span></h2>';
      html += '<div class="cta-row" style="justify-content:center;"><a href="build.html?cat='+nx.slug+'" class="btn btn-primary">Enter '+e(nx.title)+' →</a><a href="what-we-build.html" class="btn btn-ghost-light">All Six Worlds</a></div>';
      html += '</div></div></section>';
    }
    root.innerHTML = html;
    if (window.DOM_AUTOLINK) window.DOM_AUTOLINK(root);
  }

  function renderWorlds(){
    setMeta("What We Build — Day One MVP™","The six worlds of building a company with Day One MVP™.");
    var html = '<header class="page-hero"><div class="wrap"><div class="smoke wide">';
    html += crumb([{t:"What We Build"}]);
    html += '<span class="eyebrow">The Six Worlds</span><h1 class="mega" style="font-size:clamp(38px,6.4vw,80px);">Enter the Build.</h1>';
    html += '<p class="support hero-q">Every part of building a company — as a place you can explore.</p></div></div></header>';
    html += '<section class="overlay-sec"><div class="wrap"><div class="smoke wide reveal"><div class="svc-grid" data-elroy=\"swipe\">';
    html += D.categories.map(function(c){ return tile("build.html?cat="+c.slug, "World "+c.n, c.title, c.theme, false); }).join('');
    html += '</div></div></div></section>';
    root.innerHTML = html;
    if (window.DOM_AUTOLINK) window.DOM_AUTOLINK(root);
  }

  // attach slugKey to services for related tiles
  Object.keys(D.services).forEach(function(k){ D.services[k].slugKey = k; });

  if (sSlug) renderService(sSlug);
  else if (cSlug) renderCategory(cSlug);
  else renderWorlds();
})();
