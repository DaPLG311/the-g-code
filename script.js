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

// Post-submit confirm UI — injected next to the submit button (CSP-safe: built
// here in script.js, no inline JS in the HTML). Replaces the old blind 900ms
// redirect to success.html so the visitor confirms the email actually went out.
function showSendConfirm(form, copied) {
  var old = form.querySelector('.send-confirm');
  if (old) old.parentNode.removeChild(old);
  var box = document.createElement('div');
  box.className = 'send-confirm';
  box.setAttribute('role', 'status');
  box.style.cssText = 'margin-top:14px;padding:14px 18px;border:1px solid rgba(200,168,106,.4);border-radius:10px;background:rgba(200,168,106,.07);color:#E7E8EA;font-size:15px;line-height:1.65;';
  box.innerHTML =
    '<p style="margin:0;">Your email app should have opened with your message' +
    (copied ? ' (also copied to your clipboard)' : '') +
    '. If nothing opened: email <a href="mailto:jack@dayonemvp.com" style="color:var(--champagne-2);">jack@dayonemvp.com</a> or text <a href="tel:+15189126142" style="color:var(--champagne-2);">(518)&nbsp;912-6142</a>.</p>' +
    '<p style="margin:10px 0 0;"><a href="success.html" style="color:var(--champagne-2);font-weight:600;">I sent it &rarr;</a></p>';
  var btn = form.querySelector('button[type=submit]');
  if (btn && btn.parentNode) btn.parentNode.insertBefore(box, btn.nextSibling);
  else form.appendChild(box);
  return box;
}

// idea-submission form → opens email to Jack (temporary; upgrade to backend later)
const ideaForm = document.getElementById('ideaForm');
if (ideaForm) {
  ideaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const get = (n) => { const el = ideaForm.querySelector('[name=' + n + ']'); return el ? el.value.trim() : ''; };
    const nm = get('name');
    const convo = get('conversation');
    const plain =
      'NEW INQUIRY VIA DAYONEMVP.COM\n\n' +
      'Name: ' + nm +
      '\nEmail: ' + get('email') +
      (convo ? '\nWants: ' + convo : '') +
      '\nStage: ' + get('stage') +
      '\n\nThe idea:\n' + get('idea');
    const subject = encodeURIComponent('New Day One MVP inquiry — ' + (nm || 'someone'));
    const body = encodeURIComponent(plain);
    // Reliability: never lose a lead even with no mail client — copy to clipboard, then open mail + confirm.
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('To: jack@dayonemvp.com\n\n' + plain); } catch (err) {}
    window.location.href = 'mailto:jack@dayonemvp.com?subject=' + subject + '&body=' + body;
    setTimeout(function () { window.location.href = 'success.html'; }, 900);
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
    var pl = path.toLowerCase();
    var LABELS = {
      'idea-session': 'Idea Session', 'blueprint': 'Blueprint & Prototype', 'working-alpha': 'Working Alpha',
      'mvp-launch': 'MVP Launch', 'platform': 'Platform Launch', 'small-business': 'Mom-and-Pop / Small-Business rate',
      'partner': 'Partnership', 'fit-call': 'Free Fit Call', 'operated-call': 'Operated Call™',
      'training': 'Private Training', 'project-review': 'Project Review',
      'start-the-company': 'Start the Company', 'build-the-product': 'Build the Product',
      'install-the-systems': 'Install the Systems', 'grow-the-business': 'Grow the Business',
      'train-the-people': 'Train the People', 'produce-the-media': 'Produce the Media'
    };
    var sel = document.getElementById('f-describes');
    if (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase().indexOf(pl) > -1) { sel.selectedIndex = i; break; }
      }
      if (pl === 'small-business') { for (var s = 0; s < sel.options.length; s++) { if (/own a business/i.test(sel.options[s].text)) { sel.selectedIndex = s; break; } } }
    }
    // Map every intent path to the conversation-type selector
    var conv = document.getElementById('f-conversation');
    if (conv) {
      var map = {
        'fit-call': 'fit', 'fit': 'fit', 'small-business': 'fit',
        'operated-call': 'operated', 'idea-session': 'operated', 'blueprint': 'operated',
        'working-alpha': 'operated', 'mvp-launch': 'operated', 'platform': 'operated',
        'training': 'training', 'review': 'review', 'project-review': 'review'
      };
      var key = map[pl];
      if (key) {
        for (var j = 0; j < conv.options.length; j++) {
          if (conv.options[j].text.toLowerCase().indexOf(key) > -1) { conv.selectedIndex = j; break; }
        }
      }
    }
    // Capture the exact interest into the optional referral field so nothing is lost
    var ref = document.getElementById('f-referral');
    if (ref && !ref.value) { ref.value = 'Interested in: ' + (LABELS[pl] || path); }
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

// Nav dropdowns — bind the static .nav-dd tabs (click toggles; CSS handles desktop hover)
(function () {
  var dds = document.querySelectorAll('.nav-dd');
  if (!dds.length) return;
  function closeAll(except) {
    for (var i = 0; i < dds.length; i++) {
      if (dds[i] === except) continue;
      dds[i].classList.remove('open');
      var b = dds[i].querySelector('.nav-dd-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
  }
  for (var i = 0; i < dds.length; i++) {
    (function (dd) {
      var btn = dd.querySelector('.nav-dd-btn');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = dd.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) closeAll(dd);
      });
    })(dds[i]);
  }
  // click outside / Escape closes any open panel
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.nav-dd')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

// Mobile menu height — measure the real offset (langbar + nav) so accordions always fit + scroll
(function () {
  var links = document.getElementById('navLinks');
  if (!links) return;
  function fit() {
    if (window.innerWidth > 900) { links.style.removeProperty('max-height'); return; }
    var top = links.getBoundingClientRect().top;
    links.style.maxHeight = Math.max(240, Math.round(window.innerHeight - top - 12)) + 'px';
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  var mt = document.getElementById('menuToggle');
  if (mt) mt.addEventListener('click', function () { setTimeout(fit, 0); });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.nav-dd-btn')) setTimeout(fit, 0);
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
