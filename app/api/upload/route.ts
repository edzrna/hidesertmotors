import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

/**
 * Sube una foto y devuelve su URL.
 *
 * Los límites de tipo y tamaño se comprueban aquí, no en el navegador:
 * el input file del cliente es una sugerencia, no una barrera.
 */

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "bad_type" }, { status: 415 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const blob = await put(`listings/${crypto.randomUUID()}`, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}
