import type { Locale, ScoredVehicle } from "./hdm";

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
   Los nombres vienen como "2024 GMC Canyon AT4X": primero el año,
   luego la marca. Quitamos el año y tomamos la marca de lo que queda.

   Las marcas de dos palabras hay que reconocerlas a mano, porque
   partir por espacios dejaría "Land" y "Alfa" sueltas.

   Si algún día agregas un campo `make` a vehicles.ts, esta función
   lo usa y deja de adivinar.
   ============================================================ */

const TWO_WORD_MAKES = [
  "land rover",
  "alfa romeo",
  "aston martin",
  "range rover",
];

export function getMake(vehicle: ScoredVehicle): string {
  const explicit = (vehicle as { make?: string }).make;
  if (explicit) return explicit;

  // Quita el año inicial si lo trae
  const withoutYear = vehicle.name.replace(/^\s*\d{4}\s+/, "").trim();
  const lower = withoutYear.toLowerCase();

  const twoWord = TWO_WORD_MAKES.find((make) => lower.startsWith(make));
  if (twoWord) {
    return withoutYear.slice(0, twoWord.length);
  }

  return withoutYear.split(/\s+/)[0] || vehicle.name;
}

/** Marcas presentes en el inventario, ordenadas alfabéticamente */
export function getMakes(vehicles: ScoredVehicle[]): string[] {
  const seen = new Map<string, string>();

  vehicles.forEach((vehicle) => {
    const make = getMake(vehicle);
    const key = make.toLowerCase();
    if (!seen.has(key)) seen.set(key, make);
  });

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/* ============================================================
   ORDEN
   ============================================================ */

function compareBy(key: SortKey, locale: Locale) {
  return (a: ScoredVehicle, b: ScoredVehicle) => {
    switch (key) {
      case "score_desc":
        return b.score - a.score;
      case "price_asc":
        return a.priceValue - b.priceValue;
      case "price_desc":
        return b.priceValue - a.priceValue;
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
  vehicles: ScoredVehicle[],
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
  vehicles: ScoredVehicle[],
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
