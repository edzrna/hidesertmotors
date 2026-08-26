/**
 * Ciudades del Alto Desierto.
 *
 * Lista cerrada, igual que las marcas: si el vendedor escribe la
 * ciudad a mano salen "Victorville", "victorville" y "Victovile", y el
 * filtro deja de servir.
 *
 * No se guarda la dirección: sólo la ciudad. El comprador necesita
 * saber si le queda cerca, no dónde vive el vendedor.
 */

export const CITIES = [
  "Adelanto",
  "Apple Valley",
  "Barstow",
  "Hesperia",
  "Helendale",
  "Lucerne Valley",
  "Oak Hills",
  "Phelan",
  "Piñon Hills",
  "Victorville",
  "Wrightwood",
] as const;

export type City = (typeof CITIES)[number];

export const OTHER_CITY = "__other__";

export function isKnownCity(value: string): value is City {
  return (CITIES as readonly string[]).includes(value);
}

/* ============================================================
   VALIDACIÓN DE CONTACTO
   ============================================================ */

/**
 * Teléfono de Estados Unidos: diez dígitos, o once si empieza con 1.
 *
 * Sin esto, un número mal tecleado produce un anuncio con un botón de
 * WhatsApp que no lleva a ningún lado, y el vendedor nunca se entera
 * de por qué no le llaman.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);

  return null;
}

/** Formato legible: (760) 620-6390 */
export function formatPhone(digits: string) {
  if (digits.length !== 10) return digits;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Correo: comprobación de forma, no de existencia. Verificar de verdad
 * exige mandar un mensaje, y aquí el correo es opcional.
 */
export function isValidEmail(raw: string) {
  const value = raw.trim();
  if (value.length < 5 || value.length > 120) return false;
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);
}
