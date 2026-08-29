/* NO WAY BARBERSHOP — bilingual copy + route map.

   This is real internationalization, not an overlay. Both languages are written
   into actual static HTML at generation time, so /en/ and /es/ are genuine URLs
   with their own metadata — never one DOM with a dictionary swapped over it.

   ROUTES is the single place the EN<->ES page pairing is defined. The language
   switcher and the hreflang tags are both generated from it, so they can never
   drift apart.

   NOTE: Spanish here is written, not machine-translated. It should still get a
   fluent human review before launch (Thor §50). */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.COPY = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* key -> { en: path, es: path }. Cut detail pages are appended by gen-cuts.js. */
  var ROUTES = {
    home:     { en: "/en/",         es: "/es/" },
    cuts:     { en: "/en/cuts",     es: "/es/cortes" },
    book:     { en: "/en/book",     es: "/es/reservar" },
    gallery:  { en: "/en/gallery",  es: "/es/galeria" },
    jose:     { en: "/en/jose",     es: "/es/jose" },
    content:  { en: "/en/content",  es: "/es/contenido" },
    contact:  { en: "/en/contact",  es: "/es/contacto" },
    policies: { en: "/en/policies", es: "/es/politicas" }
  };

  var T = {
    en: {
      localeName: "English",
      otherLocaleName: "Español",
      switchTo: "Ver en español",

      nav: {
        cuts: "Cuts", book: "Book", gallery: "Gallery",
        jose: "Jose", content: "Content", contact: "Contact",
        menu: "Menu", skip: "Skip to content", home: "No Way Barbershop home"
      },

      hero: {
        eyebrow: "Troy, New York",
        line1: "NO WAY",
        line2: "BARBERSHOP",
        headline: "See the cut.<br />Book the cut.",
        sub: "Know what you want when you see it? Pick the picture and we'll handle the rest. No barber vocabulary required.",
        cta1: "Pick Your Cut",
        cta2: "Book Now",
        scroll: "See the cuts"
      },

      pick: {
        kicker: "The No Way Cut System",
        title: "Pick your look",
        sub: "Every cut has a number. Tap the one you want, add what you need, and Jose gets the whole ticket before you sit down."
      },

      how: {
        kicker: "How it works",
        title: "Three taps and you're in the chair",
        steps: [
          { n: "01", t: "Pick the look", d: "Scroll the cuts. Tap the one that looks right. No need to know what it's called — that's our job." },
          { n: "02", t: "Choose your options", d: "Beard, eyebrows, wash, enhancement. Add a note if there's something Jose should know." },
          { n: "03", t: "Book Jose", d: "You get a cut number. Jose gets the full ticket. Then you pick your time on Booksy." }
        ]
      },

      jose: {
        kicker: "The man in the chair",
        title: "Jose",
        lead: "Owner, barber, and the loudest laugh in the building.",
        body: "Jose has been cutting on 112th Street long enough that half the shop walks in already talking. English, Spanish, whatever you're comfortable in — you'll get an actual conversation about your hair, not a rushed guess.",
        cta: "More about Jose"
      },

      gallery: { kicker: "The work", title: "Fresh out the chair", sub: "Real cuts from the shop." },

      content: {
        kicker: "No Way Content",
        title: "Straight from the shop",
        sub: "Transformations, barber tips, and whatever Jose says next — in English and Spanish."
      },

      location: {
        kicker: "Find us",
        title: "112th Street, Troy",
        directions: "Get directions",
        call: "Call the shop",
        hoursTitle: "Hours",
        hoursFallback: "Live availability is on Booksy — that's where the real calendar lives.",
        hoursCta: "Check availability"
      },

      reviews: { kicker: "What people say", title: "From the chair" },

      cta: {
        kicker: "Ready?",
        title: "Pick your cut. We'll do the rest.",
        sub: "Takes about a minute.",
        button: "Pick Your Cut",
        book: "Book Now",
        call: "Call 518-238-5037"
      },

      cuts: {
        title: "Cuts",
        metaTitle: "Cuts — pick your look",
        metaDesc: "Browse every cut at No Way Barbershop in Troy, NY. Tap the photo you like, get its cut number, and book it. No barber vocabulary required.",
        intro: "Tap the cut you want. Every one has a No Way number — that's all you need to tell us.",
        filterAll: "All cuts",
        select: "Select this cut",
        view: "See this cut",
        from: "From",
        minutes: "min",
        sku: "Cut No.",
        empty: "No cuts in this category yet.",
        photoPending: "Photo coming soon",
        photoPendingNote: "We're shooting this cut in the shop. The style, number and timing are real — the photo lands after the next session.",
        angles: { hero: "Main", front: "Front", left: "Left", right: "Right", back: "Back" },
        addons: "Add to this cut",
        alsoLike: "Also popular",
        backToCuts: "All cuts",
        shareTitle: "Ask for this cut",
        shareBody: "Tell Jose the number, or send this link to whoever needs it."
      },

      book: {
        title: "Book your cut",
        metaTitle: "Book your cut",
        metaDesc: "Send Jose your exact cut, your add-ons and your notes — then pick your time. No Way Barbershop, Troy NY. English and Spanish.",
        step1: "Your cut",
        step2: "Add-ons",
        step3: "Your info",
        step4: "Send it",
        noCut: "You haven't picked a cut yet.",
        noCutCta: "Pick your cut first",
        change: "Change cut",
        name: "Your name",
        namePh: "First and last",
        phone: "Phone",
        phonePh: "518-555-0100",
        email: "Email (optional)",
        emailPh: "you@example.com",
        notes: "Anything Jose should know?",
        notesPh: "Keep the curls longer on top, going to a wedding Saturday, etc.",
        notesHint: "Optional. Max 600 characters.",
        lang: "I'd rather talk in",
        submit: "Send my cut to Jose",
        sending: "Sending your ticket…",
        successTitle: "Jose has your cut.",
        successBody: "Here's your ticket number. Last step: pick your time on Booksy — that's where Jose's real calendar lives.",
        successTicket: "Your ticket",
        successNotBooked: "Heads up: this is not an appointment yet. You're booked once you pick a time on Booksy.",
        successCta: "Pick my time on Booksy",
        errorTitle: "That didn't send.",
        errorBody: "Your cut is saved — nothing's lost. Try again, or just call the shop and tell Jose your cut number.",
        retry: "Try again",
        required: "Required",
        invalidPhone: "Please enter a valid phone number.",
        invalidEmail: "Please enter a valid email address.",
        tooLong: "That's a bit too long.",
        bookingTitle: "Pick your time",
        bookingBody: "Booksy runs Jose's calendar, reminders and confirmations. Your cut details are already with him.",
        bookingCta: "Open Booksy",
        bookingFallback: "Booking trouble? Call the shop at 518-238-5037 and give Jose your cut number."
      },

      addons: { none: "No add-ons", title: "Add-ons" },

      footer: {
        tagline: "Fresh cuts. Good people.",
        navTitle: "Go",
        contactTitle: "Reach us",
        legalTitle: "Legal",
        privacy: "Privacy",
        terms: "Terms",
        accessibility: "Accessibility",
        rights: "All rights reserved.",
        built: "Built by Day One MVP"
      },

      misc: {
        seedNotice: "Prices start from the amounts shown and are confirmed when you book.",
        langLabel: "Language",
        loading: "Loading…",
        close: "Close"
      }
    },

    es: {
      localeName: "Español",
      otherLocaleName: "English",
      switchTo: "View in English",

      nav: {
        cuts: "Cortes", book: "Reservar", gallery: "Galería",
        jose: "Jose", content: "Contenido", contact: "Contacto",
        menu: "Menú", skip: "Ir al contenido", home: "Inicio de No Way Barbershop"
      },

      hero: {
        eyebrow: "Troy, Nueva York",
        line1: "NO WAY",
        line2: "BARBERSHOP",
        headline: "Mira el corte.<br />Reserva tu cita.",
        sub: "¿Ves el estilo que quieres? Elige la foto y nosotros hacemos el resto. No hace falta saber cómo se llama.",
        cta1: "Elige tu corte",
        cta2: "Reserva ahora",
        scroll: "Ver los cortes"
      },

      pick: {
        kicker: "El sistema No Way",
        title: "Elige tu estilo",
        sub: "Cada corte tiene su número. Toca el que quieres, agrega lo que necesites, y Jose recibe todo antes de que te sientes."
      },

      how: {
        kicker: "Cómo funciona",
        title: "Tres toques y estás en la silla",
        steps: [
          { n: "01", t: "Elige el estilo", d: "Mira los cortes. Toca el que te guste. No necesitas saber el nombre — de eso nos encargamos nosotros." },
          { n: "02", t: "Elige tus opciones", d: "Barba, cejas, lavado, enhancement. Deja una nota si hay algo que Jose deba saber." },
          { n: "03", t: "Reserva con Jose", d: "Recibes tu número de corte. Jose recibe todos los detalles. Después eliges tu hora en Booksy." }
        ]
      },

      jose: {
        kicker: "El hombre de la silla",
        title: "Jose",
        lead: "Dueño, barbero, y la risa más fuerte del local.",
        body: "Jose lleva cortando en la 112th Street el tiempo suficiente para que medio barrio entre hablando. En inglés, en español, como te sientas cómodo — vas a tener una conversación de verdad sobre tu pelo, no una adivinanza apurada.",
        cta: "Conoce a Jose"
      },

      gallery: { kicker: "El trabajo", title: "Recién salido de la silla", sub: "Cortes reales de la barbería." },

      content: {
        kicker: "Contenido No Way",
        title: "Directo de la barbería",
        sub: "Transformaciones, consejos de barbero, y lo próximo que diga Jose — en inglés y en español."
      },

      location: {
        kicker: "Encuéntranos",
        title: "112th Street, Troy",
        directions: "Cómo llegar",
        call: "Llama a la barbería",
        hoursTitle: "Horario",
        hoursFallback: "La disponibilidad en vivo está en Booksy — ahí vive el calendario real.",
        hoursCta: "Ver disponibilidad"
      },

      reviews: { kicker: "Lo que dicen", title: "Desde la silla" },

      cta: {
        kicker: "¿Listo?",
        title: "Elige tu corte. Nosotros hacemos el resto.",
        sub: "Te toma como un minuto.",
        button: "Elige tu corte",
        book: "Reserva ahora",
        call: "Llama al 518-238-5037"
      },

      cuts: {
        title: "Cortes",
        metaTitle: "Cortes — elige tu estilo",
        metaDesc: "Mira todos los cortes de No Way Barbershop en Troy, NY. Toca la foto que te guste, obtén tu número de corte y reserva. No necesitas saber el nombre.",
        intro: "Toca el corte que quieres. Cada uno tiene su número No Way — eso es todo lo que tienes que decirnos.",
        filterAll: "Todos los cortes",
        select: "Elegir este corte",
        view: "Ver este corte",
        from: "Desde",
        minutes: "min",
        sku: "Corte N.º",
        empty: "Todavía no hay cortes en esta categoría.",
        photoPending: "Foto en camino",
        photoPendingNote: "Estamos fotografiando este corte en la barbería. El estilo, el número y el tiempo son reales — la foto llega después de la próxima sesión.",
        angles: { hero: "Principal", front: "Frente", left: "Izquierda", right: "Derecha", back: "Atrás" },
        addons: "Agrega a este corte",
        alsoLike: "También populares",
        backToCuts: "Todos los cortes",
        shareTitle: "Pide este corte",
        shareBody: "Dile el número a Jose, o manda este enlace a quien lo necesite."
      },

      book: {
        title: "Reserva tu corte",
        metaTitle: "Reserva tu corte",
        metaDesc: "Envía a Jose tu corte exacto, tus extras y tus notas — después elige tu hora. No Way Barbershop, Troy NY. En inglés y español.",
        step1: "Tu corte",
        step2: "Extras",
        step3: "Tus datos",
        step4: "Envíalo",
        noCut: "Todavía no has elegido un corte.",
        noCutCta: "Elige tu corte primero",
        change: "Cambiar corte",
        name: "Tu nombre",
        namePh: "Nombre y apellido",
        phone: "Teléfono",
        phonePh: "518-555-0100",
        email: "Correo (opcional)",
        emailPh: "tu@ejemplo.com",
        notes: "¿Algo que Jose deba saber?",
        notesPh: "Deja los rizos más largos arriba, tengo una boda el sábado, etc.",
        notesHint: "Opcional. Máximo 600 caracteres.",
        lang: "Prefiero hablar en",
        submit: "Enviar mi corte a Jose",
        sending: "Enviando tu ticket…",
        successTitle: "Jose ya tiene tu corte.",
        successBody: "Aquí está tu número de ticket. Último paso: elige tu hora en Booksy — ahí vive el calendario real de Jose.",
        successTicket: "Tu ticket",
        successNotBooked: "Ojo: esto todavía no es una cita. Quedas reservado cuando elijas tu hora en Booksy.",
        successCta: "Elegir mi hora en Booksy",
        errorTitle: "No se pudo enviar.",
        errorBody: "Tu corte está guardado — no se perdió nada. Intenta otra vez, o llama a la barbería y dile a Jose tu número de corte.",
        retry: "Intentar de nuevo",
        required: "Obligatorio",
        invalidPhone: "Escribe un número de teléfono válido.",
        invalidEmail: "Escribe un correo electrónico válido.",
        tooLong: "Eso es un poco largo.",
        bookingTitle: "Elige tu hora",
        bookingBody: "Booksy maneja el calendario, los recordatorios y las confirmaciones de Jose. Los detalles de tu corte ya están con él.",
        bookingCta: "Abrir Booksy",
        bookingFallback: "¿Problemas para reservar? Llama al 518-238-5037 y dile a Jose tu número de corte."
      },

      addons: { none: "Sin extras", title: "Extras" },

      footer: {
        tagline: "Buenos cortes. Buena gente.",
        navTitle: "Ir a",
        contactTitle: "Contáctanos",
        legalTitle: "Legal",
        privacy: "Privacidad",
        terms: "Términos",
        accessibility: "Accesibilidad",
        rights: "Todos los derechos reservados.",
        built: "Construido por Day One MVP"
      },

      misc: {
        seedNotice: "Los precios empiezan desde las cantidades mostradas y se confirman al reservar.",
        langLabel: "Idioma",
        loading: "Cargando…",
        close: "Cerrar"
      }
    }
  };

  return { ROUTES: ROUTES, T: T };
});
