import { randomBytes } from "node:crypto";

/**
 * Edición sin cuentas: un enlace secreto por anuncio.
 *
 * Crear cuentas para publicar un auto ahuyenta a la mitad de la gente.
 * En su lugar, cada anuncio lleva un token largo y aleatorio; quien
 * tenga el enlace puede editarlo. Es el modelo de Craigslist y
 * funciona porque 32 bytes son imposibles de adivinar.
 */

export function createEditToken() {
  return randomBytes(32).toString("base64url");
}

export function editUrl(base: string, id: string | number, token: string) {
  return `${base}/editar/${id}?t=${token}`;
}

/* ============================================================
   QUÉ SE PUEDE CAMBIAR Y QUÉ NO
   ============================================================ */

/**
 * Los datos que describen el vehículo se congelan al publicar.
 *
 * La razón no es técnica. Si el vendedor puede cambiar el título de
 * Salvage a Limpio después de que aprobaste el anuncio, la declaración
 * firmada no vale nada y la calificación miente. Volver a revisar no
 * lo arregla: sólo agrega trabajo y deja la puerta abierta.
 *
 * Quien de verdad se equivocó al declarar, borra el anuncio y publica
 * de nuevo. Eso obliga a una declaración nueva y a otra revisión, que
 * es exactamente lo correcto.
 */
export const LOCKED_FIELDS = [
  "year",
  "make",
  "model",
  "miles",
  "titleStatus",
  "owners",
  "reportedAccidents",
  "defects",
  "knownIssues",
  "vin",
  "documentation",
] as const;

/** Presentación y contacto: corregir esto no cambia lo declarado. */
export const EDITABLE_FIELDS = [
  "price",
  "description",
  "city",
  "photos",
  "sellerName",
  "sellerPhone",
  "sellerEmail",
] as const;
