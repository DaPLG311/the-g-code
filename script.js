// The G Code™ — V3 · interaction layer (Loki-polished, kept light)

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
    var subj = encodeURIComponent('New Day One MVP inquiry — ' + (nm || 'someone'));
    var body = encodeURIComponent('NEW INQUIRY VIA DAYONEMVP.COM\n\n' + parts.join('\n\n'));
    window.location.href = 'mailto:jack@dayonemvp.com?subject=' + subj + '&body=' + body;
    setTimeout(function () { window.location.href = 'success.html'; }, 800);
  });
})();
