/* NO WAY BARBERSHOP — the style ticket flow.
   PHOTO -> SKU -> OPTIONS -> CUSTOMER -> TICKET -> EMAIL JOSE -> BOOKSY

   Every state is covered: empty (no cut picked), idle, sending, success, error.
   No dead buttons and no silent failures — if the ticket does not reach Jose we
   say so plainly and hand over the shop's phone number instead of pretending. */
(function () {
  "use strict";

  var NW = window.NW = window.NW || {};

  var els = {};
  var sending = false;
  var submitted = false;

  function $(id) { return document.getElementById(id); }
  function show(el, on) { if (el) el.hidden = !on; }

  function t(key) {
    var d = (window.NW_I18N || {});
    return d[key] || "";
  }

  /* ---------- render the chosen cut ---------- */
  function renderCut(cut) {
    if (!els.summary) return;
    var img = cut.image
      ? '<img src="' + esc(cut.image) + '" alt="" width="72" height="90" loading="lazy" />'
      : '<div class="nw-ph" style="position:relative;aspect-ratio:4/5;"><span class="nw-ph-mark">NO WAY</span></div>';

    els.summary.innerHTML =
      '<div style="display:flex;gap:14px;align-items:flex-start;">' +
        '<div style="flex:none;width:72px;border:1px solid var(--nw-line);border-radius:4px;overflow:hidden;">' + img + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<span class="nw-sku">' + esc(cut.sku) + '</span>' +
          '<h3 style="margin:8px 0 4px;font-size:19px;">' + esc(cut.name) + '</h3>' +
          '<p class="nw-card-meta" style="margin:0;">' + esc([cut.service, cut.price, cut.duration].filter(Boolean).join(" · ")) + '</p>' +
        '</div>' +
      '</div>';
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---------- validation (server re-validates; this is just fast feedback) ---------- */
  function setError(input, msg) {
    if (!input) return false;
    var box = document.getElementById(input.id + "Err");
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      if (box) { box.textContent = msg; box.hidden = false; }
      return false;
    }
    input.removeAttribute("aria-invalid");
    if (box) { box.textContent = ""; box.hidden = true; }
    return true;
  }

  function validate() {
    var ok = true;
    if (!els.name.value.trim()) ok = setError(els.name, t("required")) && ok;
    else ok = setError(els.name, null) && ok;

    var digits = els.phone.value.replace(/\D/g, "");
    if (!els.phone.value.trim()) ok = setError(els.phone, t("required")) && ok;
    else if (digits.length < 10 || digits.length > 15) ok = setError(els.phone, t("invalidPhone")) && ok;
    else ok = setError(els.phone, null) && ok;

    var email = els.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) ok = setError(els.email, t("invalidEmail")) && ok;
    else ok = setError(els.email, null) && ok;

    if (els.notes.value.length > 600) ok = setError(els.notes, t("tooLong")) && ok;
    else ok = setError(els.notes, null) && ok;

    return ok;
  }

  function selectedAddons() {
    var out = [];
    var boxes = document.querySelectorAll("[data-nw-addon]:checked");
    for (var i = 0; i < boxes.length; i++) out.push(boxes[i].getAttribute("data-nw-addon"));
    return out;
  }

  /* ---------- states ---------- */
  function toState(name, data) {
    show(els.formWrap, name === "idle");
    show(els.sendingBox, name === "sending");
    show(els.successBox, name === "success");
    show(els.errorBox, name === "error");
    show(els.emptyBox, name === "empty");

    if (name === "success" && data) {
      if (els.code) els.code.textContent = data.ticketCode;
      if (els.booksy && data.bookingUrl) els.booksy.href = data.bookingUrl;
      /* Move focus so a screen reader lands on the outcome, not the top. */
      if (els.successBox) { els.successBox.setAttribute("tabindex", "-1"); els.successBox.focus(); }
    }
    if (name === "error" && els.errorBox) {
      els.errorBox.setAttribute("tabindex", "-1"); els.errorBox.focus();
    }
  }

  /* ---------- submit ---------- */
  function submit(e) {
    e.preventDefault();
    if (sending || submitted) return;          /* duplicate-submit guard */
    if (!validate()) {
      var bad = els.formWrap.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }

    var cut = NW.getCut();
    if (!cut || !cut.sku) { toState("empty"); return; }

    var addons = selectedAddons();
    sending = true;
    els.submitBtn.disabled = true;
    toState("sending");
    NW.track("style_ticket_submit", { sku: cut.sku, locale: NW.locale, addons: addons.length });

    var payload = {
      sku: cut.sku,
      addons: addons,
      name: els.name.value.trim(),
      phone: els.phone.value.trim(),
      email: els.email.value.trim(),
      notes: els.notes.value.trim(),
      locale: (els.formWrap.querySelector('[name="prefLang"]:checked') || {}).value || NW.locale,
      website: els.hp ? els.hp.value : "",           /* honeypot: must stay empty */
      startedAt: Number(els.startedAt && els.startedAt.value) || 0
    };

    fetch("/api/style-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (body) { return { ok: res.ok, status: res.status, body: body }; });
      })
      .then(function (r) {
        sending = false;
        els.submitBtn.disabled = false;

        if (!r.ok || !r.body || !r.body.ticketCode) {
          /* Field errors from the server get surfaced on the fields themselves. */
          if (r.body && r.body.fields) {
            Object.keys(r.body.fields).forEach(function (f) {
              if (els[f]) setError(els[f], r.body.fields[f]);
            });
            toState("idle");
            var bad = els.formWrap.querySelector('[aria-invalid="true"]');
            if (bad) bad.focus();
            return;
          }
          throw new Error("ticket_failed");
        }

        submitted = true;
        cut.ticketCode = r.body.ticketCode;
        cut.addons = addons;
        NW.setCut(cut);                              /* survives the Booksy trip */

        /* The server tells us whether Jose was actually notified. If email is
           not configured we do NOT claim it was sent. */
        if (els.notified) {
          els.notified.hidden = r.body.notified !== false;
        }

        NW.track("style_ticket_created", { sku: cut.sku, locale: payload.locale, ticket: r.body.ticketCode });
        toState("success", { ticketCode: r.body.ticketCode, bookingUrl: r.body.bookingUrl });
      })
      .catch(function () {
        sending = false;
        els.submitBtn.disabled = false;
        NW.track("style_ticket_failed", { sku: cut.sku, locale: NW.locale });
        toState("error");
      });
  }

  /* ---------- init ---------- */
  function init() {
    els.formWrap   = $("nwTicketForm");
    if (!els.formWrap) return;                        /* not the booking page */

    els.summary    = $("nwCutSummary");
    els.sendingBox = $("nwTicketSending");
    els.successBox = $("nwTicketSuccess");
    els.errorBox   = $("nwTicketError");
    els.emptyBox   = $("nwTicketEmpty");
    els.code       = $("nwTicketCode");
    els.booksy     = $("nwBooksyCta");
    els.notified   = $("nwNotNotified");
    els.submitBtn  = $("nwSubmit");
    els.name       = $("nwName");
    els.phone      = $("nwPhone");
    els.email      = $("nwEmail");
    els.notes      = $("nwNotes");
    els.hp         = $("nwWebsite");
    els.startedAt  = $("nwStartedAt");

    if (els.startedAt) els.startedAt.value = String(Date.now());

    var cut = NW.getCut();
    if (!cut || !cut.sku) { toState("empty"); return; }

    renderCut(cut);
    toState("idle");
    NW.track("booking_started", { sku: cut.sku, locale: NW.locale });

    els.formWrap.addEventListener("submit", submit);

    var retry = $("nwRetry");
    if (retry) retry.addEventListener("click", function () { toState("idle"); });

    document.addEventListener("change", function (e) {
      var el = e.target;
      if (el && el.hasAttribute && el.hasAttribute("data-nw-addon") && el.checked) {
        NW.track("addon_selected", { addon: el.getAttribute("data-nw-addon"), locale: NW.locale });
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
