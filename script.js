// The G Code™ — V3 · interaction layer (kept light)

// nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// mobile menu
const toggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (toggle && navLinks) {
  const setOpen = (open) => {
    toggle.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));
  // close after tapping a link
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

// accordion (Phase 7) — single-open behavior
document.querySelectorAll('.acc-head').forEach((head) => {
  head.addEventListener('click', () => {
    const body = head.nextElementSibling;
    const isOpen = head.getAttribute('aria-expanded') === 'true';
    // close siblings
    document.querySelectorAll('.acc-head').forEach((h) => {
      h.setAttribute('aria-expanded', 'false');
      h.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      head.setAttribute('aria-expanded', 'true');
      body.classList.add('open');
    }
  });
});

// tabs — each .tabs group switches independently
document.querySelectorAll('.tabs').forEach((group) => {
  const btns = group.querySelectorAll('.tab-btn');
  const panels = group.querySelectorAll('.tab-panel');
  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      if (panels[i]) panels[i].classList.add('active');
    });
  });
});

// idea-submission form → opens email to Jack (temporary; upgrade to backend later)
const ideaForm = document.getElementById('ideaForm');
if (ideaForm) {
  ideaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = encodeURIComponent(ideaForm.name.value.trim());
    const email = encodeURIComponent(ideaForm.email.value.trim());
    const idea = ideaForm.idea.value.trim();
    const stage = ideaForm.stage.value;
    const subject = encodeURIComponent('New idea — ' + ideaForm.name.value.trim());
    const body = encodeURIComponent(
      'Name: ' + ideaForm.name.value.trim() +
      '\nEmail: ' + ideaForm.email.value.trim() +
      '\nStage: ' + stage +
      '\n\nThe idea:\n' + idea
    );
    window.location.href = 'mailto:jack@dayonemvp.com?subject=' + subject + '&body=' + body;
  });
}

// scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Comprehensive intake form (start.html): prefill "describes you" from ?path=,
// build a detailed email to Jack, then send to the success page.
(function () {
  var f = document.getElementById('startForm');
  if (!f) return;
  var path = new URLSearchParams(location.search).get('path');
  if (path) {
    var sel = document.getElementById('f-describes');
    if (sel) {
      var pl = path.toLowerCase();
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase().indexOf(pl) > -1) { sel.selectedIndex = i; break; }
      }
    }
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var parts = [];
    f.querySelectorAll('.field').forEach(function (fl) {
      var lab = fl.querySelector('label');
      var ctl = fl.querySelector('input, select, textarea');
      if (lab && ctl && (ctl.value || '').trim()) parts.push(lab.textContent.trim() + ': ' + ctl.value.trim());
    });
    var nm = (f.querySelector('[name=name]') || { value: '' }).value.trim();
    var plain = 'NEW INQUIRY VIA DAYONEMVP.COM\n\n' + parts.join('\n\n');
    var subj = encodeURIComponent('New Day One MVP inquiry — ' + (nm || 'someone'));
    var body = encodeURIComponent(plain);
    // Reliability: copy the full inquiry to the clipboard so a lead is never lost
    // even if the device has no mail client configured. (Then open mail + confirm.)
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('To: jack@dayonemvp.com\n\n' + plain); } catch (err) {}
    window.location.href = 'mailto:jack@dayonemvp.com?subject=' + subj + '&body=' + body;
    setTimeout(function () { window.location.href = 'success.html'; }, 900);
  });
})();

// Mark the current page in the nav (dot indicator, esp. on the mobile menu)
(function () {
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // map sub-pages to their parent nav item
  var parent = {
    'build.html': 'what-we-build.html', 'what-we-build.html': 'what-we-build.html',
    'tier.html': 'pricing.html', 'pricing.html': 'pricing.html',
    'success.html': 'start.html', 'start.html': 'start.html',
    'marketing-launch.html': 'what-we-build.html'
  };
  var target = parent[here] || here;
  var links = document.querySelectorAll('.nav-links a');
  for (var i = 0; i < links.length; i++) {
    var hrefFile = (links[i].getAttribute('href') || '').split('?')[0].split('#')[0].split('/').pop().toLowerCase();
    if (hrefFile && hrefFile === target) {
      links[i].classList.add('current');
      links[i].setAttribute('aria-current', 'page');
    }
  }
})();

// Floating "Speak to a Human" call button — injected on every page
(function () {
  if (document.querySelector('.call-fab')) return;
  var a = document.createElement('a');
  a.className = 'call-fab';
  a.href = 'tel:+15189126142';
  a.setAttribute('aria-label', 'Call Day One MVP — speak to a human, 518 912 6142');
  a.innerHTML = '<img src="assets/img/call-button.png" alt="Speak to a human — call 518 912 6142" />';
  (document.getElementById('nav') || document.body).appendChild(a);
})();
