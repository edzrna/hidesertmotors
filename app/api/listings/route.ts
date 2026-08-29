import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isValidEmail, normalizePhone } from "@/lib/locations";
import { createEditToken, editUrl } from "@/lib/edit-token";
import { notifyNewListing } from "@/lib/notify";
import { SITE_URL } from "@/lib/site";
import {
  scoreListing,
  validateListing,
  type Listing,
} from "@/lib/listing-score";

/**
 * Recibe un anuncio nuevo.
 *
 * Todo se vuelve a validar y a calificar AQUÍ. Lo que llega del
 * navegador es una propuesta, no un hecho: cualquiera puede mandar un
 * POST con score 100 desde una terminal. La calificación que se guarda
 * es la que calcula este archivo.
 *
 * Los anuncios entran como `pending`. Nada se publica sin revisión.
 */

export const runtime = "nodejs";

const sql = neon(process.env.DATABASE_URL!);

/** Un mismo teléfono no puede mandar más de 3 anuncios por día. */
const DAILY_LIMIT = 3;

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  /**
   * Todo lo demás va dentro de un try.
   *
   * Sin esto, cualquier fallo de la base —una columna que no existe,
   * una restricción violada— sale como un 500 mudo, y el formulario
   * sólo puede decir "falló". Diagnosticar eso cuesta horas; el
   * mensaje real cuesta una línea.
   */
  try {
  const listing: Listing = {
    id: "new",
    year: Number(body.year),
    make: String(body.make ?? "").trim().slice(0, 40),
    model: String(body.model ?? "").trim().slice(0, 60),
    miles: Number(body.miles),
    titleStatus: body.titleStatus,
    owners: Number(body.owners),
    reportedAccidents: Number(body.reportedAccidents),
    defects: body.defects,
    documentation: {
      vin: body.documentation?.vin
        ? String(body.documentation.vin).toUpperCase().slice(0, 17)
        : null,
      hasServiceRecords: Boolean(body.documentation?.hasServiceRecords),
      smogCurrent: Boolean(body.documentation?.smogCurrent),
      registrationCurrent: Boolean(body.documentation?.registrationCurrent),
      hasVehicleHistoryReport: Boolean(
        body.documentation?.hasVehicleHistoryReport
      ),
      // El conteo se toma de las fotos que realmente llegaron, no del
      // número que diga el cliente.
      photoCount: Array.isArray(body.photos) ? body.photos.length : 0,
    },
    knownIssues: String(body.knownIssues ?? "").trim().slice(0, 2000),
    // Texto plano. Nunca HTML: el anuncio se muestra en una página
    // pública y aceptar marcado de un desconocido es abrir la puerta
    // a inyección de scripts.
    description: String(body.description ?? "").trim().slice(0, 1200),
    city: String(body.city ?? "").trim().slice(0, 60),
    bodyType: body.bodyType ?? "sedan",
    fuelType: body.fuelType ?? "gasoline",
    transmission: body.transmission ?? "automatic",
  };

  const check = validateListing(listing);
  if (!check.valid) {
    return NextResponse.json(
      { error: "validation", fields: check.errors },
      { status: 422 }
    );
  }

  const name = String(body.seller?.name ?? "").trim().slice(0, 80);

  // Se vuelve a validar aquí: lo que valida el navegador es una
  // cortesía, no una garantía.
  const phone = normalizePhone(String(body.seller?.phone ?? ""));
  if (!phone || !name) {
    return NextResponse.json(
      { error: "invalid_seller", fields: { phone: !phone, name: !name } },
      { status: 422 }
    );
  }

  // Obligatorio: es el respaldo del enlace de edición.
  const rawEmail = String(body.seller?.email ?? "").trim();
  if (!rawEmail || !isValidEmail(rawEmail)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  }

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count
    FROM listings
    WHERE seller_phone = ${phone}
      AND created_at > NOW() - INTERVAL '24 hours'
  `;

  if (count >= DAILY_LIMIT) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  const scored = scoreListing(listing);

  // Enlace secreto de edición. Se devuelve UNA vez, al publicar: no
  // hay forma de recuperarlo después, y eso es intencional — poder
  // pedirlo por correo sería poder robarlo por correo.
  const editToken = createEditToken();

  const photos = (Array.isArray(body.photos) ? body.photos : [])
    .filter((url: unknown) => typeof url === "string")
    .slice(0, 24);

  const [row] = await sql`
    INSERT INTO listings (
      year, make, model, miles, price,
      body_type, fuel_type, transmission,
      title_status, owners, reported_accidents,
      defects, documentation, known_issues, description, city,
      photos, seller_name, seller_phone, seller_email,
      score, level_key, confidence, confidence_level, flags, categories,
      locale, status, edit_token
    ) VALUES (
      ${listing.year}, ${listing.make}, ${listing.model}, ${listing.miles},
      ${body.price ? Number(body.price) : null},
      ${listing.bodyType}, ${listing.fuelType}, ${listing.transmission},
      ${listing.titleStatus}, ${listing.owners}, ${listing.reportedAccidents},
      ${JSON.stringify(listing.defects)},
      ${JSON.stringify(listing.documentation)},
      ${listing.knownIssues}, ${listing.description}, ${listing.city},
      ${JSON.stringify(photos)},
      ${name}, ${phone},
      ${rawEmail || null},
      ${scored.score}, ${scored.levelKey},
      ${scored.confidence}, ${scored.confidenceLevel},
      ${JSON.stringify(scored.flags)}, ${JSON.stringify(scored.categories)},
      ${body.locale === "en" ? "en" : "es"},
      'pending', ${editToken}
    )
    RETURNING id
  `;

    const locale = body.locale === "en" ? "en" : "es";

    /**
     * Los avisos van DESPUÉS de que la fila está guardada y con
     * `await`: en una función serverless, lo que no se espera se
     * corta cuando la respuesta se va.
     *
     * Aun así no pueden tumbar la publicación — notifyNewListing
     * atrapa todo por dentro. Si el correo falla, el anuncio ya
     * existe, y eso es lo que importa.
     */
    await notifyNewListing(
      {
        id: row.id,
        name: `${listing.year} ${listing.make} ${listing.model}`.trim(),
        price: body.price ? Number(body.price) : null,
        city: listing.city,
        score: scored.score,
        confidence: scored.confidence,
        flags: scored.flags,
        sellerName: name,
        sellerPhone: phone,
        sellerEmail: rawEmail || null,
        editUrl: editUrl(
          locale === "en" ? `${SITE_URL}/en` : SITE_URL,
          row.id,
          editToken
        ),
      },
      locale
    );

  return NextResponse.json({
      ok: true,
      id: row.id,
      score: scored.score,
      confidence: scored.confidence,
      editToken,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("create listing failed:", detail);

    // El mensaje de Postgres va al cliente: es lo que convirtió
    // varias sesiones de adivinanza en un diagnóstico inmediato.
    return NextResponse.json(
      { error: "insert_failed", detail },
      { status: 500 }
    );
  }
}
