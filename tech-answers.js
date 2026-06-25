/* Tech Answers board — search, filter, accordions, related links, URL state.
   Data comes from glossary.js (window.GLOSSARY). No external libraries. */
(function () {
  var data = (window.GLOSSARY || []).slice().sort(function (a, b) {
    return a.t.toLowerCase().localeCompare(b.t.toLowerCase());
  });
  var categories = [];
  data.forEach(function (x) { if (categories.indexOf(x.c) === -1) categories.push(x.c); });

  var elSearch = document.getElementById('boardSearch');
  var elFilters = document.getElementById('boardFilters');
  var elList = document.getElementById('termList');
  var elCount = document.getElementById('boardCount');
  var elEmpty = document.getElementById('boardEmpty');
  if (!elList) return;

  var state = { q: '', cat: 'All', all: false };
  var SHOW_LIMIT = 10;
  var FEATURED = ["MVP","Website","Web Application","CRM","Prototype","Landing Page","Dashboard","Automation","Domain","API","Hosting","Onboarding"];

  // build filter chips
  function chip(label) {
    var b = document.createElement('button');
    b.className = 'fchip' + (label === state.cat ? ' active' : '');
    b.type = 'button';
    b.textContent = label;
    b.setAttribute('aria-pressed', label === state.cat ? 'true' : 'false');
    b.addEventListener('click', function () { state.cat = label; state.all = false; syncURL(); render(); });
    return b;
  }
  function buildFilters() {
    elFilters.innerHTML = '';
    elFilters.appendChild(chip('All'));
    categories.forEach(function (c) { elFilters.appendChild(chip(c)); });
  }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  function matches(x) {
    if (state.cat !== 'All' && x.c !== state.cat) return false;
    if (!state.q) return true;
    var hay = (x.t + ' ' + x.d + ' ' + (x.ex || '') + ' ' + (x.m || '') + ' ' + x.c).toLowerCase();
    return hay.indexOf(state.q.toLowerCase()) !== -1;
  }

  function termCard(x) {
    var el = document.createElement('div');
    el.className = 'term';
    el.id = 'term-' + slug(x.t);
    var fields = '';
    if (x.m) fields += '<div class="field"><span class="lbl">What it means for you</span><p>' + esc(x.m) + '</p></div>';
    if (x.ex) fields += '<div class="field"><span class="lbl">Plain-language example</span><p>' + esc(x.ex) + '</p></div>';
    if (x.w) fields += '<div class="field"><span class="lbl">Where this appears in your build</span><p>' + esc(x.w) + '</p></div>';
    var related = '';
    if (x.r && x.r.length) {
      related = '<div class="related">' + x.r.map(function (r) {
        return '<a data-term="' + esc(r) + '" href="#term-' + slug(r) + '">' + esc(r) + '</a>';
      }).join('') + '</div>';
    }
    el.innerHTML =
      '<button class="term-head" aria-expanded="false">' +
        '<span class="t">' + esc(x.t) + '</span>' +
        '<span style="display:flex;align-items:center;gap:14px;">' +
          '<span class="cat">' + esc(x.c) + '</span><span class="ic">+</span>' +
        '</span>' +
      '</button>' +
      '<div class="term-body"><div class="inner"><p>' + esc(x.d) + '</p>' + fields + related + '</div></div>';

    var head = el.querySelector('.term-head');
    var body = el.querySelector('.term-body');
    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', open ? 'false' : 'true');
      body.classList.toggle('open', !open);
      el.classList.toggle('open', !open);
    });
    // related-term navigation
    el.querySelectorAll('.related a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openTerm(a.getAttribute('data-term'));
      });
    });
    return el;
  }

  function render() {
    // reflect active chip
    Array.prototype.forEach.call(elFilters.querySelectorAll('.fchip'), function (c) {
      var on = c.textContent === state.cat;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    elList.innerHTML = '';
    var shown = data.filter(matches);
    // "browsing" = no search, no category filter, not expanded → show a short curated set
    var browsing = (!state.q && state.cat === 'All' && !state.all);
    var toRender = shown;
    if (browsing) {
      var feat = [];
      FEATURED.forEach(function (name) {
        var hit = shown.filter(function (x) { return x.t === name; })[0];
        if (hit) feat.push(hit);
      });
      var rest = shown.filter(function (x) { return feat.indexOf(x) === -1; });
      toRender = feat.concat(rest).slice(0, SHOW_LIMIT);
    }
    toRender.forEach(function (x) { elList.appendChild(termCard(x)); });
    if (browsing && shown.length > toRender.length) {
      var more = document.createElement('button');
      more.className = 'board-showall';
      more.type = 'button';
      more.textContent = 'Show all ' + shown.length + ' terms →';
      more.addEventListener('click', function () { state.all = true; render(); });
      elList.appendChild(more);
    }
    elCount.textContent = browsing
      ? ('Showing ' + toRender.length + ' of ' + data.length + ' terms — search or filter for more')
      : (shown.length + ' of ' + data.length + ' terms' +
        (state.cat !== 'All' ? ' · ' + state.cat : '') + (state.q ? ' · “' + state.q + '”' : ''));
    elEmpty.hidden = shown.length !== 0;
  }

  // open a specific term: clear filters, search it, expand, scroll
  function openTerm(name) {
    state.cat = 'All';
    state.q = '';
    state.all = true; // show full list so the target term is rendered (not hidden behind the 10-term preview)
    if (elSearch) elSearch.value = '';
    render();
    var node = document.getElementById('term-' + slug(name));
    if (node) {
      var head = node.querySelector('.term-head');
      var body = node.querySelector('.term-body');
      head.setAttribute('aria-expanded', 'true');
      body.classList.add('open'); node.classList.add('open');
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    syncURL();
  }

  // URL query support (?q= and ?cat=)
  function syncURL() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cat && state.cat !== 'All') p.set('cat', state.cat);
    var qs = p.toString();
    history.replaceState(null, '', qs ? ('?' + qs + '#board') : (location.pathname + '#board'));
  }
  function readURL() {
    var p = new URLSearchParams(location.search);
    if (p.get('q')) { state.q = p.get('q'); if (elSearch) elSearch.value = state.q; }
    if (p.get('cat') && categories.indexOf(p.get('cat')) !== -1) state.cat = p.get('cat');
  }

  var t;
  if (elSearch) elSearch.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = elSearch.value.trim(); syncURL(); render(); }, 120);
  });

  buildFilters();
  readURL();
  render();
})();
