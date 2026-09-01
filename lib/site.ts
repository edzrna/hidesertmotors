/**
 * Datos del sitio.
 *
 * Ya no hay teléfono de contacto propio: Hi Desert Motors publica
 * anuncios, no vende. Cada anuncio lleva el teléfono de su vendedor,
 * guardado con el anuncio.
 *
 * El correo se queda porque es el canal para soporte del sitio,
 * reportes de anuncios y solicitudes de privacidad, no para vender.
 */

export const SITE_URL = "https://www.hidesertmotors.com";

/**
 * Correo de contacto público.
 *
 * Apunta a Gmail y no a contacto@hidesertmotors.com porque ese buzón
 * dejó de recibir: al pasar a Custom MX para poder ENVIAR con el
 * dominio, se perdió el reenvío gratuito de Namecheap.
 *
 * Publicar una dirección que rebota es peor que publicar un Gmail: el
 * buzón roto no avisa. Nadie te escribe y no sabes si es porque no
 * quieren o porque no llega.
 *
 * Para volver a contacto@hidesertmotors.com hace falta un buzón real
 * —Zoho Mail tiene plan gratis para un dominio— y entonces se cambia
 * esta línea de vuelta.
 */
export const CONTACT_EMAIL = "edzrna@gmail.com";
export const FACEBOOK_URL = "https://facebook.com/hidesertmotors";
