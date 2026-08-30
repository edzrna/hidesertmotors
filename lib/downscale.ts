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

/**
 * Reduce una foto para subirla al almacenamiento.
 *
 * Distinta de `downscaleToDataUrl`: aquí sí se guarda y se va a
 * mostrar en el anuncio, así que conserva más resolución y calidad.
 * 1600px es de sobra para verse bien en cualquier pantalla, incluida
 * la galería a pantalla completa.
 *
 * Devuelve un Blob, no base64: subir por FormData evita el 33% que
 * infla base64 y no toca el límite de tamaño de la petición.
 */
export async function downscaleForUpload(file: File): Promise<Blob> {
  const MAX_SIDE = 1600;
  const QUALITY = 0.82;

  // Si ya es chica y ligera, se sube tal cual: recomprimir sólo la
  // degrada.
  if (file.size < 500_000) return file;

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );

    // Si algo sale mal, se sube la original: es preferible una subida
    // lenta a un anuncio sin fotos.
    return blob ?? file;
  } catch {
    return file;
  }
}
