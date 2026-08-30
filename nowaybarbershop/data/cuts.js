/* NO WAY BARBERSHOP — THE NO WAY CUT SYSTEM™
   ============================================
   The core product. Every cut carries a permanent SKU (NWB-###). A customer
   taps a photo, gets the number, and that number travels all the way through:
   the URL, the style ticket, Jose's email, and eventually "give me NWB-014
   again."

   SKU RULES
   · Format is NWB-### and a SKU is PERMANENT once published — social captions,
     QR codes and printed cards point at it forever. Retire a cut with
     active:false. Never renumber, never recycle a SKU.
   · The slug is shared across both languages, so /en/cuts/low-taper-fade and
     /es/cortes/low-taper-fade are the same cut. That keeps the language
     switcher, hreflang and SKU shortlinks all pointing at one thing.

   PRICING
   · Cuts carry NO price. They reference a service id and inherit its price and
     duration from data/services.js. One correction fixes every surface.

   ⚠ SEED CATALOG — NOT YET CONFIRMED BY JOSE
   These are standard barbershop styles with working bilingual names, built so
   the system is real and testable on day one. Jose confirms which cuts he
   actually offers, what he calls them, and the Spanish wording he uses with
   his own customers. Edit here; the pages regenerate.

   ⚠ PHOTOS
   photoPending:true means no photograph exists yet, so the card renders a
   clearly-labelled placeholder. We do NOT ship invented or AI-generated
   haircut imagery — a barbershop's photos are its proof of work, and faking
   them would misrepresent Jose's craft. Drop the real files in at
   assets/media/cuts/<SKU>/ and flip the flag. */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.CUTS = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CATEGORIES = [
    { id: "fade",    name_en: "Fades",    name_es: "Desvanecidos" },
    { id: "taper",   name_en: "Tapers",   name_es: "Tapers" },
    { id: "classic", name_en: "Classic",  name_es: "Clásicos" },
    { id: "design",  name_en: "Designs",  name_es: "Diseños" },
    { id: "beard",   name_en: "Beard",    name_es: "Barba" },
    { id: "kids",    name_en: "Kids",     name_es: "Niños" }
  ];

  /* Every cut gets the standard add-on set unless it says otherwise. */
  var STD = ["beard", "eyebrows", "enhancement", "wash"];

  var CUTS = [
    {
      sku: "NWB-001", slug: "low-taper-fade", category: "fade", serviceId: "haircut",
      name_en: "Low Taper Fade",
      name_es: "Desvanecido Bajo",
      description_en: "The everyday one. Short around the ears and neckline, blending up gradually so there's no hard line anywhere. Keeps whatever length you want on top. If you're not sure what to ask for, this is usually it.",
      description_es: "El de todos los días. Corto alrededor de las orejas y la nuca, subiendo poco a poco para que no quede ninguna línea marcada. Arriba te queda el largo que quieras. Si no sabes qué pedir, casi siempre es este.",
      featured: true, sortOrder: 10
    },
    {
      sku: "NWB-002", slug: "mid-fade", category: "fade", serviceId: "haircut",
      name_en: "Mid Fade",
      name_es: "Desvanecido Medio",
      description_en: "The fade starts around the temple — halfway up the side. Sharper and more noticeable than a low fade, still works anywhere you need to show up.",
      description_es: "El desvanecido empieza a la altura de la sien, a media cabeza. Más marcado y más visible que el bajo, pero sigue sirviendo para donde tengas que presentarte.",
      featured: true, sortOrder: 20
    },
    {
      sku: "NWB-003", slug: "high-fade", category: "fade", serviceId: "haircut",
      name_en: "High Fade",
      name_es: "Desvanecido Alto",
      description_en: "Fade starts up near the top corner of the head. Big contrast between the sides and whatever you're keeping on top. Bold — you'll notice it in the mirror.",
      description_es: "El desvanecido arranca cerca de la esquina alta de la cabeza. Mucho contraste entre los lados y lo que dejes arriba. Es fuerte — lo vas a notar en el espejo.",
      featured: false, sortOrder: 30
    },
    {
      sku: "NWB-004", slug: "skin-fade", category: "fade", serviceId: "haircut",
      name_en: "Skin Fade / Bald Fade",
      name_es: "Desvanecido a la Piel",
      description_en: "Taken all the way down to the skin at the bottom, then blended up. The cleanest, sharpest version of a fade. Grows out faster, so plan on coming back sooner.",
      description_es: "Bajado hasta la piel en la parte de abajo y luego difuminado hacia arriba. La versión más limpia y marcada del desvanecido. Crece más rápido, así que cuenta con volver antes.",
      featured: true, sortOrder: 40
    },
    {
      sku: "NWB-005", slug: "burst-fade", category: "fade", serviceId: "haircut",
      name_en: "Burst Fade",
      name_es: "Burst Fade",
      description_en: "The fade curves around the ear like a fan instead of running straight across. Leaves weight in the back. Popular with mullets, mohawks and longer-in-the-back styles.",
      description_es: "El desvanecido se abre en curva alrededor de la oreja, como un abanico, en vez de ir recto. Deja peso atrás. Se usa mucho con mullets, mohawks y estilos largos por detrás.",
      featured: false, sortOrder: 50
    },
    {
      sku: "NWB-006", slug: "classic-taper", category: "taper", serviceId: "haircut",
      name_en: "Classic Taper",
      name_es: "Taper Clásico",
      description_en: "Just the edges brought down — sideburns and neckline tightened, everything else left alone. Conservative and low-maintenance. Good if your job wants you looking neat, not cut.",
      description_es: "Solo los bordes recogidos — patillas y nuca ajustadas, y el resto se queda igual. Discreto y fácil de mantener. Bueno si en tu trabajo quieren verte arreglado, no rapado.",
      featured: false, sortOrder: 60
    },
    {
      sku: "NWB-007", slug: "tape-up", category: "taper", serviceId: "tape-up",
      name_en: "Tape Up",
      name_es: "Tape Up",
      description_en: "A tight, straight line across the back of the neck with the sides tapered clean. Quick in-and-out to sharpen up a cut that's still holding.",
      description_es: "Una línea recta y bien ajustada en la nuca, con los lados difuminados y limpios. Rápido, para refrescar un corte que todavía aguanta.",
      featured: false, sortOrder: 70,
      addons: ["beard", "eyebrows", "enhancement"]
    },
    {
      sku: "NWB-008", slug: "line-up", category: "design", serviceId: "tape-up",
      name_en: "Line Up / Edge Up",
      name_es: "Perfilado",
      description_en: "The hairline squared off with a razor — front, temples and edges made crisp. Often added to another cut, but you can come in just for this.",
      description_es: "La línea del cabello marcada a navaja — frente, sienes y bordes bien definidos. Normalmente va con otro corte, pero puedes venir solo por esto.",
      featured: false, sortOrder: 80,
      addons: ["beard", "eyebrows", "enhancement"]
    },
    {
      sku: "NWB-009", slug: "buzz-cut", category: "classic", serviceId: "haircut",
      name_en: "Buzz Cut",
      name_es: "Rapado a Máquina",
      description_en: "One guard all over, edges cleaned up. Simple, fast, and honest. Tell us the number you like or we'll help you pick one.",
      description_es: "Una sola guía en toda la cabeza, con los bordes limpios. Simple, rápido y sin vueltas. Dinos el número que te gusta o te ayudamos a elegirlo.",
      featured: false, sortOrder: 90
    },
    {
      sku: "NWB-010", slug: "crew-cut", category: "classic", serviceId: "haircut",
      name_en: "Crew Cut",
      name_es: "Corte Crew",
      description_en: "Short and tapered on the sides, a little length left on top that gets shorter toward the back. The classic that never stopped working.",
      description_es: "Corto y difuminado en los lados, con algo de largo arriba que se va acortando hacia atrás. El clásico que nunca dejó de funcionar.",
      featured: false, sortOrder: 100
    },
    {
      sku: "NWB-011", slug: "scissor-cut", category: "classic", serviceId: "haircut",
      name_en: "Scissor Cut",
      name_es: "Corte a Tijera",
      description_en: "All scissors, no clippers. Keeps more length and a softer shape throughout. Takes longer and it's worth it if you're growing your hair out.",
      description_es: "Todo a tijera, sin máquina. Conserva más largo y una forma más suave en todo. Toma más tiempo y vale la pena si te estás dejando crecer el pelo.",
      featured: false, sortOrder: 110
    },
    {
      sku: "NWB-012", slug: "curly-top-taper", category: "taper", serviceId: "haircut",
      name_en: "Curly Top with Taper",
      name_es: "Rizos Arriba con Taper",
      description_en: "Curls kept full and shaped on top, sides tapered down clean. Cut so the curl pattern still sits right when it dries. Say the word if you want more length left up there.",
      description_es: "Los rizos se quedan con volumen y bien formados arriba, y los lados difuminados y limpios. Cortado para que el rizo caiga bien cuando se seque. Avísanos si quieres dejar más largo arriba.",
      featured: true, sortOrder: 120
    },
    {
      sku: "NWB-013", slug: "hair-design", category: "design", serviceId: "haircut",
      name_en: "Hair Design",
      name_es: "Diseño en el Cabello",
      description_en: "Lines, parts or freestyle work cut into the fade. Bring a picture or let Jose freestyle it — tell him in the notes which way you want to go.",
      description_es: "Líneas, particiones o diseño libre marcados en el desvanecido. Trae una foto o deja que Jose lo haga a su manera — dile en las notas por dónde quieres ir.",
      featured: false, sortOrder: 130
    },
    {
      sku: "NWB-014", slug: "beard-sculpt", category: "beard", serviceId: "beard",
      name_en: "Beard Sculpt",
      name_es: "Perfilado de Barba",
      description_en: "Beard shaped, cheek and neck lines set, everything evened out. Hot towel finish. Book it on its own or add it to any cut.",
      description_es: "Barba con forma, líneas de mejilla y cuello marcadas, y todo emparejado. Terminado con toalla caliente. Resérvalo solo o agrégalo a cualquier corte.",
      featured: false, sortOrder: 140,
      addons: ["eyebrows", "wash"]
    },
    {
      sku: "NWB-015", slug: "kids-cut", category: "kids", serviceId: "kids",
      name_en: "Kids Cut (12 & Under)",
      name_es: "Corte para Niños (12 o menos)",
      description_en: "Any of the styles above, sized down and done at a kid's pace. First haircut? Say so in the notes and we'll take our time with them.",
      description_es: "Cualquiera de los estilos de arriba, adaptado y hecho al ritmo del niño. ¿Es su primer corte? Dínoslo en las notas y nos tomamos el tiempo con él.",
      featured: true, sortOrder: 150,
      addons: ["eyebrows", "wash"]
    }
  ];

  /* Fill in the defaults every cut shares so the entries above stay readable
     and nobody has to remember to repeat boilerplate when adding a cut. */
  CUTS.forEach(function (c) {
    c.active = c.active !== false;
    c.photoPending = c.photoPending !== false;   // no real photography yet
    c.addons = c.addons || STD;
    c.video = c.video || null;
    var dir = "/assets/media/cuts/" + c.sku + "/";
    c.heroImage = dir + c.sku + "-hero.webp";
    c.images = {
      front: dir + c.sku + "-front.webp",
      left:  dir + c.sku + "-left.webp",
      right: dir + c.sku + "-right.webp",
      back:  dir + c.sku + "-back.webp"
    };
  });

  function bySku(sku) {
    if (!sku) return null;
    var up = String(sku).toUpperCase();
    for (var i = 0; i < CUTS.length; i++) if (CUTS[i].sku === up) return CUTS[i];
    return null;
  }
  function bySlug(slug) {
    for (var i = 0; i < CUTS.length; i++) if (CUTS[i].slug === slug) return CUTS[i];
    return null;
  }
  function active() {
    return CUTS.filter(function (c) { return c.active; })
               .sort(function (a, b) { return a.sortOrder - b.sortOrder; });
  }
  function featured() {
    return active().filter(function (c) { return c.featured; });
  }
  /* Only categories that actually contain a live cut — never render an empty
     filter chip (Thor §20). */
  function usedCategories() {
    var live = active();
    return CATEGORIES.filter(function (cat) {
      return live.some(function (c) { return c.category === cat.id; });
    });
  }

  return {
    CUTS: CUTS, CATEGORIES: CATEGORIES,
    bySku: bySku, bySlug: bySlug,
    active: active, featured: featured, usedCategories: usedCategories
  };
});
