import { createHash } from "node:crypto";

/**
 * Reputación del vendedor, basada en hechos y no en opiniones.
 *
 * La tentación es poner estrellas: el comprador califica al vendedor
 * después de la venta. El problema es que sin cuentas nadie impide
 * que un vendedor se ponga cinco estrellas desde otro teléfono, ni
 * que un competidor le ponga una. Un sistema de estrellas que se
 * puede inflar es peor que no tener nada, porque el comprador le cree.
 *
 * Aquí la reputación sale de lo que el sitio ya observa y no se puede
 * fingir: cuántos autos ha publicado, cuántos vendió, hace cuánto que
 * está, y si alguno le fue retirado. Eso es verificable.
 *
 * El identificador es el teléfono, hasheado. No se guarda en claro en
 * la tabla de historial: si esa tabla se filtrara, no sería una lista
 * de teléfonos.
 */

export function sellerKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const salt = process.env.SELLER_SALT ?? "";
  return createHash("sha256").update(`${salt}:${digits}`).digest("hex");
}

export interface SellerHistory {
  totalListings: number;
  sold: number;
  active: number;
  rejected: number;
  firstListingAt: string | null;
  /** Meses desde el primer anuncio. */
  monthsActive: number;
}

export type SellerBadge =
  | "new"
  | "returning"
  | "established"
  | "flagged"
  | null;

/**
 * La insignia que se muestra junto al anuncio.
 *
 * "Nuevo" no es un castigo, es un dato: todos empiezan ahí, y decirlo
 * es más honesto que no decir nada y dejar que el comprador asuma.
 */
export function getSellerBadge(history: SellerHistory): SellerBadge {
  if (history.rejected > 0) return "flagged";
  if (history.sold >= 3 && history.monthsActive >= 3) return "established";
  if (history.sold >= 1 || history.totalListings >= 2) return "returning";
  if (history.totalListings <= 1) return "new";
  return null;
}

export function monthsBetween(from: Date, to = new Date()) {
  return Math.max(
    0,
    Math.floor((to.getTime() - from.getTime()) / (30 * 86_400_000))
  );
}
