import type { Locale, LevelKey, ConditionKey, TitleStatusKey } from "@/lib/hdm";

/**
 * Todo el texto de interfaz vive aquí. Nada de copy suelto en los
 * componentes: si aparece una frase nueva, se agrega en los dos idiomas
 * y TypeScript avisa si falta uno.
 */

const es = {
  meta: {
    homeTitle: "Hi Desert Motors | Autos usados con calificación clara",
    homeDescription:
      "Vehículos usados en Hesperia, California, con una calificación del 60 al 100 basada en condición, millas, año, historial y precio de mercado.",
    carDescription:
      "{name} en Hi Desert Motors, Hesperia. Ficha completa con calificación HDM, millas, historial y contacto directo por WhatsApp.",
  },

  nav: {
    tagline: "Compra y vende sin sorpresas.",
    inventory: "Ver inventario",
    publish: "Publica tu auto",
    whatsapp: "Escribir por WhatsApp",
    switchTo: "English",
  },

  hero: {
    pill: "Calificación HDM",
    titleTop: "Encuentra el auto correcto.",
    titleAccent: "Sin adivinar.",
    lead: "Cada vehículo recibe una calificación del 60 al 100 según su condición, millas, año, historial y precio contra el mercado.",
    meterLabel: "Nivel de los anuncios",
    boardNotice:
      "Hi Desert Motors es un tablero de anuncios. No compramos, vendemos ni intermediamos: cada auto lo publica su dueño y tú tratas directamente con él. No inspeccionamos los vehículos.",
    best: "Mejor evaluado del inventario",
    points: "puntos",
  },

  levels: {
    good_option: "Buena opción",
    good_deal: "Buen trato",
    great_buy: "Muy buena compra",
    best_option: "Mejor opción",
  } satisfies Record<LevelKey, string>,

  conditions: {
    excelente: "Excelente",
    muy_bueno: "Muy bueno",
    bueno: "Bueno",
    regular: "Regular",
    malo: "Malo",
  } satisfies Record<ConditionKey, string>,

  titles: {
    clean: "Limpio",
    rebuilt: "Reconstruido",
    salvage: "Salvage",
  } satisfies Record<TitleStatusKey, string>,

  vehicle: {
    featured: "Auto destacado",
    sheet: "Ficha del vehículo",
    details: "Ver detalles",
    ask: "Pedir información",
    sold: "Vendido",
    soldBadge: "VENDIDO",
    soldNotice: "ESTE VEHÍCULO YA FUE VENDIDO",
    unavailable: "No disponible",
    scoreCaption: "Calificación HDM sobre 100",
    declaredCaption: "Según lo declarado por el vendedor",
    contactSeller: "Contactar al vendedor",
    sellerSays: "Lo que dice el vendedor",
    soldBy: "Publicado por {name}",
    whatsappMessage: "Hola, me interesa el {name}",
    contactWhatsapp: "Contactar por WhatsApp",
    mainWhatsapp: "WhatsApp principal",
    back: "Volver al inventario",
    notFound: "Auto no encontrado",
  },

  specs: {
    year: "Año",
    miles: "Millas",
    title: "Título",
    owners: "Dueños",
    city: "Ubicación",
    bodyType: "Carrocería",
    fuelType: "Combustible",
    transmission: "Transmisión",
    published: "Publicado",
    expires: "Vence en",
    daysLeft: "{n} días",
    oneDayLeft: "1 día",
    lastDay: "Último día",
    today: "hoy",
    yesterday: "ayer",
    daysAgo: "hace {n} días",
    accidents: "Accidentes",
    condition: "Condición",
  },

  share: {
    title: "Compartir vehículo",
    copy: "Copiar link",
    copied: "Link copiado: {name}",
    copyShort: "Link copiado",
    copyError: "No se pudo copiar el link",
    viaWhatsapp: "Compartir por WhatsApp",
    viaFacebook: "Compartir en Facebook",
    viaLink: "Copiar link del vehículo",
  },

  gallery: {
    prev: "Imagen anterior",
    next: "Imagen siguiente",
    go: "Ver imagen {n}",
    close: "Cerrar",
  },

  inventory: {
    kicker: "Inventario",
    title: "Vehículos calificados automáticamente",
    sortLabel: "Ordenar por",
    makeLabel: "Marca",
    allMakes: "Todas",
    hideSold: "Ocultar vendidos",
    count: "{n} de {total} vehículos",
    empty: "No hay vehículos con esos filtros.",
    emptyTitle: "Todavía no hay anuncios",
    emptyBody:
      "Sé el primero. Publica tu auto, recibe su calificación HDM y aparece aquí.",
    reset: "Quitar filtros",
    sort: {
      score_desc: "Mejor calificación HDM",
      price_asc: "Precio: menor a mayor",
      price_desc: "Precio: mayor a menor",
      year_desc: "Año: más nuevos",
      miles_asc: "Millas: menos primero",
      name_asc: "Nombre: A-Z",
    },
  },


  why: {
    buyerKicker: "Por qué aquí",
    buyerTitle: "Compra sabiendo qué estás viendo",
    buyerLead:
      "En un anuncio normal ves fotos bonitas y un precio. Lo que le pasa al auto lo descubres cuando ya fuiste a verlo. Aquí no.",

    demoScoreLabel: "Ejemplo de calificación: 84 de 100",
    backingLabel: "Nivel de respaldo",
    backingHigh: "Alto",
    backingLow: "Bajo",

    point1Title: "Una calificación, no una corazonada",
    point1Body:
      "Cada auto recibe un número del 60 al 100, calculado con su título, millas, año, historial y estado mecánico declarado. El mismo cálculo para todos, sin favoritos.",

    point2Title: "Lo malo se ve antes de abrir",
    point2Body:
      "Si el título es Salvage, si trae el check engine encendido o si no tiene smog vigente, aparece en la tarjeta del listado. No enterrado en la descripción.",

    point3Title: "Y te decimos cuánto creerle",
    point3Body:
      "El nivel de respaldo mide cuánto de lo declarado se puede comprobar. Un vendedor que da su VIN, el smog y los registros de servicio sube; uno que solo sube fotos, no.",

    honestNote:
      "Seamos claros: no inspeccionamos ningún vehículo. La calificación se calcula con lo que declara el vendedor, quien firma que es cierto. Lo que hacemos es obligar a que esa declaración sea concreta y comparable — y enseñarte cuánto de ella está respaldada. Revisa el auto antes de pagar, siempre.",

    sellerKicker: "Vende tu auto",
    sellerTitle: "Publicar es gratis y toma cinco minutos",
    sellerLead:
      "Y ser honesto te conviene: cada documento que aportas sube tu nivel de respaldo, y los anuncios con respaldo alto son los que reciben llamadas en serio.",

    step1Title: "Llena la ficha",
    step1Body:
      "Marca lo que sí funciona y lo que no. Son casillas concretas, no un \"está en buen estado\" que no dice nada.",

    step2Title: "Mira tu calificación en vivo",
    step2Body:
      "El número se mueve mientras escribes. Vas a ver exactamente qué le suma y qué le resta a tu auto.",

    step3Title: "Lo revisamos y sale publicado",
    step3Body:
      "Ningún anuncio se publica solo. Revisamos cada uno antes de que aparezca, y el comprador te contacta directo a tu WhatsApp.",
  },

  analyze: {
    navLabel: "Analiza tu auto",
    kicker: "Diagnóstico gratis",
    title: "¿No sabes qué tienes ni en cuánto venderlo?",
    lead: "Axel revisa tu auto con los mismos criterios que aplica a todos los anuncios. Te dice qué tiene bien, qué tiene mal, y cómo se posiciona su precio. Gratis, sin publicar nada y sin dejar tus datos.",
    cta: "Analizar mi auto",
    running: "Axel está revisando…",
    again: "Analizar otro auto",

    resultTitle: "El diagnóstico de Axel",
    narrativeTitle: "Lo que Axel ve",
    priceTitle: "Dónde queda tu precio",
    priceLead: "Esto no es una tasación. Es cuánto se mueve tu precio frente a un auto igual con título limpio y en buen estado.",
    priceRange: "Entre {min}% y {max}%",
    priceVsClean: "respecto de uno equivalente sin problemas",
    priceNoAdjust: "Tu auto no tiene factores que castiguen el precio. Se puede comparar directo contra el mercado.",
    kbbTitle: "El número exacto",
    kbbBody: "Para una cifra en dólares usa Kelley Blue Book, que trabaja con transacciones reales. Aplícale el ajuste de arriba y tendrás un precio defendible.",
    kbbCta: "Consultar en KBB",

    comparablesTitle: "Autos parecidos aquí",
    comparablesEmpty: "Todavía no hay autos parecidos publicados para comparar. Conforme llegue más inventario, esta sección se va a llenar.",
    comparablesMiles: "millas",

    photosTitle: "Tus fotos",
    photoNotesTitle: "Lo que se alcanza a ver",
    photoTipsTitle: "Fotos que te faltan",
    photoDisclaimer: "Axel sólo ve lo que la foto muestra. No detecta fallas mecánicas, ni óxido bajo el auto, ni nada que la cámara no alcance. Son observaciones para revisar en persona, no un peritaje.",
    photosOptional: "Opcional. Si subes fotos, Axel también las revisa. Se reducen en tu teléfono antes de enviarse, así que no gastas datos de más.",
    photosPreparing: "Preparando fotos…",
    photosTrimmed: "Se dejaron sólo las primeras fotos: entre todas pesaban demasiado.",
    photoReadFailed: "No se pudo leer una de las fotos. Intenta con otra.",

    publishTitle: "¿Lo publicas?",
    publishBody: "Puedes publicar este auto con los mismos datos que acabas de capturar. Es gratis y toma un minuto más.",
    publishCta: "Publicar con estos datos",

    disclaimer: "El diagnóstico se calcula con lo que declaras aquí. Axel no maneja el auto ni lo inspecciona: si lo que capturas no es exacto, el resultado tampoco lo será.",
  },

  finder: {
    title: "Encuentra tu auto",
    bodyType: "Tipo",
    allBodies: "Todos",
    make: "Marca",
    allMakes: "Todas",
    city: "Ciudad",
    allCities: "Todas",
    year: "Año",
    anyYear: "Cualquiera",
    orNewer: "o más nuevo",
    maxPrice: "Precio máximo",
    noLimit: "Sin límite",
    jump: "Ver resultados",
    results: "{n} autos",
    oneResult: "1 auto",
    noResults: "Ningún auto coincide con ese filtro.",
    clear: "Quitar filtros",
  },

  seller: {
    new: "Vendedor nuevo",
    returning: "Ya ha publicado aquí",
    established: "Vendedor con historial",
    flagged: "Ha tenido anuncios retirados",
    published: "Anuncios",
    sold: "Vendidos",
    since: "Antigüedad",
    monthsShort: " m",
    note: "Este historial lo lleva el sitio con lo que ha observado. No son opiniones ni estrellas: son anuncios contados.",
  },

  axel: {
    kicker: "Conoce a Axel",
    titleTop: "Alguien tenía que revisar",
    titleAccent: "letra por letra.",
    lead: "Axel es quien califica los autos de Hi Desert Motors. No los maneja ni los inspecciona — lee lo que declara cada vendedor y lo convierte en un número que puedes comparar contra cualquier otro anuncio.",
    point1: "Cada auto pasa por el mismo cálculo. Sin favoritos, sin destacados pagados.",
    point2: "Lo que está mal aparece en la tarjeta, no escondido en la descripción.",
    point3: "Y si el vendedor no respalda lo que dice, Axel también te lo advierte.",
    alt: "Axel, el perro robot de Hi Desert Motors",
    caption: "Axel · Calificación HDM",
  },

  categories: {
    title: "Desglose de la calificación",
    lead: "Un solo número esconde de qué está hecho. Aquí ves dónde está bien y dónde no.",
    mechanical: "Mecánica",
    mechanicalCaption: "Motor, transmisión, frenos y desgaste",
    legal: "Legal y papeles",
    legalCaption: "Título, historial, smog y registro",
    electrical: "Eléctrica",
    electricalCaption: "Luces, aire, calefacción y ventanas",
    cosmetic: "Estética",
    cosmeticCaption: "Óxido, golpes, cristales e interior",
  },

  flags: {
    title_salvage: "Título Salvage",
    title_rebuilt: "Título reconstruido",
    title_lien: "Con gravamen",
    title_missing: "Sin título en mano",
    transmission: "Transmisión patina",
    overheating: "Se sobrecalienta",
    starting: "No siempre arranca",
    check_engine: "Check engine encendido",
    brakes: "Frenos irregulares",
    rust: "Tiene óxido",
    multiple_accidents: "2+ accidentes",
    high_miles: "Millaje muy alto",
    no_smog: "Sin smog vigente",
  },

  footer: {
    tagline: "Anuncios de autos usados con una calificación clara.",
    city: "Hesperia, California",
    contact: "Contacto",
    noPhoneNotice:
      "No tenemos teléfono de ventas. Cada anuncio trae el contacto directo de su vendedor. Este correo es para dudas del sitio, reportar un anuncio o solicitudes de privacidad.",
    email: "Enviar correo",
    exploreTitle: "Explorar",
    sellTitle: "Vender",
    legalTitle: "Legal",
    freeDiagnosis: "Diagnóstico gratis",
    lostLink: "Perdí mi enlace de edición",
    reportListing: "Reportar un anuncio",
    rights: "Todos los derechos reservados.",
    builtBy: "Hecho en el Alto Desierto",
    terms: "Términos de uso",
    privacy: "Aviso de privacidad",
  },
};

/** El inglés debe tener exactamente la misma forma que el español. */
type Dictionary = typeof es;

const en: Dictionary = {
  meta: {
    homeTitle: "Hi Desert Motors | Used cars with a clear rating",
    homeDescription:
      "Used vehicles in Hesperia, California, rated 60 to 100 based on condition, mileage, year, history and market price.",
    carDescription:
      "{name} at Hi Desert Motors, Hesperia. Full listing with HDM rating, mileage, history and direct WhatsApp contact.",
  },

  nav: {
    tagline: "Buy and sell with no surprises.",
    inventory: "View inventory",
    publish: "List your car",
    whatsapp: "Message us on WhatsApp",
    switchTo: "Español",
  },

  hero: {
    pill: "HDM Rating",
    titleTop: "Find the right car.",
    titleAccent: "No guesswork.",
    lead: "Every vehicle gets a 60 to 100 rating based on its condition, mileage, year, history and price against the market.",
    meterLabel: "Listings level",
    boardNotice:
      "Hi Desert Motors is a listings board. We do not buy, sell, or broker: each car is posted by its owner and you deal directly with them. We do not inspect vehicles.",
    best: "Top rated in stock",
    points: "points",
  },

  levels: {
    good_option: "Good option",
    good_deal: "Good deal",
    great_buy: "Great buy",
    best_option: "Best option",
  },

  conditions: {
    excelente: "Excellent",
    muy_bueno: "Very good",
    bueno: "Good",
    regular: "Fair",
    malo: "Poor",
  },

  titles: {
    clean: "Clean",
    rebuilt: "Rebuilt",
    salvage: "Salvage",
  },

  vehicle: {
    featured: "Featured car",
    sheet: "Vehicle listing",
    details: "View details",
    ask: "Request info",
    sold: "Sold",
    soldBadge: "SOLD",
    soldNotice: "THIS VEHICLE HAS BEEN SOLD",
    unavailable: "Unavailable",
    scoreCaption: "HDM rating out of 100",
    declaredCaption: "Based on what the seller declared",
    contactSeller: "Contact the seller",
    sellerSays: "What the seller says",
    soldBy: "Posted by {name}",
    whatsappMessage: "Hi, I'm interested in the {name}",
    contactWhatsapp: "Contact on WhatsApp",
    mainWhatsapp: "Main WhatsApp",
    back: "Back to inventory",
    notFound: "Car not found",
  },

  specs: {
    year: "Year",
    miles: "Miles",
    title: "Title",
    owners: "Owners",
    city: "Location",
    bodyType: "Body",
    fuelType: "Fuel",
    transmission: "Transmission",
    published: "Posted",
    expires: "Expires in",
    daysLeft: "{n} days",
    oneDayLeft: "1 day",
    lastDay: "Last day",
    today: "today",
    yesterday: "yesterday",
    daysAgo: "{n} days ago",
    accidents: "Accidents",
    condition: "Condition",
  },

  share: {
    title: "Share this vehicle",
    copy: "Copy link",
    copied: "Link copied: {name}",
    copyShort: "Link copied",
    copyError: "Couldn't copy the link",
    viaWhatsapp: "Share on WhatsApp",
    viaFacebook: "Share on Facebook",
    viaLink: "Copy vehicle link",
  },

  gallery: {
    prev: "Previous image",
    next: "Next image",
    go: "View image {n}",
    close: "Close",
  },

  inventory: {
    kicker: "Inventory",
    title: "Vehicles rated automatically",
    sortLabel: "Sort by",
    makeLabel: "Make",
    allMakes: "All",
    hideSold: "Hide sold",
    count: "{n} of {total} vehicles",
    empty: "No vehicles match those filters.",
    emptyTitle: "No listings yet",
    emptyBody:
      "Be the first. List your car, get its HDM rating, and appear here.",
    reset: "Clear filters",
    sort: {
      score_desc: "Best HDM rating",
      price_asc: "Price: low to high",
      price_desc: "Price: high to low",
      year_desc: "Year: newest first",
      miles_asc: "Miles: lowest first",
      name_asc: "Name: A-Z",
    },
  },


  why: {
    buyerKicker: "Why here",
    buyerTitle: "Buy knowing what you're looking at",
    buyerLead:
      "A normal listing gives you nice photos and a price. Whatever is wrong with the car, you find out after you've driven out to see it. Not here.",

    demoScoreLabel: "Example rating: 84 out of 100",
    backingLabel: "Backing level",
    backingHigh: "High",
    backingLow: "Low",

    point1Title: "A rating, not a hunch",
    point1Body:
      "Every car gets a number from 60 to 100, calculated from its title, mileage, year, history and declared mechanical condition. Same math for everyone, no favorites.",

    point2Title: "The bad news shows up first",
    point2Body:
      "Salvage title, check engine light on, no current smog — it appears on the listing card. Not buried in the description.",

    point3Title: "And we tell you how much to trust it",
    point3Body:
      "The backing level measures how much of the declaration can be verified. A seller who provides their VIN, smog and service records scores higher; one who only uploads photos does not.",

    honestNote:
      "Let's be clear: we do not inspect any vehicle. The rating is calculated from what the seller declares, and they sign that it is true. What we do is force that declaration to be specific and comparable — and show you how much of it is backed up. Always inspect the car before you pay.",

    sellerKicker: "Sell your car",
    sellerTitle: "Listing is free and takes five minutes",
    sellerLead:
      "And honesty pays: every document you provide raises your backing level, and listings with high backing are the ones that get serious calls.",

    step1Title: "Fill in the details",
    step1Body:
      'Check what works and what doesn\'t. Specific boxes, not a vague "in good condition" that tells nobody anything.',

    step2Title: "Watch your rating live",
    step2Body:
      "The number moves as you type. You'll see exactly what helps and what hurts your car.",

    step3Title: "We review it and it goes live",
    step3Body:
      "No listing publishes itself. We review each one before it appears, and buyers contact you directly on your WhatsApp.",
  },

  analyze: {
    navLabel: "Analyze your car",
    kicker: "Free diagnosis",
    title: "Not sure what you have, or what to ask for it?",
    lead: "Axel reviews your car with the same criteria he applies to every listing. He tells you what is good, what is not, and where your price sits. Free, without posting anything and without leaving your details.",
    cta: "Analyze my car",
    running: "Axel is checking…",
    again: "Analyze another car",

    resultTitle: "Axel's diagnosis",
    narrativeTitle: "What Axel sees",
    priceTitle: "Where your price sits",
    priceLead: "This is not an appraisal. It is how much your price moves against the same car with a clean title and in good shape.",
    priceRange: "Between {min}% and {max}%",
    priceVsClean: "compared to an equivalent with no issues",
    priceNoAdjust: "Your car has no factors that push the price down. It compares straight against the market.",
    kbbTitle: "The exact number",
    kbbBody: "For a dollar figure use Kelley Blue Book, which works from real transactions. Apply the adjustment above and you will have a price you can defend.",
    kbbCta: "Check on KBB",

    comparablesTitle: "Similar cars here",
    comparablesEmpty: "There are no similar cars posted yet to compare against. As more inventory arrives, this section will fill in.",
    comparablesMiles: "miles",

    photosTitle: "Your photos",
    photoNotesTitle: "What can be seen",
    photoTipsTitle: "Photos you are missing",
    photoDisclaimer: "Axel only sees what the photo shows. He cannot detect mechanical faults, rust under the car, or anything the camera does not reach. These are observations to check in person, not an inspection.",
    photosOptional: "Optional. If you upload photos, Axel reviews those too. They are resized on your phone before sending, so you do not burn extra data.",
    photosPreparing: "Preparing photos…",
    photosTrimmed: "Only the first photos were kept: together they were too large.",
    photoReadFailed: "One of the photos could not be read. Try another one.",

    publishTitle: "Want to post it?",
    publishBody: "You can post this car with the same details you just entered. It is free and takes one more minute.",
    publishCta: "Post with these details",

    disclaimer: "The diagnosis is calculated from what you declare here. Axel does not drive or inspect the car: if what you enter is not accurate, neither is the result.",
  },

  finder: {
    title: "Find your car",
    bodyType: "Type",
    allBodies: "All",
    make: "Make",
    allMakes: "All",
    city: "City",
    allCities: "All",
    year: "Year",
    anyYear: "Any",
    orNewer: "or newer",
    maxPrice: "Max price",
    noLimit: "No limit",
    jump: "See results",
    results: "{n} cars",
    oneResult: "1 car",
    noResults: "No cars match that filter.",
    clear: "Clear filters",
  },

  seller: {
    new: "New seller",
    returning: "Has posted here before",
    established: "Seller with history",
    flagged: "Has had listings removed",
    published: "Listings",
    sold: "Sold",
    since: "Active for",
    monthsShort: " mo",
    note: "This history is kept by the site from what it has observed. Not opinions, not stars: counted listings.",
  },

  axel: {
    kicker: "Meet Axel",
    titleTop: "Someone had to read",
    titleAccent: "the fine print.",
    lead: "Axel is who rates the cars on Hi Desert Motors. He does not drive them or inspect them — he reads what each seller declares and turns it into a number you can compare against any other listing.",
    point1: "Every car goes through the same math. No favorites, no paid features.",
    point2: "What is wrong shows up on the card, not buried in the description.",
    point3: "And if the seller cannot back up what they say, Axel tells you that too.",
    alt: "Axel, the robot dog of Hi Desert Motors",
    caption: "Axel · HDM Rating",
  },

  categories: {
    title: "Rating breakdown",
    lead: "A single number hides what it is made of. Here you see where it is strong and where it is not.",
    mechanical: "Mechanical",
    mechanicalCaption: "Engine, transmission, brakes and wear",
    legal: "Legal and paperwork",
    legalCaption: "Title, history, smog and registration",
    electrical: "Electrical",
    electricalCaption: "Lights, A/C, heat and windows",
    cosmetic: "Cosmetic",
    cosmeticCaption: "Rust, dents, glass and interior",
  },

  flags: {
    title_salvage: "Salvage title",
    title_rebuilt: "Rebuilt title",
    title_lien: "Has a lien",
    title_missing: "Title not in hand",
    transmission: "Transmission slips",
    overheating: "Overheats",
    starting: "Does not always start",
    check_engine: "Check engine on",
    brakes: "Brakes not normal",
    rust: "Has rust",
    multiple_accidents: "2+ accidents",
    high_miles: "Very high mileage",
    no_smog: "No current smog",
  },

  footer: {
    tagline: "Used car listings with a clear rating.",
    city: "Hesperia, California",
    contact: "Contact",
    noPhoneNotice:
      "We have no sales line. Every listing carries its seller's direct contact. This email is for site questions, reporting a listing, or privacy requests.",
    email: "Send an email",
    exploreTitle: "Explore",
    sellTitle: "Sell",
    legalTitle: "Legal",
    freeDiagnosis: "Free diagnosis",
    lostLink: "I lost my edit link",
    reportListing: "Report a listing",
    rights: "All rights reserved.",
    builtBy: "Made in the High Desert",
    terms: "Terms of use",
    privacy: "Privacy notice",
  },
};

/**
 * Rellena los marcadores {name}, {n}, etc. de una plantilla.
 *
 * El diccionario NO puede contener funciones: viaja del server component
 * al client component y en ese cruce todo tiene que ser serializable.
 * Por eso las frases con variables son plantillas de texto.
 */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.es;
}

export type { Dictionary };
