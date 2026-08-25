import type { Locale } from "./hdm";
import type { PublicListing } from "./listings-db";

/**
 * Ordenamiento y filtro del inventario.
 * Igual que hdm.ts: lógica pura, sin JSX, para que sirva en cualquier vista.
 */

export const SORT_KEYS = [
  "score_desc",
  "price_asc",
  "price_desc",
  "year_desc",
  "miles_asc",
  "name_asc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const DEFAULT_SORT: SortKey = "score_desc";

export function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as readonly string[]).includes(value);
}

/* ============================================================
   MARCA
   Ya viene como columna propia del anuncio: el vendedor la eligió
   de una lista cerrada, así que no hay que deducirla del nombre.
   ============================================================ */

export function getMake(listing: PublicListing): string {
  return listing.make;
}

/** Marcas presentes en los anuncios, ordenadas alfabéticamente */
export function getMakes(listings: PublicListing[]): string[] {
  const seen = new Map<string, string>();

  listings.forEach((listing) => {
    const make = listing.make?.trim();
    if (!make) return;
    const key = make.toLowerCase();
    if (!seen.has(key)) seen.set(key, make);
  });

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/* ============================================================
   ORDEN
   ============================================================ */

function compareBy(key: SortKey, locale: Locale) {
  return (a: PublicListing, b: PublicListing) => {
    switch (key) {
      case "score_desc":
        return b.score - a.score;
      case "price_asc":
        // Los anuncios sin precio van al final en ambos sentidos.
        return (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity);
      case "price_desc":
        return (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity);
      case "year_desc":
        return b.year - a.year;
      case "miles_asc":
        return a.miles - b.miles;
      case "name_asc":
        return a.name.localeCompare(b.name, locale);
      default:
        return 0;
    }
  };
}

export function sortVehicles(
  vehicles: PublicListing[],
  key: SortKey,
  locale: Locale
) {
  const compare = compareBy(key, locale);

  return [...vehicles].sort((a, b) => {
    // Los vendidos siempre al final, sin importar el criterio elegido:
    // ocupan lugar y no se pueden comprar.
    if (a.sold !== b.sold) return a.sold ? 1 : -1;

    const result = compare(a, b);
    // Desempate estable, para que el orden no baile entre renders
    return result !== 0 ? result : a.id.localeCompare(b.id);
  });
}

/* ============================================================
   FILTRO + ORDEN EN UN PASO
   ============================================================ */

export function applyInventoryView(
  vehicles: PublicListing[],
  {
    sort,
    make,
    hideSold,
    locale,
  }: {
    sort: SortKey;
    /** null = todas las marcas */
    make: string | null;
    hideSold: boolean;
    locale: Locale;
  }
) {
  let list = vehicles;

  if (make) {
    const target = make.toLowerCase();
    list = list.filter((vehicle) => getMake(vehicle).toLowerCase() === target);
  }

  if (hideSold) {
    list = list.filter((vehicle) => !vehicle.sold);
  }

  return sortVehicles(list, sort, locale);
}
