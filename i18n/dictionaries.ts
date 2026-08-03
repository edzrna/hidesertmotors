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
    carDescription: (name: string) =>
      `${name} en Hi Desert Motors, Hesperia. Ficha completa con calificación HDM, millas, historial y contacto directo por WhatsApp.`,
  },

  nav: {
    tagline: "Compra con confianza.",
    inventory: "Ver inventario",
    reviews: "Opiniones",
    whatsapp: "Escribir por WhatsApp",
    switchTo: "English",
  },

  hero: {
    pill: "Calificación HDM",
    titleTop: "Encuentra el auto correcto.",
    titleAccent: "Sin adivinar.",
    lead: "Cada vehículo recibe una calificación del 60 al 100 según su condición, millas, año, historial y precio contra el mercado.",
    meterLabel: "Nivel del inventario",
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
    salvage: "Salvamento",
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
    whatsappMessage: (name: string) => `Hola, me interesa el ${name}`,
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
    copied: (name: string) => `Link copiado: ${name}`,
    copyShort: "Link copiado",
    copyError: "No se pudo copiar el link",
    viaWhatsapp: "Compartir por WhatsApp",
    viaFacebook: "Compartir en Facebook",
    viaLink: "Copiar link del vehículo",
  },

  gallery: {
    prev: "Imagen anterior",
    next: "Imagen siguiente",
    go: (n: number) => `Ver imagen ${n}`,
    close: "Cerrar",
  },

  inventory: {
    kicker: "Inventario",
    title: "Vehículos calificados automáticamente",
  },

  reviewsSection: {
    kicker: "Opiniones",
    title: "Lo que dicen nuestros clientes",
    items: [
      {
        name: "Daniel R.",
        level: "great_buy" as LevelKey,
        text: "Todo fue claro, rápido y la troca estaba tal como en las fotos.",
      },
      {
        name: "Ashley M.",
        level: "good_deal" as LevelKey,
        text: "La calificación me ayudó a entender el valor del auto desde el principio.",
      },
      {
        name: "Marco C.",
        level: "best_option" as LevelKey,
        text: "De las mejores experiencias que he tenido comprando auto. Sin presión y todo claro.",
      },
    ],
  },

  footer: {
    tagline: "Vehículos usados seleccionados con una evaluación clara.",
    city: "Hesperia, California",
    contact: "Redes de contacto",
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
    carDescription: (name: string) =>
      `${name} at Hi Desert Motors, Hesperia. Full listing with HDM rating, mileage, history and direct WhatsApp contact.`,
  },

  nav: {
    tagline: "Buy with confidence.",
    inventory: "View inventory",
    reviews: "Reviews",
    whatsapp: "Message us on WhatsApp",
    switchTo: "Español",
  },

  hero: {
    pill: "HDM Rating",
    titleTop: "Find the right car.",
    titleAccent: "No guesswork.",
    lead: "Every vehicle gets a 60 to 100 rating based on its condition, mileage, year, history and price against the market.",
    meterLabel: "Inventory level",
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
    whatsappMessage: (name: string) => `Hi, I'm interested in the ${name}`,
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
    copied: (name: string) => `Link copied: ${name}`,
    copyShort: "Link copied",
    copyError: "Couldn't copy the link",
    viaWhatsapp: "Share on WhatsApp",
    viaFacebook: "Share on Facebook",
    viaLink: "Copy vehicle link",
  },

  gallery: {
    prev: "Previous image",
    next: "Next image",
    go: (n: number) => `View image ${n}`,
    close: "Close",
  },

  inventory: {
    kicker: "Inventory",
    title: "Vehicles rated automatically",
  },

  reviewsSection: {
    kicker: "Reviews",
    title: "What our customers say",
    items: [
      {
        name: "Daniel R.",
        level: "great_buy",
        text: "Everything was clear and quick, and the truck looked exactly like the photos.",
      },
      {
        name: "Ashley M.",
        level: "good_deal",
        text: "The rating helped me understand what the car was worth from the start.",
      },
      {
        name: "Marco C.",
        level: "best_option",
        text: "One of the best car buying experiences I've had. No pressure, everything upfront.",
      },
    ],
  },

  footer: {
    tagline: "Hand-picked used vehicles with a clear evaluation.",
    city: "Hesperia, California",
    contact: "Get in touch",
    email: "Send an email",
  },
};

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.es;
}

export type { Dictionary };
