import type { Listing } from "@/lib/listing-score";
import type { TitleStatus } from "@/lib/listing-score";

/**
 * Orientación de precio.
 *
 * Deliberadamente NO estima un valor de mercado. Para eso hace falta
 * un banco de transacciones reales; sin él, cualquier cifra sería un
 * número inventado con apariencia de dato, y alguien lo usaría para
 * poner precio a su auto.
 *
 * Lo que sí se puede hacer con fundamento es decirle al vendedor
 * CÓMO SE MUEVE su precio respecto de un auto equivalente en buen
 * estado. Los ajustes de abajo son reglas de mercado conocidas, no
 * predicciones: un título de salvamento castiga el precio, y eso no
 * es opinión.
 *
 * El número duro sale de KBB o Edmunds, y ahí lo mandamos.
 */

export interface PriceAdjustment {
  key: string;
  /** Porcentaje respecto de un auto equivalente con título limpio. */
  min: number;
  max: number;
}

/** Efecto del título. Es el factor que más pesa, con diferencia. */
const TITLE_ADJUSTMENT: Record<TitleStatus, [number, number] | null> = {
  clean: null,
  clean_lien: [-5, 0],
  rebuilt: [-40, -20],
  salvage: [-60, -35],
  no_title: [-80, -50],
};

export function getPriceAdjustments(listing: Listing): PriceAdjustment[] {
  const out: PriceAdjustment[] = [];

  const title = TITLE_ADJUSTMENT[listing.titleStatus];
  if (title) {
    out.push({ key: `title_${listing.titleStatus}`, min: title[0], max: title[1] });
  }

  // Las millas se comparan contra el promedio de ~12,000 al año.
  const age = Math.max(1, new Date().getFullYear() - listing.year);
  const expected = age * 12000;
  const ratio = listing.miles / expected;

  if (ratio < 0.65) out.push({ key: "miles_low", min: 5, max: 15 });
  else if (ratio > 1.6) out.push({ key: "miles_high", min: -20, max: -10 });
  else if (ratio > 1.25) out.push({ key: "miles_above", min: -12, max: -5 });

  if (listing.reportedAccidents >= 2) {
    out.push({ key: "accidents_many", min: -25, max: -12 });
  } else if (listing.reportedAccidents === 1) {
    out.push({ key: "accidents_one", min: -15, max: -7 });
  }

  const d = listing.defects;

  // Un problema de motor o transmisión no descuenta un porcentaje:
  // saca al auto del mercado de compradores normales.
  if (d.transmissionSlips || d.overheats || !d.startsEveryTime) {
    out.push({ key: "major_mechanical", min: -50, max: -25 });
  } else if (d.checkEngineOn) {
    out.push({ key: "check_engine", min: -18, max: -8 });
  }

  if (d.hasRust) out.push({ key: "rust", min: -15, max: -6 });
  if (!d.acWorks) out.push({ key: "no_ac", min: -8, max: -3 });
  if (d.tires === "needs_replacing") out.push({ key: "tires", min: -6, max: -3 });

  if (listing.owners === 1) out.push({ key: "one_owner", min: 3, max: 8 });

  // El respaldo no cambia el valor del auto, pero sí lo que un
  // comprador está dispuesto a pagar sin regatear.
  if (
    listing.documentation.hasServiceRecords &&
    listing.documentation.smogCurrent
  ) {
    out.push({ key: "documented", min: 3, max: 10 });
  }

  return out;
}

/** Suma de los ajustes, acotada para no producir absurdos. */
export function getTotalAdjustment(adjustments: PriceAdjustment[]) {
  const min = adjustments.reduce((sum, a) => sum + a.min, 0);
  const max = adjustments.reduce((sum, a) => sum + a.max, 0);

  return {
    min: Math.max(-85, Math.min(40, min)),
    max: Math.max(-80, Math.min(50, max)),
  };
}

/**
 * Enlace a KBB con la marca y el modelo. No se puede prellenar todo
 * —su formulario cambia— pero llegar a la marca correcta ahorra
 * pasos.
 */
export function kbbUrl(listing: Listing) {
  const slug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return `https://www.kbb.com/${slug(listing.make)}/${slug(
    listing.model
  )}/${listing.year}/`;
}
