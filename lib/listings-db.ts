import { neon } from "@neondatabase/serverless";
import type {
  BodyType,
  CategoryKey,
  FuelType,
  Transmission,
} from "@/lib/listing-score";
import {
  getSellerBadge,
  monthsBetween,
  type SellerBadge,
  type SellerHistory,
} from "@/lib/seller-history";
import {
  getLevelIcon,
  type LevelKey,
  type Locale,
  type TitleStatusKey,
} from "@/lib/hdm";

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

/**
 * La conexión se crea DENTRO de cada consulta, no al cargar el módulo.
 *
 * `neon()` lanza si la cadena viene vacía. Hecho arriba, ese error
 * ocurre al importar el archivo — antes de cualquier try/catch — y
 * tumba la página entera con un 500. Aquí queda dentro del try.
 */
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL no está definida");
    return null;
  }
  return neon(url);
}

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
  city: string;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;

  image: string;
  gallery: string[];

  score: number;
  levelKey: LevelKey;
  icon: string;
  confidence: number;
  confidenceLevel: "low" | "medium" | "high";
  flags: string[];
  categories: Record<CategoryKey, number>;

  sellerName: string;
  sellerPhone: string;

  sold: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  /** Días que le quedan al anuncio. Null si no tiene caducidad. */
  daysLeft: number | null;
}

function formatPrice(value: number | null, locale: Locale) {
  if (!value) return locale === "en" ? "Ask" : "Consultar";
  return `$${value.toLocaleString(locale === "en" ? "en-US" : "es-MX")}`;
}

/**
 * Postgres devuelve jsonb ya parseado, pero si la columna se guardó
 * como texto llega en cadena. Se cubren los dos casos.
 */
function toArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: any, locale: Locale): PublicListing {
  const gallery = toArray(row.photos).filter(
    (url): url is string => typeof url === "string"
  );

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
    city: row.city ?? "",
    bodyType: (row.body_type ?? "sedan") as BodyType,
    fuelType: (row.fuel_type ?? "gasoline") as FuelType,
    transmission: (row.transmission ?? "automatic") as Transmission,

    image: gallery[0] ?? "/logo.png",
    gallery,

    score: row.score,
    levelKey: row.level_key,
    icon: getLevelIcon(row.level_key),
    confidence: row.confidence,
    confidenceLevel: row.confidence_level,
    flags: toArray(row.flags).filter(
      (flag): flag is string => typeof flag === "string"
    ),
    categories: (row.categories ?? {
      mechanical: 0,
      legal: 0,
      electrical: 0,
      cosmetic: 0,
    }) as Record<CategoryKey, number>,

    sellerName: row.seller_name,
    sellerPhone: row.seller_phone,

    sold: row.status === "sold",
    publishedAt: row.published_at ? String(row.published_at) : null,
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    daysLeft: row.expires_at
      ? Math.max(
          0,
          Math.ceil(
            (new Date(row.expires_at).getTime() - Date.now()) / 86_400_000
          )
        )
      : null,
  };
}

export async function getPublishedListings(locale: Locale) {
  try {
    const sql = getSql();
    if (!sql) return [];

    const rows = await sql`
      SELECT
        id, year, make, model, miles, price,
        title_status, owners, reported_accidents,
        description, known_issues, city, photos,
        body_type, fuel_type, transmission,
        score, level_key, confidence, confidence_level, flags, categories,
        seller_name, seller_phone,
        status, published_at, expires_at
      FROM listings
      WHERE status IN ('published', 'sold')
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY
        CASE WHEN status = 'sold' THEN 1 ELSE 0 END,
        score DESC,
        published_at DESC NULLS LAST
    `;

    return rows.map((row) => mapRow(row, locale));
  } catch (error) {
    // Una base caída no debe tumbar la página entera: el sitio se
    // muestra vacío y el error queda en los registros de Vercel.
    console.error("getPublishedListings failed", error);
    return [];
  }
}

export async function getListingById(id: string, locale: Locale) {
  // El id viene de la URL: si no es un número, no se consulta.
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;

  try {
    const sql = getSql();
    if (!sql) return null;

    const rows = await sql`
      SELECT
        id, year, make, model, miles, price,
        title_status, owners, reported_accidents,
        description, known_issues, city, photos,
        body_type, fuel_type, transmission,
        score, level_key, confidence, confidence_level, flags, categories,
        seller_name, seller_phone,
        status, published_at, expires_at
      FROM listings
      WHERE id = ${numeric}
        AND status IN ('published', 'sold')
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    return rows.length ? mapRow(rows[0], locale) : null;
  } catch (error) {
    console.error("getListingById failed", error);
    return null;
  }
}

/**
 * Anuncio para su página de edición. Sólo lo devuelve si el token
 * coincide, y a diferencia del listado público incluye el correo,
 * porque es su dueño quien lo está viendo.
 */
export async function getListingForEdit(id: string, token: string) {
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  if (!token) return null;

  try {
    const sql = getSql();
    if (!sql) return null;

    const rows = await sql`
      SELECT
        id, year, make, model, miles, price,
        title_status, owners, reported_accidents,
        description, known_issues, city, photos,
        body_type, fuel_type, transmission,
        score, level_key, confidence, confidence_level, flags, categories,
        seller_name, seller_phone, seller_email,
        status
      FROM listings
      WHERE id = ${numeric}
        AND edit_token = ${token}
        AND status IN ('pending', 'published', 'sold')
      LIMIT 1
    `;

    if (!rows.length) return null;

    const row = rows[0];
    const gallery = toArray(row.photos).filter(
      (url): url is string => typeof url === "string"
    );

    return {
      id: String(row.id),
      name: `${row.year} ${row.make} ${row.model}`.trim(),
      year: row.year as number,
      make: row.make as string,
      model: row.model as string,
      miles: row.miles as number,
      titleStatus: row.title_status as TitleStatusKey,
      owners: row.owners as number,
      accidents: row.reported_accidents as number,
      knownIssues: (row.known_issues ?? "") as string,

      price: row.price as number | null,
      description: (row.description ?? "") as string,
      city: (row.city ?? "") as string,
      photos: gallery,
      sellerName: row.seller_name as string,
      sellerPhone: row.seller_phone as string,
      sellerEmail: (row.seller_email ?? "") as string,

      score: row.score as number,
      levelKey: row.level_key as LevelKey,
      status: row.status as string,
    };
  } catch (error) {
    console.error("getListingForEdit failed", error);
    return null;
  }
}

export type EditableListing = NonNullable<
  Awaited<ReturnType<typeof getListingForEdit>>
>;

/**
 * Historial de un vendedor, contado desde sus propios anuncios.
 *
 * Se agrupa por teléfono porque es lo único estable que tenemos sin
 * cuentas. No es infalible —alguien puede cambiar de número— pero
 * cambiar de número también borra tu historial, así que el incentivo
 * apunta al lado correcto.
 */
export async function getSellerHistory(
  phone: string
): Promise<{ history: SellerHistory; badge: SellerBadge } | null> {
  if (!phone) return null;

  try {
    const sql = getSql();
    if (!sql) return null;

    const rows = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'sold')::int AS sold,
        COUNT(*) FILTER (WHERE status = 'published')::int AS active,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
        MIN(created_at) AS first_at
      FROM listings
      WHERE seller_phone = ${phone}
    `;

    const row = rows[0];
    const firstAt = row.first_at ? new Date(row.first_at) : null;

    const history: SellerHistory = {
      totalListings: row.total ?? 0,
      sold: row.sold ?? 0,
      active: row.active ?? 0,
      rejected: row.rejected ?? 0,
      firstListingAt: firstAt ? firstAt.toISOString() : null,
      monthsActive: firstAt ? monthsBetween(firstAt) : 0,
    };

    return { history, badge: getSellerBadge(history) };
  } catch (error) {
    console.error("getSellerHistory failed", error);
    return null;
  }
}

/** Enlace de WhatsApp al vendedor del anuncio, no al sitio. */
export function sellerWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
