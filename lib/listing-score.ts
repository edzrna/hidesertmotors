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

  /**
   * Anuncio libre del vendedor: por qué lo vende, qué le hizo, cómo
   * tratarlo. No entra en la calificación — es venta, no dato.
   */
  description: string;

  /** Ciudad donde está el auto. Tampoco entra en la calificación. */
  city: string;
}

/* ============================================================
   LAS CUATRO CATEGORÍAS

   Un solo número dice "84". Cuatro dicen "mecánicamente sólido pero
   con un problema legal", que es lo que el comprador necesita saber
   para decidir si va a verlo.

   Los pesos reflejan cuánto cuesta arreglar cada cosa. Una
   transmisión puede valer más que el auto; una abolladura, no.
   ============================================================ */

export type CategoryKey = "mechanical" | "legal" | "electrical" | "cosmetic";

export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  mechanical: 0.38,
  legal: 0.3,
  electrical: 0.16,
  cosmetic: 0.16,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/* ---------- Mecánica ---------- */

function milesPenalty(miles: number) {
  if (miles <= 30000) return 0;
  if (miles <= 60000) return 4;
  if (miles <= 90000) return 9;
  if (miles <= 130000) return 15;
  if (miles <= 180000) return 22;
  return 30;
}

function agePenalty(year: number, currentYear = new Date().getFullYear()) {
  const age = currentYear - year;
  if (age <= 2) return 0;
  if (age <= 5) return 3;
  if (age <= 9) return 7;
  if (age <= 14) return 12;
  if (age <= 20) return 18;
  return 24;
}

/**
 * Mecánica: motor, transmisión, frenos y desgaste.
 *
 * Los castigos son duros a propósito en lo que cuesta caro. Si el
 * número no refleja que una transmisión que patina puede valer más
 * que el auto, la calificación miente.
 */
function mechanicalScore(listing: Listing) {
  const d = listing.defects;
  let score = 100;

  if (d.transmissionSlips) score -= 34;
  if (d.overheats) score -= 32;
  if (!d.startsEveryTime) score -= 24;
  if (d.checkEngineOn) score -= 20;
  if (!d.brakesFeelNormal) score -= 18;
  if (d.leaksFluid) score -= 13;
  if (d.unusualNoises) score -= 11;

  const tirePenalty: Record<TireCondition, number> = {
    new: 0,
    good: 0,
    worn: 5,
    needs_replacing: 10,
  };
  score -= tirePenalty[d.tires];

  // Millas y año no son defectos, pero predicen desgaste.
  score -= milesPenalty(listing.miles);
  score -= agePenalty(listing.year);

  return clamp(score, 20, 100);
}

/* ---------- Legal y papeles ---------- */

function titlePenalty(status: TitleStatus) {
  const map: Record<TitleStatus, number> = {
    clean: 0,
    clean_lien: 14, // limpio, pero hay que liquidar el gravamen
    rebuilt: 34,
    salvage: 48,
    no_title: 62, // sin título no se puede transferir: bandera roja
  };
  return map[status];
}

/**
 * Legal: título, historial y papeles al día.
 *
 * Es la categoría donde un problema no se arregla con dinero: un
 * título de salvamento acompaña al auto para siempre.
 */
function legalScore(listing: Listing) {
  let score = 100;

  score -= titlePenalty(listing.titleStatus);

  if (listing.reportedAccidents === 1) score -= 12;
  if (listing.reportedAccidents === 2) score -= 22;
  if (listing.reportedAccidents >= 3) score -= 32;

  if (listing.owners === 1) score += 4;
  if (listing.owners === 3) score -= 5;
  if (listing.owners >= 4) score -= 11;

  // Sin smog vigente no se puede transferir en California.
  if (!listing.documentation.smogCurrent) score -= 12;
  if (!listing.documentation.registrationCurrent) score -= 6;

  return clamp(score, 20, 100);
}

/* ---------- Eléctrica y confort ---------- */

function electricalScore(d: DefectReport) {
  let score = 100;

  if (d.otherWarningLights) score -= 26;
  if (!d.acWorks) score -= 24;
  if (!d.heatWorks) score -= 16;
  if (!d.allWindowsWork) score -= 12;

  return clamp(score, 30, 100);
}

/* ---------- Estética ---------- */

function cosmeticScore(d: DefectReport) {
  let score = 100;

  // El óxido pesa más que el resto: no es apariencia, es estructura.
  if (d.hasRust) score -= 30;
  if (d.glassCracked) score -= 16;
  if (d.hasDents) score -= 14;
  if (d.interiorTorn) score -= 12;
  if (d.smokedIn) score -= 12;

  return clamp(score, 30, 100);
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
  /** El desglose por categoría: es lo que se enseña con los medidores. */
  categories: Record<CategoryKey, number>;
  /** Puntos concretos que el comprador debería revisar en persona. */
  flags: string[];
}

export function scoreListing(listing: Listing): ScoredListing {
  const categories: Record<CategoryKey, number> = {
    mechanical: mechanicalScore(listing),
    legal: legalScore(listing),
    electrical: electricalScore(listing.defects),
    cosmetic: cosmeticScore(listing.defects),
  };

  const total = (Object.keys(CATEGORY_WEIGHTS) as CategoryKey[]).reduce(
    (sum, key) => sum + categories[key] * CATEGORY_WEIGHTS[key],
    0
  );

  const score = Math.round(clamp(total, 40, 100));
  const confidence = getConfidence(listing.documentation);

  return {
    score,
    levelKey: getHDMLevel(score),
    confidence: confidence.score,
    confidenceLevel: confidence.level,
    categories,
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

  if (!listing.description?.trim()) errors.description = "required";
  if (!listing.city?.trim()) errors.city = "required";

  if ((listing.documentation?.photoCount ?? 0) < 3)
    errors.photos = "min_three";

  return { valid: Object.keys(errors).length === 0, errors };
}
