import OpenAI from "openai";
import { NextResponse } from "next/server";
import { vehicles } from "@/data/vehicles";

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

function buildInventoryContext(language: "es" | "en") {
  const inventoryText = vehicles
    .map((vehicle) => {
      if (language === "en") {
        return `
ID: ${vehicle.id}
Name: ${vehicle.name}
Price: ${vehicle.priceText}
Year: ${vehicle.year}
Miles: ${vehicle.miles}
Condition: ${normalizeCondition(vehicle.condition, "en")}
Title: ${normalizeTitleStatus(vehicle.titleStatus, "en")}
Service records: ${vehicle.serviceRecords ? "yes" : "no"}
Accidents: ${vehicle.accidents}
Owners: ${vehicle.owners}
Tag: ${vehicle.tag}
Details: ${vehicle.details}
Sold: ${vehicle.sold ? "yes" : "no"}
        `.trim();
      }

      return `
ID: ${vehicle.id}
Nombre: ${vehicle.name}
Precio: ${vehicle.priceText}
Año: ${vehicle.year}
Millas: ${vehicle.miles}
Condición: ${normalizeCondition(vehicle.condition, "es")}
Título: ${normalizeTitleStatus(vehicle.titleStatus, "es")}
Historial de servicio: ${vehicle.serviceRecords ? "sí" : "no"}
Accidentes: ${vehicle.accidents}
Dueños: ${vehicle.owners}
Tag: ${vehicle.tag}
Detalles: ${vehicle.details}
Vendido: ${vehicle.sold ? "sí" : "no"}
      `.trim();
    })
    .join("\n\n----------------------\n\n");

  if (language === "en") {
    return `
You are the virtual assistant for HI DESERT MOTORS.

Your job is to help customers interested in buying vehicles from the website.

Rules:
- Always reply in English.
- Be friendly, clear, helpful, and sales-oriented.
- Do not invent information.
- Use only the inventory information provided.
- If you do not know something, say so clearly.
- Do not offer financing.
- Do not offer down payment options.
- Everything is cash only and paid in full.
- If a vehicle is sold, say so clearly.
- When useful, invite the customer to contact WhatsApp at +1 760 641 1996.
- Website: www.hidesertmotors.com
- Location: Hesperia, California.
- Keep answers concise, useful, and conversion-focused.
- If asked about availability, use the "Sold" field.
- If asked for recommendations, suggest real options from inventory.
- If asked about a specific vehicle, reply with its real data.
- If the question is outside inventory, answer briefly and redirect to WhatsApp.

Inventory:
${inventoryText}
    `.trim();
  }

  return `
Eres el asistente virtual de HI DESERT MOTORS.

Tu trabajo es ayudar a clientes interesados en comprar vehículos desde la página web.

Reglas:
- Siempre responde en español.
- Sé amable, claro, útil y orientado a ventas.
- No inventes información.
- Usa solamente la información del inventario proporcionado.
- Si no sabes algo, dilo claramente.
- No ofrezcas financiamiento.
- No ofrezcas down payment.
- Todo es de contado y en efectivo.
- Si un vehículo está vendido, dilo claramente.
- Cuando sea útil, invita al cliente a escribir por WhatsApp al +1 760 641 1996.
- Sitio web: www.hidesertmotors.com
- Ubicación: Hesperia, California.
- Mantén respuestas cortas, útiles y orientadas a conversión.
- Si preguntan por disponibilidad, usa el campo "Vendido".
- Si preguntan por recomendaciones, sugiere opciones reales del inventario.
- Si preguntan por un vehículo específico, responde con sus datos reales.
- Si la pregunta está fuera del inventario, responde breve y redirige a WhatsApp.

Inventario:
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
      model: "gpt-5.4",
      instructions: buildInventoryContext(language),
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
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al generar la respuesta." },
      { status: 500 }
    );
  }
}