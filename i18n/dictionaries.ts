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
    tagline: "Compra con confianza.",
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
    tagline: "Buy with confidence.",
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
