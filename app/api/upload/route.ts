import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

/**
 * Sube una foto y devuelve su URL.
 *
 * Los límites de tipo y tamaño se comprueban aquí, no en el navegador:
 * el input file del cliente es una sugerencia, no una barrera.
 *
 * Si algo falla, el error real se devuelve en el cuerpo de la
 * respuesta. Un 500 mudo obliga a adivinar, y adivinar cuesta horas.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no_file" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "bad_type", detail: file.type },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "too_large" }, { status: 413 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    // Sin addRandomSuffix: esa opción ya no se acepta junto con
    // access "public" en las versiones nuevas del paquete. El nombre
    // aleatorio lo ponemos nosotros, que además evita colisiones.
    const blob = await put(
      `listings/${crypto.randomUUID()}.${extension}`,
      file,
      { access: "public", contentType: file.type }
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("upload failed:", detail);
    return NextResponse.json({ error: "upload_failed", detail }, { status: 500 });
  }
}
