import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { notifyReport } from "@/lib/notify";

/**
 * Recibe reportes de anuncios.
 *
 * Un tablero de anuncios necesita esto: la diferencia entre
 * "plataforma que actúa al ser notificada" y "responsable de lo
 * publicado" es justamente tener un canal de reporte y atenderlo.
 *
 * No se pide identificación: exigir datos para reportar un auto
 * robado es una forma de que nadie lo reporte.
 */

export const runtime = "nodejs";

const REASONS = [
  "fraud",
  "false_info",
  "stolen",
  "dealer",
  "sold",
  "offensive",
  "other",
];

/** Un mismo anuncio no acepta más de 5 reportes por hora. */
const HOURLY_LIMIT = 5;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL no está definida");
    return null;
  }
  return neon(url);
}

export async function POST(request: Request) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "no_db" }, { status: 500 });

    const body = await request.json();

    const listingId = Number(body.listingId);
    if (!Number.isInteger(listingId) || listingId <= 0) {
      return NextResponse.json({ error: "bad_listing" }, { status: 400 });
    }

    const reason = String(body.reason ?? "");
    if (!REASONS.includes(reason)) {
      return NextResponse.json({ error: "bad_reason" }, { status: 422 });
    }

    const detail = String(body.detail ?? "").trim().slice(0, 1000);
    if (detail.length < 5) {
      return NextResponse.json({ error: "no_detail" }, { status: 422 });
    }

    const contact = String(body.contact ?? "").trim().slice(0, 120) || null;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM reports
      WHERE listing_id = ${listingId}
        AND created_at > NOW() - INTERVAL '1 hour'
    `;

    if (count >= HOURLY_LIMIT) {
      // Se responde ok a propósito: decirle a quien inunda que fue
      // frenado sólo le enseña a esquivar el freno.
      return NextResponse.json({ ok: true });
    }

    await sql`
      INSERT INTO reports (listing_id, reason, detail, contact)
      VALUES (${listingId}, ${reason}, ${detail}, ${contact})
    `;

    // El nombre del auto va en el aviso: "Reporte: anuncio #7" no
    // dice nada al abrirlo desde el celular.
    const [listing] = await sql`
      SELECT year, make, model FROM listings WHERE id = ${listingId} LIMIT 1
    `;

    const listingName = listing
      ? `${listing.year} ${listing.make} ${listing.model}`.trim()
      : `#${listingId}`;

    await notifyReport({
      listingId,
      listingName,
      reason,
      detail,
      contact,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("report failed:", detail);
    return NextResponse.json({ error: "report_failed", detail }, { status: 500 });
  }
}
