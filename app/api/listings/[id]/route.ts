import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isValidEmail, normalizePhone } from "@/lib/locations";

/**
 * Editar o retirar un anuncio con su enlace secreto.
 *
 * El token va en el cuerpo, no en la URL: las URLs quedan en los
 * registros del servidor y en el historial del navegador.
 *
 * Aquí NO se aceptan los campos que describen el vehículo. Aunque
 * alguien arme la petición a mano y mande titleStatus, se ignora: la
 * consulta sólo escribe las columnas de presentación y contacto.
 */

export const runtime = "nodejs";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL no está definida");
    return null;
  }
  return neon(url);
}

function parseId(value: string) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "no_db" }, { status: 500 });

    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return NextResponse.json({ error: "bad_id" }, { status: 400 });

    const body = await request.json();
    const token = String(body.token ?? "");
    if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });

    const rows = await sql`
      SELECT id, status FROM listings
      WHERE id = ${numericId} AND edit_token = ${token}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const photos = (Array.isArray(body.photos) ? body.photos : [])
      .filter((url: unknown) => typeof url === "string")
      .slice(0, 24);

    if (photos.length < 3) {
      return NextResponse.json({ error: "min_photos" }, { status: 422 });
    }

    const name = String(body.sellerName ?? "").trim().slice(0, 80);
    const phone = normalizePhone(String(body.sellerPhone ?? ""));
    if (!name || !phone) {
      return NextResponse.json({ error: "invalid_seller" }, { status: 422 });
    }

    const rawEmail = String(body.sellerEmail ?? "").trim();
    if (rawEmail && !isValidEmail(rawEmail)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 422 });
    }

    const description = String(body.description ?? "").trim().slice(0, 1200);
    if (!description) {
      return NextResponse.json({ error: "no_description" }, { status: 422 });
    }

    // Sólo estas columnas. Las del vehículo no aparecen aquí a
    // propósito: es lo que hace que el bloqueo sea real y no un
    // adorno del formulario.
    await sql`
      UPDATE listings SET
        price         = ${body.price ? Number(body.price) : null},
        description   = ${description},
        city          = ${String(body.city ?? "").trim().slice(0, 60)},
        photos        = ${JSON.stringify(photos)},
        seller_name   = ${name},
        seller_phone  = ${phone},
        seller_email  = ${rawEmail || null},
        updated_at    = NOW()
      WHERE id = ${numericId} AND edit_token = ${token}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("PATCH listing failed:", detail);
    return NextResponse.json({ error: "update_failed", detail }, { status: 500 });
  }
}

/**
 * Retirar el anuncio.
 *
 * No se borra la fila: se marca como retirada. Un borrado real
 * eliminaría el rastro de lo que el vendedor declaró, y ese registro
 * es justo lo que te protege si después hay una disputa.
 */
export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "no_db" }, { status: 500 });

    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return NextResponse.json({ error: "bad_id" }, { status: 400 });

    const body = await request.json();
    const token = String(body.token ?? "");
    if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });

    const rows = await sql`
      UPDATE listings
      SET status = 'withdrawn', updated_at = NOW()
      WHERE id = ${numericId} AND edit_token = ${token}
      RETURNING id
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("DELETE listing failed:", detail);
    return NextResponse.json({ error: "delete_failed", detail }, { status: 500 });
  }
}
