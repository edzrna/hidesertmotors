import type { Locale } from "@/lib/hdm";

/**
 * Textos legales.
 *
 * En archivo aparte porque son largos y sólo los cargan dos páginas.
 * Igual que el resto: sólo cadenas, nada de funciones — el diccionario
 * cruza del servidor al cliente.
 *
 * NO es asesoría legal. Cubre lo básico de un tablero de anuncios,
 * pero un abogado debería revisarlo antes de que el sitio crezca.
 */

export const LEGAL_UPDATED = "2026-08";

const es = {
  updated: "Actualizado: agosto 2026",
  backToSite: "Volver al sitio",

  terms: {
    label: "Términos",
    title: "Términos de uso",
    subtitle: "Las reglas de Hi Desert Motors. Cortas, pero aplican.",
    description:
      "Términos de uso de Hi Desert Motors, tablero de anuncios de autos usados en el Alto Desierto.",

    sections: [
      {
        id: "que-es",
        title: "1. Qué es este sitio",
        body: [
          "Hi Desert Motors es un tablero de anuncios. Los vehículos que aparecen aquí son de particulares que publican por su cuenta.",
          "No compramos, no vendemos, no consignamos y no intermediamos. No recibimos dinero de ninguna venta, no participamos en la negociación y no ayudamos con el papeleo. Cuando encuentras un auto que te interesa, tratas directamente con su dueño.",
          "No somos un dealer con licencia y no pretendemos serlo.",
        ],
      },
      {
        id: "calificacion",
        title: "2. Qué es la calificación HDM",
        body: [
          "Cada anuncio muestra un número del 60 al 100 calculado a partir de los datos que declara el vendedor: título, millas, año, historial y el estado que él mismo reporta.",
          "No inspeccionamos ningún vehículo. No verificamos lo que el vendedor declara. La calificación describe esa declaración, no el auto.",
          "Junto a cada calificación aparece un nivel de respaldo, que mide cuánta documentación aportó el vendedor. Un respaldo alto no garantiza nada: significa que hay más elementos que tú puedes verificar por tu cuenta.",
          "Revisa el vehículo en persona y con un mecánico de tu confianza antes de pagar. Siempre.",
        ],
      },
      {
        id: "vendedores",
        title: "3. Si publicas un anuncio",
        body: [
          "Al publicar declaras que el vehículo es de tu propiedad, que tienes derecho a venderlo y que la información que proporcionas es verdadera y completa.",
          "Eres el único responsable de lo que publicas. Declarar datos falsos sobre un vehículo puede tener consecuencias legales frente al comprador, independientemente de este sitio.",
          "Los datos que describen el vehículo quedan fijos al publicar. Si te equivocaste, retira el anuncio y publica uno nuevo.",
          "Podemos rechazar, editar o retirar cualquier anuncio, en cualquier momento y sin aviso previo.",
        ],
      },
      {
        id: "prohibido",
        title: "4. Lo que no se permite",
        body: [
          "Publicar vehículos que no te pertenecen o que no tienes derecho a vender.",
          "Ocultar un título de salvamento, reconstruido o con gravamen, o alterar el odómetro.",
          "Publicar como particular cuando en realidad operas como dealer sin licencia.",
          "Usar el sitio para estafas, publicidad ajena, contenido ilegal o acoso a otros usuarios.",
          "Extraer datos del sitio de forma automatizada.",
        ],
      },
      {
        id: "sin-garantia",
        title: "5. Sin garantías",
        body: [
          "El sitio se ofrece tal como está. No garantizamos que la información publicada sea exacta, que los vehículos existan, que los vendedores sean quienes dicen ser, ni que el servicio esté disponible sin interrupciones.",
          "No somos parte de ninguna transacción entre comprador y vendedor, y no respondemos por lo que ocurra entre ellos.",
        ],
      },
      {
        id: "limite",
        title: "6. Límite de responsabilidad",
        body: [
          "Hasta donde la ley lo permite, no somos responsables de ninguna pérdida o daño derivado del uso del sitio, de la información publicada en él, o de cualquier trato entre usuarios.",
          "Cualquier decisión de compra o venta es tuya.",
        ],
      },
      {
        id: "ley",
        title: "7. Ley aplicable",
        body: [
          "Estos términos se rigen por las leyes del Estado de California, Estados Unidos.",
          "Si alguna parte de estos términos resulta inaplicable, el resto sigue vigente.",
        ],
      },
      {
        id: "cambios",
        title: "8. Cambios",
        body: [
          "Estos términos pueden cambiar. La fecha de arriba indica la versión vigente. Seguir usando el sitio después de un cambio significa que lo aceptas.",
        ],
      },
    ],
  },

  privacy: {
    label: "Privacidad",
    title: "Aviso de privacidad",
    subtitle: "Qué datos guardamos, por qué, y cuáles se publican.",
    description:
      "Aviso de privacidad de Hi Desert Motors: qué datos se recogen al publicar un anuncio y cómo se usan.",

    sections: [
      {
        id: "resumen",
        title: "Lo importante primero",
        body: [
          "No hay cuentas ni contraseñas. Puedes ver todo el sitio sin darnos nada.",
          "Si publicas un anuncio, tu nombre y tu teléfono se muestran públicamente, porque son el punto de contacto del anuncio. Tu correo nunca se publica.",
          "No vendemos tus datos a nadie.",
        ],
      },
      {
        id: "que-guardamos",
        title: "1. Qué guardamos",
        body: [
          "De cada anuncio: los datos del vehículo que declaras, tus fotos, tu descripción, la ciudad, tu nombre, tu teléfono y —si lo das— tu correo.",
          "Además, la calificación calculada, la fecha de publicación y el registro de tus ediciones.",
          "Como cualquier sitio web, nuestro proveedor de hospedaje registra datos técnicos: dirección IP, tipo de navegador, páginas visitadas y errores.",
        ],
      },
      {
        id: "publico",
        title: "2. Qué se publica",
        body: [
          "Se publica: el vehículo y todos sus datos declarados, las fotos, la descripción, la ciudad, tu nombre y tu teléfono.",
          "No se publica: tu correo electrónico ni tu enlace de edición.",
          "Publica sólo el teléfono en el que quieras recibir llamadas de desconocidos, y ten presente que un anuncio público puede ser visto y copiado por cualquiera mientras esté en línea.",
        ],
      },
      {
        id: "para-que",
        title: "3. Para qué lo usamos",
        body: [
          "Para publicar tu anuncio y que los compradores puedan contactarte, para calcular la calificación, para revisar anuncios antes de publicarlos y para atender reportes.",
          "No hacemos publicidad con tus datos, no construimos perfiles y no los compartimos con terceros salvo los proveedores que hacen funcionar el sitio.",
        ],
      },
      {
        id: "proveedores",
        title: "4. Quién más los procesa",
        body: [
          "El sitio se apoya en servicios externos que procesan datos por nuestra cuenta: el hospedaje que sirve las páginas y guarda registros técnicos, la base de datos donde viven los anuncios, y el almacenamiento donde viven las fotos.",
          "Estos proveedores operan en Estados Unidos.",
        ],
      },
      {
        id: "cuanto",
        title: "5. Cuánto tiempo",
        body: [
          "Los anuncios publicados se conservan mientras estén activos. Al retirarlos o marcarlos como vendidos, se conserva el registro de lo declarado: es lo que permite responder si más adelante hay una disputa sobre un vehículo.",
          "Si quieres que borremos tus datos por completo, escríbenos y lo hacemos.",
        ],
      },
      {
        id: "derechos",
        title: "6. Tus derechos",
        body: [
          "Si resides en California, la ley te da derecho a saber qué datos tuyos tenemos, a pedir que los borremos y a que no te discriminemos por ejercer esos derechos.",
          "No vendemos información personal, así que no hay nada de lo que darse de baja en ese sentido.",
          "Para cualquier solicitud, escríbenos desde el correo o el teléfono que dejaste en tu anuncio, para poder confirmar que eres tú.",
        ],
      },
      {
        id: "menores",
        title: "7. Menores de edad",
        body: [
          "El sitio no está dirigido a menores de 18 años y no recogemos sus datos a sabiendas.",
        ],
      },
      {
        id: "cambios-privacidad",
        title: "8. Cambios",
        body: [
          "Este aviso puede cambiar conforme el sitio crezca. La fecha de arriba indica la versión vigente.",
        ],
      },
    ],
  },

  report: {
    button: "Reportar este anuncio",
    title: "Reportar anuncio",
    lead: "Si algo en este anuncio no está bien, dinos qué es. Revisamos todos los reportes.",
    reasonLabel: "¿Qué pasa con este anuncio?",
    reasons: {
      fraud: "Parece una estafa",
      false_info: "La información es falsa",
      stolen: "Creo que el vehículo es robado",
      dealer: "Es un dealer haciéndose pasar por particular",
      sold: "Ya se vendió y sigue publicado",
      offensive: "Contenido ofensivo o inapropiado",
      other: "Otra cosa",
    },
    detailLabel: "Cuéntanos más",
    detailHelp: "Entre más específico, más rápido lo resolvemos.",
    contactLabel: "Tu contacto (opcional)",
    contactHelp: "Sólo si quieres que te avisemos qué pasó con tu reporte.",
    submit: "Enviar reporte",
    sending: "Enviando…",
    sentTitle: "Reporte recibido",
    sentBody: "Gracias. Lo revisamos y actuamos si corresponde.",
    cancel: "Cancelar",
    errorReason: "Elige un motivo",
    errorDetail: "Escribe qué pasa",
    errorSend: "No se pudo enviar el reporte. Intenta de nuevo.",
  },
};

type Dict = typeof es;

const en: Dict = {
  updated: "Updated: August 2026",
  backToSite: "Back to site",

  terms: {
    label: "Terms",
    title: "Terms of use",
    subtitle: "The rules for Hi Desert Motors. Short, but they apply.",
    description:
      "Terms of use for Hi Desert Motors, a used car listings board in the High Desert.",

    sections: [
      {
        id: "que-es",
        title: "1. What this site is",
        body: [
          "Hi Desert Motors is a listings board. The vehicles here are posted by private owners on their own behalf.",
          "We do not buy, sell, consign, or broker. We take no money from any sale, we do not take part in negotiations, and we do not help with paperwork. When you find a car you like, you deal directly with its owner.",
          "We are not a licensed dealer and do not claim to be one.",
        ],
      },
      {
        id: "calificacion",
        title: "2. What the HDM rating is",
        body: [
          "Every listing shows a number from 60 to 100 calculated from what the seller declares: title, mileage, year, history, and the condition they report themselves.",
          "We do not inspect any vehicle. We do not verify what the seller declares. The rating describes that declaration, not the car.",
          "Next to each rating there is a backing level, which measures how much documentation the seller provided. High backing guarantees nothing: it means there are more things you can verify yourself.",
          "Inspect the vehicle in person, with a mechanic you trust, before you pay. Always.",
        ],
      },
      {
        id: "vendedores",
        title: "3. If you post a listing",
        body: [
          "By posting you declare that you own the vehicle, that you have the right to sell it, and that the information you provide is true and complete.",
          "You are solely responsible for what you post. Declaring false information about a vehicle can carry legal consequences toward the buyer, independently of this site.",
          "The details describing the vehicle are locked once published. If you made a mistake, withdraw the listing and post a new one.",
          "We may reject, edit, or remove any listing at any time and without prior notice.",
        ],
      },
      {
        id: "prohibido",
        title: "4. What is not allowed",
        body: [
          "Posting vehicles you do not own or have no right to sell.",
          "Hiding a salvage, rebuilt, or lien title, or tampering with the odometer.",
          "Posting as a private party when you actually operate as an unlicensed dealer.",
          "Using the site for scams, unrelated advertising, illegal content, or harassing other users.",
          "Scraping the site automatically.",
        ],
      },
      {
        id: "sin-garantia",
        title: "5. No warranties",
        body: [
          "The site is provided as is. We do not warrant that posted information is accurate, that the vehicles exist, that sellers are who they say they are, or that the service will be available without interruption.",
          "We are not a party to any transaction between buyer and seller, and we are not answerable for what happens between them.",
        ],
      },
      {
        id: "limite",
        title: "6. Limitation of liability",
        body: [
          "To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of the site, from information posted on it, or from any dealing between users.",
          "Any decision to buy or sell is yours.",
        ],
      },
      {
        id: "ley",
        title: "7. Governing law",
        body: [
          "These terms are governed by the laws of the State of California, USA.",
          "If any part of these terms is unenforceable, the rest remains in effect.",
        ],
      },
      {
        id: "cambios",
        title: "8. Changes",
        body: [
          "These terms may change. The date above shows the current version. Continuing to use the site after a change means you accept it.",
        ],
      },
    ],
  },

  privacy: {
    label: "Privacy",
    title: "Privacy notice",
    subtitle: "What we store, why, and what gets published.",
    description:
      "Privacy notice for Hi Desert Motors: what data is collected when you post a listing and how it is used.",

    sections: [
      {
        id: "resumen",
        title: "The short version",
        body: [
          "There are no accounts and no passwords. You can browse the whole site without giving us anything.",
          "If you post a listing, your name and phone number are shown publicly, because they are the contact point for the listing. Your email is never published.",
          "We do not sell your data to anyone.",
        ],
      },
      {
        id: "que-guardamos",
        title: "1. What we store",
        body: [
          "For each listing: the vehicle details you declare, your photos, your description, the city, your name, your phone, and — if you provide it — your email.",
          "Also the calculated rating, the publication date, and a record of your edits.",
          "Like any website, our hosting provider logs technical data: IP address, browser type, pages visited, and errors.",
        ],
      },
      {
        id: "publico",
        title: "2. What gets published",
        body: [
          "Published: the vehicle and all its declared details, the photos, the description, the city, your name, and your phone number.",
          "Not published: your email address or your edit link.",
          "Only post a phone number you are willing to receive calls from strangers on, and keep in mind that a public listing can be seen and copied by anyone while it is online.",
        ],
      },
      {
        id: "para-que",
        title: "3. What we use it for",
        body: [
          "To publish your listing so buyers can contact you, to calculate the rating, to review listings before publishing them, and to handle reports.",
          "We do not advertise using your data, we do not build profiles, and we do not share it with third parties other than the providers that make the site work.",
        ],
      },
      {
        id: "proveedores",
        title: "4. Who else processes it",
        body: [
          "The site relies on external services that process data on our behalf: the hosting that serves the pages and keeps technical logs, the database where listings live, and the storage where photos live.",
          "These providers operate in the United States.",
        ],
      },
      {
        id: "cuanto",
        title: "5. How long",
        body: [
          "Published listings are kept while they are active. When withdrawn or marked as sold, the record of what was declared is kept: that is what allows us to respond if a dispute about a vehicle comes up later.",
          "If you want your data deleted entirely, write to us and we will do it.",
        ],
      },
      {
        id: "derechos",
        title: "6. Your rights",
        body: [
          "If you live in California, the law gives you the right to know what data we hold about you, to ask us to delete it, and not to be discriminated against for exercising those rights.",
          "We do not sell personal information, so there is nothing to opt out of on that front.",
          "For any request, write to us from the email or phone you left on your listing, so we can confirm it is you.",
        ],
      },
      {
        id: "menores",
        title: "7. Minors",
        body: [
          "The site is not directed at people under 18 and we do not knowingly collect their data.",
        ],
      },
      {
        id: "cambios-privacidad",
        title: "8. Changes",
        body: [
          "This notice may change as the site grows. The date above shows the current version.",
        ],
      },
    ],
  },

  report: {
    button: "Report this listing",
    title: "Report listing",
    lead: "If something about this listing is wrong, tell us what. We review every report.",
    reasonLabel: "What is wrong with this listing?",
    reasons: {
      fraud: "It looks like a scam",
      false_info: "The information is false",
      stolen: "I think the vehicle is stolen",
      dealer: "It is a dealer posing as a private seller",
      sold: "It already sold and is still posted",
      offensive: "Offensive or inappropriate content",
      other: "Something else",
    },
    detailLabel: "Tell us more",
    detailHelp: "The more specific you are, the faster we can act.",
    contactLabel: "Your contact (optional)",
    contactHelp: "Only if you want us to tell you what happened with your report.",
    submit: "Send report",
    sending: "Sending…",
    sentTitle: "Report received",
    sentBody: "Thank you. We will review it and act if needed.",
    cancel: "Cancel",
    errorReason: "Pick a reason",
    errorDetail: "Tell us what is wrong",
    errorSend: "The report could not be sent. Please try again.",
  },
};

const dictionaries: Record<Locale, Dict> = { es, en };

export function getLegalDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.es;
}

export type { Dict as LegalDictionary };
