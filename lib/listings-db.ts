import { neon } from "@neondatabase/serverless";
import { getLevelIcon, type LevelKey, type Locale, type TitleStatusKey } from "@/lib/hdm";

/**
 * Lectura de anuncios publicados.
 *
 * Sólo devuelve filas con status = 'published'. Un anuncio en
 * 'pending' no existe para el público: si algún día se filtra uno sin
 * revisar, es porque alguien cambió esta condición.
 *
 * Tampoco devuelve nunca el correo del vendedor. El teléfono sí,
 * porque es el punto de contacto del anuncio.
 */

const sql = neon(process.env.DATABASE_URL!);

export interface PublicListing {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  miles: number;
  priceValue: number | null;
  priceText: string;
  titleStatus: TitleStatusKey;
  owners: number;
  accidents: number;

  description: string;
  knownIssues: string;

  image: string;
  gallery: string[];

  score: number;
  levelKey: LevelKey;
  icon: string;
  confidence: number;
  confidenceLevel: "low" | "medium" | "high";
  flags: string[];

  sellerName: string;
  sellerPhone: string;

  sold: boolean;
  publishedAt: string | null;
}

function formatPrice(value: number | null, locale: Locale) {
  if (!value) return locale === "en" ? "Ask" : "Consultar";
  return `$${value.toLocaleString(locale === "en" ? "en-US" : "es-MX")}`;
}

function mapRow(row: any, locale: Locale): PublicListing {
  const gallery: string[] = Array.isArray(row.photos) ? row.photos : [];

  return {
    id: String(row.id),
    name: `${row.year} ${row.make} ${row.model}`.trim(),
    year: row.year,
    make: row.make,
    model: row.model,
    miles: row.miles,
    priceValue: row.price,
    priceText: formatPrice(row.price, locale),
    titleStatus: row.title_status,
    owners: row.owners,
    accidents: row.reported_accidents,

    description: row.description ?? "",
    knownIssues: row.known_issues ?? "",

    image: gallery[0] ?? "/logo.png",
    gallery,

    score: row.score,
    levelKey: row.level_key,
    icon: getLevelIcon(row.level_key),
    confidence: row.confidence,
    confidenceLevel: row.confidence_level,
    flags: Array.isArray(row.flags) ? row.flags : [],

    sellerName: row.seller_name,
    sellerPhone: row.seller_phone,

    sold: row.status === "sold",
    publishedAt: row.published_at ? String(row.published_at) : null,
  };
}

/** Columnas públicas. seller_email queda fuera a propósito. */
const COLUMNS = `
  id, year, make, model, miles, price,
  title_status, owners, reported_accidents,
  description, known_issues, photos,
  score, level_key, confidence, confidence_level, flags,
  seller_name, seller_phone,
  status, published_at
`;

export async function getPublishedListings(locale: Locale) {
  const rows = await sql`
    SELECT ${sql.unsafe(COLUMNS)}
    FROM listings
    WHERE status IN ('published', 'sold')
    ORDER BY
      CASE WHEN status = 'sold' THEN 1 ELSE 0 END,
      score DESC,
      published_at DESC NULLS LAST
  `;

  return rows.map((row) => mapRow(row, locale));
}

export async function getListingById(id: string, locale: Locale) {
  // El id viene de la URL: si no es un número, no se consulta.
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;

  const rows = await sql`
    SELECT ${sql.unsafe(COLUMNS)}
    FROM listings
    WHERE id = ${numeric}
      AND status IN ('published', 'sold')
    LIMIT 1
  `;

  return rows.length ? mapRow(rows[0], locale) : null;
}

/** Enlace de WhatsApp al vendedor del anuncio, no al sitio. */
export function sellerWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
