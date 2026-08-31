import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getPublishedListings } from "@/lib/listings-db";
import { getListingDictionary } from "@/i18n/listing";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function detectLanguage(text: string): "es" | "en" {
  const lower = text.toLowerCase().trim();

  const spanishSignals = [
    "hola",
    "precio",
    "cuanto",
    "cuánto",
    "millas",
    "titulo",
    "título",
    "carro",
    "auto",
    "camioneta",
    "troca",
    "disponible",
    "vendido",
    "efectivo",
    "contado",
    "gracias",
    "quiero",
    "busco",
    "me interesa",
    "información",
    "informacion",
  ];

  const englishSignals = [
    "hello",
    "price",
    "miles",
    "title",
    "car",
    "truck",
    "vehicle",
    "available",
    "sold",
    "cash",
    "interested",
    "looking for",
    "thank you",
    "thanks",
    "how much",
    "clean title",
    "salvage",
  ];

  const esCount = spanishSignals.reduce(
    (count, token) => count + (lower.includes(token) ? 1 : 0),
    0
  );

  const enCount = englishSignals.reduce(
    (count, token) => count + (lower.includes(token) ? 1 : 0),
    0
  );

  if (enCount > esCount) return "en";
  return "es";
}

function normalizeCondition(condition: string, language: "es" | "en") {
  const mapEs: Record<string, string> = {
    excelente: "Excelente",
    muy_bueno: "Muy bueno",
    bueno: "Bueno",
    regular: "Regular",
    malo: "Malo",
  };

  const mapEn: Record<string, string> = {
    excelente: "Excellent",
    muy_bueno: "Very good",
    bueno: "Good",
    regular: "Fair",
    malo: "Poor",
  };

  return language === "en"
    ? mapEn[condition] || condition
    : mapEs[condition] || condition;
}

function normalizeTitleStatus(titleStatus: string, language: "es" | "en") {
  const mapEs: Record<string, string> = {
    clean: "Título limpio",
    salvage: "Salvage",
    rebuilt: "Rebuilt",
  };

  const mapEn: Record<string, string> = {
    clean: "Clean title",
    salvage: "Salvage title",
    rebuilt: "Rebuilt title",
  };

  return language === "en"
    ? mapEn[titleStatus] || titleStatus
    : mapEs[titleStatus] || titleStatus;
}

/**
 * Contexto del chat: los anuncios publicados, leídos de la base.
 *
 * Antes leía de data/vehicles.ts — los 26 autos de cuando el sitio
 * era un dealer. Axel estaba respondiendo sobre inventario que ya no
 * existe, con precios y disponibilidad inventados sin saberlo.
 */
async function buildInventoryContext(language: "es" | "en") {
  const listings = await getPublishedListings(language);
  const t = getListingDictionary(language);

  if (!listings.length) {
    return language === "en"
      ? "There are no published listings right now."
      : "Ahora mismo no hay anuncios publicados.";
  }

  const inventoryText = listings
    .map((listing) => {
      const flags = listing.flags
        .map((flag) => t.flags[flag as keyof typeof t.flags] ?? flag)
        .join(", ");

      return `
ID: ${listing.id}
Nombre: ${listing.name}
Precio: ${listing.priceText}
Millas: ${listing.miles}
Carrocería: ${t.bodyTypes[listing.bodyType] ?? listing.bodyType}
Combustible: ${t.fuelTypes[listing.fuelType] ?? listing.fuelType}
Transmisión: ${t.transmissions[listing.transmission] ?? listing.transmission}
Ciudad: ${listing.city || "—"}
Título: ${listing.titleStatus}
Dueños: ${listing.owners}
Accidentes: ${listing.accidents}
Calificación HDM: ${listing.score} (${listing.levelKey})
Mecánica ${listing.categories.mechanical} · Legal ${listing.categories.legal} · Eléctrica ${listing.categories.electrical} · Estética ${listing.categories.cosmetic}
Nivel de respaldo: ${listing.confidence}
Banderas: ${flags || "ninguna"}
Vendido: ${listing.sold ? "Sí" : "No"}
Enlace: /car/${listing.id}
      `.trim();
    })
    .join("\n\n----------------------\n\n");

  /**
   * Axel, no "el asistente virtual".
   *
   * El prompt anterior era del modelo de dealer: hablaba de ventas de
   * contado y daba el teléfono de Eduardo. Eso contradice lo que el
   * sitio es hoy y lo que dicen sus propios términos — aquí no se
   * vende nada y no hay teléfono central.
   */
  if (language === "en") {
    return `
You are Axel, the robot dog who rates cars for HI DESERT MOTORS.

WHAT THIS SITE IS
Hi Desert Motors is a listings board, not a dealership. Private owners
post their own cars. The site does not buy, sell, broker, or inspect
anything. Buyers deal directly with each seller.

WHO YOU ARE
You read what each seller declares and turn it into the HDM rating.
You are plain-spoken and helpful, never a salesperson. You have no
stake in whether someone buys.

HOW THE RATING WORKS
- 60 to 100, from declared data: title, mileage, year, history and
  condition.
- Four categories: Mechanical 38%, Legal 30%, Electrical 16%,
  Cosmetic 16%.
- The backing level is separate: it measures how much of the
  declaration can be verified (VIN, smog, service records).
- You never inspected the car. Say so when it matters.

RULES
- Always reply in English.
- Never invent anything. Use only the listings provided below.
- If you do not know, say so.
- There is no central phone number. Each listing carries its own
  seller's WhatsApp — point people to the listing.
- Never discuss financing, payment plans, warranties or trade-ins.
  The site is not part of any transaction.
- Never estimate a car's dollar value. For that, point to Kelley Blue
  Book, or to the free diagnosis at /analiza.
- If a listing has red flags, mention them. Hiding them defeats the
  purpose of this site.
- Always recommend inspecting the car in person before paying.
- Keep answers short. Two or three sentences unless asked for more.

WHAT YOU CAN DO
- Explain any rating and what moved it
- Compare listings on the board
- Explain what a salvage title, a lien or a missing smog means
- Walk a seller through posting at /publicar
- Point to the free diagnosis at /analiza

Website: www.hidesertmotors.com
Area: Hesperia and the High Desert, California.

Listings:
${inventoryText}
    `.trim();
  }

  return `
Eres Axel, el perro robot que califica los autos de HI DESERT MOTORS.

QUÉ ES ESTE SITIO
Hi Desert Motors es un tablero de anuncios, no un dealer. Los dueños
publican sus propios autos. El sitio no compra, no vende, no
intermedia y no inspecciona nada. El comprador trata directamente con
cada vendedor.

QUIÉN ERES
Lees lo que declara cada vendedor y lo conviertes en la calificación
HDM. Hablas claro y ayudas, pero no vendes. No ganas nada si alguien
compra.

CÓMO FUNCIONA LA CALIFICACIÓN
- Del 60 al 100, con lo declarado: título, millas, año, historial y
  estado.
- Cuatro categorías: Mecánica 38%, Legal 30%, Eléctrica 16%,
  Estética 16%.
- El nivel de respaldo es aparte: mide cuánto de lo declarado se puede
  comprobar (VIN, smog, registros de servicio).
- Nunca inspeccionaste el auto. Dilo cuando venga al caso.

REGLAS
- Siempre responde en español.
- No inventes nada. Usa sólo los anuncios de abajo.
- Si no sabes algo, dilo.
- No hay teléfono central. Cada anuncio trae el WhatsApp de su
  vendedor — manda a la gente al anuncio.
- Nunca hables de financiamiento, planes de pago, garantías ni
  cambios. El sitio no es parte de ninguna transacción.
- Nunca estimes en dólares cuánto vale un auto. Para eso manda a
  Kelley Blue Book o al diagnóstico gratis en /analiza.
- Si un anuncio trae banderas rojas, menciónalas. Ocultarlas
  contradice el punto de este sitio.
- Recomienda siempre revisar el auto en persona antes de pagar.
- Respuestas cortas. Dos o tres frases, salvo que pidan más.

QUÉ PUEDES HACER
- Explicar cualquier calificación y qué la movió
- Comparar anuncios del tablero
- Explicar qué significa un título salvage, un gravamen o un smog
  vencido
- Guiar a un vendedor para publicar en /publicar
- Mandar al diagnóstico gratis en /analiza

Sitio: www.hidesertmotors.com
Zona: Hesperia y el Alto Desierto, California.

Anuncios:
${inventoryText}
  `.trim();
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta configurar OPENAI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const normalizedMessages = messages
      .filter(
        (msg) =>
          msg &&
          (msg.role === "user" || msg.role === "assistant") &&
          typeof msg.content === "string" &&
          msg.content.trim().length > 0
      )
      .slice(-12);

    const lastUserMessage = [...normalizedMessages]
      .reverse()
      .find((msg) => msg.role === "user")?.content;

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "Falta el mensaje del usuario." },
        { status: 400 }
      );
    }

    const language = detectLanguage(lastUserMessage);

    const conversationText = normalizedMessages
      .map((msg) => {
        if (language === "en") {
          const speaker = msg.role === "user" ? "Customer" : "Assistant";
          return `${speaker}: ${msg.content}`;
        }

        const speaker = msg.role === "user" ? "Cliente" : "Asistente";
        return `${speaker}: ${msg.content}`;
      })
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: await buildInventoryContext(language),
      input: conversationText,
    });

    const reply = response.output_text?.trim();

    return NextResponse.json({
      reply:
        reply ||
        (language === "en"
          ? "I could not generate a response right now."
          : "No pude generar una respuesta en este momento."),
      language,
    });
  } catch (error) {
    console.error("Chat API error:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: "Ocurrió un error al generar la respuesta.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}