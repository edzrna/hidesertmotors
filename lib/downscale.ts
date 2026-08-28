/**
 * Reduce una imagen en el navegador antes de mandarla al análisis.
 *
 * Vercel corta las peticiones en 4.5 MB, y base64 infla el tamaño un
 * 33%. Cuatro fotos de celular sin tocar se pasan del límite solas.
 *
 * Encogerlas no cuesta calidad de análisis: los modelos de visión
 * reducen la imagen de todos modos antes de leerla. Mandar 4000px es
 * pagar ancho de banda por píxeles que nadie mira.
 */

const MAX_SIDE = 1280;
const QUALITY = 0.72;

export async function downscaleToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // JPEG siempre, aunque el original sea PNG: una foto de un auto en
  // PNG pesa varias veces más sin verse mejor.
  return canvas.toDataURL("image/jpeg", QUALITY);
}

/** Tamaño aproximado en bytes de un data URL base64. */
export function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

/** Margen de seguridad bajo el límite de Vercel. */
export const PAYLOAD_LIMIT = 3_500_000;
