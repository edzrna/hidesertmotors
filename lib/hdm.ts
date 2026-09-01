/**
 * Calificación HDM — fuente única de verdad.
 * Antes esta lógica estaba copiada en cada page.tsx. Ahora vive aquí:
 * si cambias un peso, cambia en todo el sitio.
 */

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Un campo que puede venir como texto plano (español, formato viejo)
 * o como objeto por idioma. Así vehicles.ts se puede migrar poco a poco
 * sin romper nada.
 */
export type Localized<T> = T | Partial<Record<Locale, T>>;

export function pick<T>(value: Localized<T>, locale: Locale): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Partial<Record<Locale, T>>;
    return (map[locale] ?? map[DEFAULT_LOCALE] ?? "") as T;
  }
  return value as T;
}

/* ============================================================
   NIVELES
   ============================================================ */

export type LevelKey = "good_option" | "good_deal" | "great_buy" | "best_option";

export const MOOD_SCALE: { key: LevelKey; icon: string }[] = [
  { key: "good_option", icon: "/icons/neutral.png" },
  { key: "good_deal", icon: "/icons/good.png" },
  { key: "great_buy", icon: "/icons/great.png" },
  { key: "best_option", icon: "/icons/best.png" },
];

export function getHDMLevel(score: number): LevelKey {
  if (score >= 90) return "best_option";
  if (score >= 80) return "great_buy";
  if (score >= 70) return "good_deal";
  return "good_option";
}

export function getLevelIcon(key: LevelKey) {
  return MOOD_SCALE.find((item) => item.key === key)?.icon ?? MOOD_SCALE[0].icon;
}

/* ============================================================
   VEHÍCULO
   ============================================================ */

export type ConditionKey =
  | "excelente"
  | "muy_bueno"
  | "bueno"
  | "regular"
  | "malo";

/**
 * Tenía tres valores cuando el motor ya manejaba cinco.
 *
 * El desfase no daba error de compilación porque los anuncios llegan
 * de la base como texto: TypeScript nunca vio el `clean_lien` real.
 * Se notó cuando el generador de tarjetas recibió `undefined` al
 * buscar su traducción y reventó.
 */
export type TitleStatusKey =
  | "clean"
  | "clean_lien"
  | "rebuilt"
  | "salvage"
  | "no_title";

export interface Vehicle {
  id: string;
  name: string;
  image: string;
  gallery?: string[];
  priceText: string;
  priceValue: number;
  marketPrice: number;
  details: Localized<string>;
  tag?: Localized<string>;
  year: number;
  miles: number;
  condition: ConditionKey;
  titleStatus: TitleStatusKey;
  owners: number;
  accidents: number;
  serviceRecords: boolean;
  sold?: boolean;
}

export interface ScoredVehicle extends Vehicle {
  sold: boolean;
  score: number;
  levelKey: LevelKey;
  icon: string;
}

/* ============================================================
   CÁLCULO
   Rango 60–100. Cada factor devuelve su propio 60–100 y se
   promedia con los pesos de abajo.
   ============================================================ */

export const HDM_WEIGHTS = {
  condition: 0.25,
  history: 0.25,
  miles: 0.2,
  year: 0.15,
  value: 0.15,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function conditionScore(condition: ConditionKey) {
  const map: Record<ConditionKey, number> = {
    excelente: 95,
    muy_bueno: 82,
    bueno: 72,
    regular: 66,
    malo: 60,
  };
  return map[condition] ?? 60;
}

function milesScore(miles: number) {
  if (miles <= 30000) return 95;
  if (miles <= 60000) return 85;
  if (miles <= 90000) return 78;
  if (miles <= 130000) return 70;
  return 60;
}

function yearScore(year: number) {
  if (year >= 2024) return 96;
  if (year >= 2021) return 86;
  if (year >= 2018) return 78;
  if (year >= 2014) return 70;
  return 60;
}

function historyScore(v: Pick<
  Vehicle,
  "titleStatus" | "serviceRecords" | "accidents" | "owners"
>) {
  let score = 72;

  if (v.titleStatus === "clean") score += 14;
  if (v.titleStatus === "rebuilt") score -= 8;
  if (v.titleStatus === "salvage") score -= 14;
  if (v.serviceRecords) score += 6;
  if (v.accidents === 1) score -= 6;
  if (v.accidents >= 2) score -= 12;
  if (v.owners === 1) score += 4;
  if (v.owners >= 3) score -= 6;

  return clamp(score, 60, 100);
}

function marketValueScore(price: number, marketPrice: number) {
  if (!marketPrice || marketPrice <= 0) return 70;
  const diff = ((marketPrice - price) / marketPrice) * 100;

  if (diff >= 10) return 95;
  if (diff >= 5) return 86;
  if (diff >= 0) return 78;
  if (diff >= -5) return 70;
  return 60;
}

export function getHDMScore(vehicle: Vehicle) {
  const total =
    conditionScore(vehicle.condition) * HDM_WEIGHTS.condition +
    historyScore(vehicle) * HDM_WEIGHTS.history +
    milesScore(vehicle.miles) * HDM_WEIGHTS.miles +
    yearScore(vehicle.year) * HDM_WEIGHTS.year +
    marketValueScore(vehicle.priceValue, vehicle.marketPrice) *
      HDM_WEIGHTS.value;

  return Math.round(clamp(total, 60, 100));
}

export function scoreVehicle(vehicle: Vehicle): ScoredVehicle {
  const score = getHDMScore(vehicle);
  const levelKey = getHDMLevel(score);

  return {
    ...vehicle,
    sold: Boolean(vehicle.sold),
    score,
    levelKey,
    icon: getLevelIcon(levelKey),
  };
}

export function scoreAll(list: Vehicle[]) {
  return list.map(scoreVehicle);
}

export function averageScore(list: ScoredVehicle[]) {
  if (!list.length) return 60;
  return Math.round(list.reduce((sum, v) => sum + v.score, 0) / list.length);
}

/* ============================================================
   FORMATO
   ============================================================ */

export function formatMiles(miles: number, locale: Locale) {
  return miles.toLocaleString(locale === "en" ? "en-US" : "es-MX");
}

export function localePath(locale: Locale, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean}`;
}
