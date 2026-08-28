import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { scoreListing, type Listing } from "@/lib/listing-score";
import { getPriceAdjustments, getTotalAdjustment } from "@/lib/price-guide";

/**
 * Diagnóstico de Axel.
 *
 * Tres partes, con orígenes distintos y separados a propósito:
 *
 *  1. La calificación y las categorías salen del motor de siempre.
 *     Es matemática, no opinión, y no pasa por ningún modelo.
 *  2. Los comparables salen de la base: anuncios reales con precios
 *     reales.
 *  3. El texto lo escribe un modelo, pero sobre los datos ya
 *     calculados. No inventa números: los explica.
 *
 * Si el modelo falla, los dos primeros bloques siguen sirviendo. El
 * diagnóstico no depende de la IA para ser útil.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return url ? neon(url) : null;
}

/** Anuncios parecidos ya publicados, para dar referencia real. */
async function getComparables(listing: Listing) {
  try {
    const sql = getSql();
    if (!sql) return [];

    const rows = await sql`
      SELECT id, year, make, model, miles, price, score, title_status
      FROM listings
      WHERE status IN ('published', 'sold')
        AND price IS NOT NULL
        AND make = ${listing.make}
        AND ABS(year - ${listing.year}) <= 4
      ORDER BY ABS(miles - ${listing.miles}) ASC
      LIMIT 4
    `;

    return rows.map((row) => ({
      id: String(row.id),
      name: `${row.year} ${row.make} ${row.model}`,
      miles: row.miles as number,
      price: row.price as number,
      score: row.score as number,
      titleStatus: row.title_status as string,
    }));
  } catch (error) {
    console.error("comparables failed", error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listing = body.listing as Listing;
    const locale = body.locale === "en" ? "en" : "es";
    const photos: string[] = Array.isArray(body.photos)
      ? body.photos.slice(0, 6)
      : [];

    if (!listing?.make || !listing?.year) {
      return NextResponse.json({ error: "incomplete" }, { status: 422 });
    }

    // --- 1 y 2: lo que no depende de la IA ---
    const scored = scoreListing(listing);
    const adjustments = getPriceAdjustments(listing);
    const total = getTotalAdjustment(adjustments);
    const comparables = await getComparables(listing);

    // --- 3: el relato ---
    let narrative = "";
    let photoNotes: string[] = [];
    let photoTips: string[] = [];

    const key = process.env.OPENAI_API_KEY;

    if (key) {
      try {
        const content: any[] = [
          {
            type: "text",
            text: `Eres Axel, un perro robot que diagnostica autos usados para un tablero de anuncios. Hablas claro y directo, sin adornos ni entusiasmo vendedor.

DATOS DECLARADOS POR EL DUEÑO:
${JSON.stringify({ ...listing, defects: listing.defects }, null, 2)}

RESULTADO DEL CÁLCULO (ya hecho, no lo recalcules):
- Calificación: ${scored.score}/100
- Mecánica ${scored.categories.mechanical}, Legal ${scored.categories.legal}, Eléctrica ${scored.categories.electrical}, Estética ${scored.categories.cosmetic}
- Ajuste de precio frente a un equivalente limpio: entre ${total.min}% y ${total.max}%

REGLAS ESTRICTAS:
- NUNCA des una cifra en dólares. No la tienes y no puedes deducirla.
- No recalcules la calificación: explícala.
- Si algo declarado es grave, dilo sin suavizar.
- Habla en ${locale === "en" ? "inglés" : "español"}, tuteando.

Responde SOLO con JSON, sin markdown:
{
  "narrative": "3 o 4 frases: qué tiene bien, qué tiene mal, y qué significa para venderlo",
  "photoNotes": ["observaciones de las fotos, si hay"],
  "photoTips": ["fotos que le faltan o que mejorarían el anuncio"]
}`,
          },
        ];

        for (const url of photos) {
          content.push({ type: "image_url", image_url: { url } });
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 700,
            messages: [{ role: "user", content }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content ?? "";
          const clean = raw.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);

          narrative = String(parsed.narrative ?? "");
          photoNotes = Array.isArray(parsed.photoNotes)
            ? parsed.photoNotes.slice(0, 5).map(String)
            : [];
          photoTips = Array.isArray(parsed.photoTips)
            ? parsed.photoTips.slice(0, 5).map(String)
            : [];
        }
      } catch (error) {
        // El relato es un extra. Si falla, el diagnóstico sigue.
        console.error("narrative failed", error);
      }
    }

    return NextResponse.json({
      score: scored.score,
      levelKey: scored.levelKey,
      categories: scored.categories,
      confidence: scored.confidence,
      confidenceLevel: scored.confidenceLevel,
      flags: scored.flags,
      adjustments,
      total,
      comparables,
      narrative,
      photoNotes,
      photoTips,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("analyze failed:", detail);
    return NextResponse.json({ error: "analyze_failed", detail }, { status: 500 });
  }
}
