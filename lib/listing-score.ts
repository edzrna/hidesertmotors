/**
 * CALIFICACIÓN HDM — versión para anuncios de particulares
 *
 * Diferencia central con la versión de dealer:
 *
 * El vendedor califica su propio auto, así que cualquier campo de
 * autoevaluación ("condición: excelente / bueno / regular") se vuelve
 * ruido: todos eligen la mejor opción. Aquí no existe ese campo.
 *
 * En su lugar se pregunta por defectos concretos y falsables. "¿Enciende
 * la luz de check engine?" se puede comprobar en dos minutos; "está en
 * excelente estado" no se puede comprobar nunca.
 *
 * Se devuelven DOS números:
 *   score      — qué tan bueno es el auto según lo declarado
 *   confidence — cuánto de eso está respaldado con documentos
 *
 * Los dos se muestran juntos. Un 92 sin respaldo no es lo mismo que un
 * 85 con VIN, smog y registros de servicio.
 */

/* ============================================================
   CAMPOS DEL FORMULARIO
   ============================================================ */

export type TitleStatus =
  | "clean"
  | "clean_lien"
  | "rebuilt"
  | "salvage"
  | "no_title";

export type TireCondition = "new" | "good" | "worn" | "needs_replacing";

/** Cada casilla es un hecho concreto que el comprador puede verificar. */
export interface DefectReport {
  // Motor y transmisión
  checkEngineOn: boolean;
  otherWarningLights: boolean;
  startsEveryTime: boolean;
  transmissionSlips: boolean;
  overheats: boolean;
  leaksFluid: boolean;
  unusualNoises: boolean;

  // Sistemas
  acWorks: boolean;
  heatWorks: boolean;
  allWindowsWork: boolean;
  brakesFeelNormal: boolean;

  // Carrocería e interior
  hasRust: boolean;
  hasDents: boolean;
  glassCracked: boolean;
  interiorTorn: boolean;
  smokedIn: boolean;

  tires: TireCondition;
}

/** Documentación: no cambia qué tan bueno es el auto, cambia cuánto se le cree. */
export interface Documentation {
  vin: string | null;
  hasServiceRecords: boolean;
  smogCurrent: boolean;
  registrationCurrent: boolean;
  hasVehicleHistoryReport: boolean;
  photoCount: number;
}

export interface Listing {
  id: string;
  year: number;
  make: string;
  model: string;
  miles: number;

  titleStatus: TitleStatus;
  owners: number;
  reportedAccidents: number;

  defects: DefectReport;
  documentation: Documentation;

  /** Texto libre obligatorio. Vacío no cuenta como "sin problemas". */
  knownIssues: string;
}

/* ============================================================
   PESOS
   El peso está donde el dato es verificable. El título y las millas
   pesan más que nada porque se comprueban con un papel.
   ============================================================ */

export const WEIGHTS = {
  title: 0.24,
  mechanical: 0.24,
  miles: 0.18,
  history: 0.14,
  age: 0.12,
  cosmetic: 0.08,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/* ============================================================
   COMPONENTES
   ============================================================ */

function titleScore(status: TitleStatus) {
  const map: Record<TitleStatus, number> = {
    clean: 100,
    clean_lien: 88, // limpio, pero hay que liquidar el gravamen
    rebuilt: 68,
    salvage: 55,
    no_title: 40, // sin título no se puede transferir: bandera roja
  };
  return map[status];
}

function milesScore(miles: number) {
  if (miles <= 30000) return 98;
  if (miles <= 60000) return 90;
  if (miles <= 90000) return 80;
  if (miles <= 130000) return 70;
  if (miles <= 180000) return 60;
  return 50;
}

function ageScore(year: number, currentYear = new Date().getFullYear()) {
  const age = currentYear - year;
  if (age <= 2) return 98;
  if (age <= 5) return 90;
  if (age <= 9) return 80;
  if (age <= 14) return 70;
  if (age <= 20) return 60;
  return 52;
}

function historyScore(owners: number, accidents: number) {
  let score = 88;

  if (owners === 1) score += 8;
  if (owners === 2) score += 2;
  if (owners >= 4) score -= 10;
  else if (owners === 3) score -= 4;

  if (accidents === 1) score -= 12;
  if (accidents === 2) score -= 22;
  if (accidents >= 3) score -= 32;

  return clamp(score, 40, 100);
}

/**
 * Mecánica: se parte de 100 y se descuenta por cada defecto declarado.
 *
 * Los castigos son deliberadamente duros en lo que cuesta caro arreglar.
 * Una transmisión que patina o un motor que se sobrecalienta pueden valer
 * más que el auto, y el comprador tiene que verlo reflejado en el número.
 */
function mechanicalScore(d: DefectReport) {
  let score = 100;

  if (d.transmissionSlips) score -= 30;
  if (d.overheats) score -= 28;
  if (!d.startsEveryTime) score -= 22;
  if (d.checkEngineOn) score -= 18;
  if (!d.brakesFeelNormal) score -= 16;
  if (d.leaksFluid) score -= 12;
  if (d.unusualNoises) score -= 10;
  if (d.otherWarningLights) score -= 8;
  if (!d.acWorks) score -= 6;
  if (!d.heatWorks) score -= 4;
  if (!d.allWindowsWork) score -= 3;

  const tirePenalty: Record<TireCondition, number> = {
    new: 0,
    good: 0,
    worn: 5,
    needs_replacing: 10,
  };
  score -= tirePenalty[d.tires];

  return clamp(score, 30, 100);
}

function cosmeticScore(d: DefectReport) {
  let score = 100;

  if (d.hasRust) score -= 20;
  if (d.glassCracked) score -= 12;
  if (d.hasDents) score -= 10;
  if (d.interiorTorn) score -= 8;
  if (d.smokedIn) score -= 8;

  return clamp(score, 40, 100);
}

/* ============================================================
   NIVEL DE RESPALDO
   No mide el auto: mide cuánto se puede comprobar de lo declarado.
   Es lo que premia al vendedor honesto.
   ============================================================ */

export type ConfidenceLevel = "low" | "medium" | "high";

export function getConfidence(doc: Documentation) {
  let points = 0;

  // El VIN es lo más valioso: con él el comprador verifica todo lo demás.
  if (doc.vin && /^[A-HJ-NPR-Z0-9]{17}$/i.test(doc.vin)) points += 30;
  if (doc.hasVehicleHistoryReport) points += 20;
  if (doc.hasServiceRecords) points += 18;
  if (doc.smogCurrent) points += 14;
  if (doc.registrationCurrent) points += 8;

  if (doc.photoCount >= 12) points += 10;
  else if (doc.photoCount >= 6) points += 6;
  else if (doc.photoCount >= 3) points += 3;

  const score = clamp(points, 0, 100);
  const level: ConfidenceLevel =
    score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return { score, level };
}

/* ============================================================
   RESULTADO
   ============================================================ */

export type LevelKey = "good_option" | "good_deal" | "great_buy" | "best_option";

export function getHDMLevel(score: number): LevelKey {
  if (score >= 90) return "best_option";
  if (score >= 80) return "great_buy";
  if (score >= 70) return "good_deal";
  return "good_option";
}

export interface ScoredListing {
  score: number;
  levelKey: LevelKey;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  breakdown: Record<keyof typeof WEIGHTS, number>;
  /** Puntos concretos que el comprador debería revisar en persona. */
  flags: string[];
}

export function scoreListing(listing: Listing): ScoredListing {
  const breakdown = {
    title: titleScore(listing.titleStatus),
    mechanical: mechanicalScore(listing.defects),
    miles: milesScore(listing.miles),
    history: historyScore(listing.owners, listing.reportedAccidents),
    age: ageScore(listing.year),
    cosmetic: cosmeticScore(listing.defects),
  };

  const total = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce(
    (sum, key) => sum + breakdown[key] * WEIGHTS[key],
    0
  );

  const confidence = getConfidence(listing.documentation);

  return {
    score: Math.round(clamp(total, 40, 100)),
    levelKey: getHDMLevel(Math.round(clamp(total, 40, 100))),
    confidence: confidence.score,
    confidenceLevel: confidence.level,
    breakdown,
    flags: getFlags(listing),
  };
}

/**
 * Banderas: lo que el comprador debe verificar antes de pagar.
 *
 * Aparecen en el anuncio a la vista. No son un castigo al vendedor —
 * son la razón por la que el sitio sirve para algo.
 */
function getFlags(listing: Listing): string[] {
  const flags: string[] = [];
  const d = listing.defects;

  if (listing.titleStatus === "salvage") flags.push("title_salvage");
  if (listing.titleStatus === "rebuilt") flags.push("title_rebuilt");
  if (listing.titleStatus === "clean_lien") flags.push("title_lien");
  if (listing.titleStatus === "no_title") flags.push("title_missing");

  if (d.transmissionSlips) flags.push("transmission");
  if (d.overheats) flags.push("overheating");
  if (!d.startsEveryTime) flags.push("starting");
  if (d.checkEngineOn) flags.push("check_engine");
  if (!d.brakesFeelNormal) flags.push("brakes");
  if (d.hasRust) flags.push("rust");

  if (listing.reportedAccidents >= 2) flags.push("multiple_accidents");
  if (listing.miles >= 180000) flags.push("high_miles");
  if (!listing.documentation.smogCurrent) flags.push("no_smog");

  return flags;
}

/* ============================================================
   VALIDACIÓN
   Un anuncio incompleto no se publica. Sin esto, "no contestó" se
   confunde con "no tiene ese problema", que es justo el hueco por
   donde se cuela la mentira por omisión.
   ============================================================ */

export function validateListing(listing: Partial<Listing>) {
  const errors: Record<string, string> = {};
  const year = new Date().getFullYear();

  if (!listing.year || listing.year < 1900 || listing.year > year + 1)
    errors.year = "required";
  if (!listing.make?.trim()) errors.make = "required";
  if (!listing.model?.trim()) errors.model = "required";
  if (listing.miles == null || listing.miles < 0 || listing.miles > 999999)
    errors.miles = "required";
  if (!listing.titleStatus) errors.titleStatus = "required";
  if (listing.owners == null || listing.owners < 1) errors.owners = "required";
  if (listing.reportedAccidents == null) errors.reportedAccidents = "required";
  if (!listing.defects) errors.defects = "required";
  if (!listing.defects?.tires) errors.tires = "required";

  // Obliga a escribir algo. "Ninguno" es una respuesta válida y firmada.
  if (!listing.knownIssues?.trim()) errors.knownIssues = "required";

  if ((listing.documentation?.photoCount ?? 0) < 3)
    errors.photos = "min_three";

  return { valid: Object.keys(errors).length === 0, errors };
}
