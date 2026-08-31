import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * Aprobar o rechazar un anuncio.
 *
 * El control es una clave en ADMIN_TOKEN, no un sistema de cuentas:
 * hay un solo administrador y montar sesiones para una persona es
 * trabajo sin destinatario.
 *
 * La clave va en el cuerpo, no en la URL: las URLs quedan en los
 * registros del servidor y en el historial del navegador.
 */

export const runtime = "nodejs";

function getSql() {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
}

export async function POST(request: Request) {
  try {
    const admin = process.env.ADMIN_TOKEN;
    if (!admin) {
      return NextResponse.json({ error: "sin_admin_token" }, { status: 500 });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ error: "no_db" }, { status: 500 });

    const body = await request.json();

    if (String(body.key ?? "") !== admin) {
      return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
    }

    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "id_invalido" }, { status: 400 });
    }

    const action = String(body.action ?? "");

    if (action === "publish") {
      // La caducidad se fija aquí, no a mano: olvidarla dejaba
      // anuncios que no vencían nunca.
      await sql`
        UPDATE listings
        SET status = 'published',
            published_at = NOW(),
            expires_at = NOW() + INTERVAL '30 days',
            updated_at = NOW()
        WHERE id = ${id}
      `;
      return NextResponse.json({ ok: true, status: "published" });
    }

    if (action === "reject") {
      await sql`
        UPDATE listings
        SET status = 'rejected', updated_at = NOW()
        WHERE id = ${id}
      `;
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    return NextResponse.json({ error: "accion_invalida" }, { status: 400 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("review failed:", detail);
    return NextResponse.json({ error: "fallo", detail }, { status: 500 });
  }
}
