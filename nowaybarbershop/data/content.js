/* NO WAY BARBERSHOP — content hub.

   The website feeds the content and the content feeds the website. A clip shows
   a cut, the caption says "ask for NWB-004", and that link lands on the exact
   cut page with a Select button on it. That loop is why cutSku exists below.

   SERIES are the recurring formats. They ship defined and visible so the shape
   of the channel is set before the first upload — but ITEMS is empty until
   real footage exists. We do not stage fake video cards.

   TO ENABLE: add entries to ITEMS. Anything with a real videoUrl renders. */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.CONTENT = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SERIES = [
    {
      id: "no-way-jose",
      name_en: "No Way Jose",
      name_es: "No Way Jose",
      description_en: "The stuff you can't script. Real reactions, real shop talk.",
      description_es: "Lo que no se puede guionar. Reacciones reales, conversación real de barbería."
    },
    {
      id: "what-did-he-ask-for",
      name_en: "What Did He Ask For?",
      name_es: "¿Qué Pidió?",
      description_en: "You hear the consultation. You guess the cut. Then the reveal.",
      description_es: "Escuchas la consulta. Adivinas el corte. Después, el resultado."
    },
    {
      id: "no-way-transformations",
      name_en: "No Way Transformations",
      name_es: "Transformaciones No Way",
      description_en: "Before, cut, reveal. The strongest ones we've got.",
      description_es: "Antes, corte, resultado. Los más fuertes que tenemos."
    },
    {
      id: "jose-explains-it",
      name_en: "Jose Explains It",
      name_es: "Jose Te Explica",
      description_en: "Twenty seconds of barber education. What a fade actually is, and why yours grew out like that.",
      description_es: "Veinte segundos de educación de barbero. Qué es realmente un desvanecido, y por qué el tuyo creció así."
    },
    {
      id: "que-corte-quieres",
      name_en: "¿Qué Corte Quieres?",
      name_es: "¿Qué Corte Quieres?",
      description_en: "Jose names the styles in Spanish, so you can walk in knowing exactly what to ask for.",
      description_es: "Jose nombra los estilos en español, para que llegues sabiendo exactamente qué pedir."
    },
    {
      id: "troy-in-the-chair",
      name_en: "Troy in the Chair",
      name_es: "Troy en la Silla",
      description_en: "Local business owners, regulars and neighborhood characters, one cut at a time.",
      description_es: "Dueños de negocios locales, clientes de siempre y personajes del barrio, un corte a la vez."
    },
    {
      id: "cut-of-the-week",
      name_en: "Cut of the Week",
      name_es: "Corte de la Semana",
      description_en: "One No Way number, featured. This is NWB-014 — want it? Tap the link.",
      description_es: "Un número No Way, destacado. Este es el NWB-014 — ¿lo quieres? Toca el enlace."
    }
  ];

  /* Shape:
     {
       slug, title_en, title_es,
       series: "<series id>",
       type: "reel" | "short" | "tiktok" | "long",
       language: "en" | "es" | "bilingual",
       videoUrl, thumbnail,
       cutSku: "NWB-004" | null,   // links the clip straight to its cut page
       publishedAt: "2026-01-01",
       active: true
     }
  */
  var ITEMS = [];

  function active() {
    return ITEMS.filter(function (i) { return i.active && i.videoUrl; })
                .sort(function (a, b) { return String(b.publishedAt).localeCompare(String(a.publishedAt)); });
  }
  function seriesById(id) {
    for (var i = 0; i < SERIES.length; i++) if (SERIES[i].id === id) return SERIES[i];
    return null;
  }

  return { SERIES: SERIES, ITEMS: ITEMS, active: active, seriesById: seriesById };
});
