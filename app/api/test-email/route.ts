import { NextResponse } from "next/server";

/**
 * Diagnóstico del correo.
 *
 * Existe porque "no me llegó nada" tiene cinco causas posibles y
 * ninguna se distingue desde fuera: variable sin poner, clave
 * inválida, dominio sin verificar, remitente rechazado, o el correo
 * en spam.
 *
 * Abre en el navegador:
 *   /api/test-email          → sólo revisa la configuración
 *   /api/test-email?send=1   → además manda un correo de prueba
 *
 * Sólo envía al NOTIFY_ADMIN_EMAIL configurado, nunca a una
 * dirección que venga en la petición.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  const admin = process.env.NOTIFY_ADMIN_EMAIL;

  const config = {
    RESEND_API_KEY: key
      ? `configurada (${key.slice(0, 6)}…, ${key.length} caracteres)`
      : "FALTA",
    NOTIFY_FROM: from ?? "FALTA",
    NOTIFY_ADMIN_EMAIL: admin ?? "FALTA",
  };

  const problemas: string[] = [];

  if (!key) problemas.push("Falta RESEND_API_KEY en Vercel.");
  else if (!key.startsWith("re_"))
    problemas.push("RESEND_API_KEY no empieza con 're_': revisa que sea la clave correcta.");

  if (!from) problemas.push("Falta NOTIFY_FROM en Vercel.");
  else if (!from.includes("@"))
    problemas.push("NOTIFY_FROM no trae una dirección de correo válida.");

  if (!admin) problemas.push("Falta NOTIFY_ADMIN_EMAIL en Vercel.");

  const destinatarios = (admin ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const url = new URL(request.url);
  const quiereEnviar = url.searchParams.get("send") === "1";

  /**
   * ?to=correo@ejemplo.com prueba el envío A UN TERCERO.
   *
   * Es la prueba que importa: con onboarding@resend.dev, Resend sólo
   * entrega al dueño de la cuenta y rechaza cualquier otro
   * destinatario. Mandarte un correo a ti mismo sale bien y no
   * demuestra nada sobre si a tus vendedores les llega.
   */
  const destinoPrueba = url.searchParams.get("to");

  const usandoRemitenteDePrueba = (from ?? "").includes("resend.dev");

  if (usandoRemitenteDePrueba) {
    problemas.push(
      "NOTIFY_FROM usa onboarding@resend.dev. Con ese remitente, Resend SÓLO entrega al correo dueño de la cuenta: a los vendedores NO les llega nada. Verifica hidesertmotors.com en Resend y cambia NOTIFY_FROM."
    );
  }

  if (!quiereEnviar) {
    return NextResponse.json({
      paso: "Sólo revisión de configuración",
      config,
      destinatarios,
      problemas: problemas.length ? problemas : ["Ninguno detectado."],
      siguiente: problemas.length
        ? "Corrige lo de arriba en Vercel → Settings → Environment Variables, marca Production y Preview, y haz Redeploy."
        : "Todo listo. Abre /api/test-email?send=1 para mandar un correo de prueba.",
    });
  }

  // Los avisos sobre el remitente de prueba no impiden enviar: son
  // justamente lo que se quiere comprobar.
  const bloqueantes = problemas.filter((p) => p.startsWith("Falta"));

  if (bloqueantes.length) {
    return NextResponse.json(
      { error: "configuracion_incompleta", config, problemas },
      { status: 400 }
    );
  }

  // La respuesta de Resend se devuelve tal cual: ahí está el motivo
  // real cuando algo falla.
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to: destinoPrueba ? [destinoPrueba] : destinatarios,
        subject: destinoPrueba
          ? "Prueba a un tercero — Hi Desert Motors"
          : "Prueba de correo — Hi Desert Motors",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px">
            <h2 style="margin:0 0 12px">El correo funciona</h2>
            <p style="margin:0 0 8px;color:#555">
              Si estás leyendo esto, Resend está bien configurado y los
              avisos de anuncios nuevos van a llegar aquí.
            </p>
            <p style="margin:16px 0 0;font-size:12px;color:#888">
              Enviado a: ${destinatarios.join(", ")}<br />
              Desde: ${from}
            </p>
          </div>
        `,
      }),
    });

    const cuerpo = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "resend_rechazo",
          status: res.status,
          respuestaDeResend: cuerpo,
          pista:
            res.status === 403
              ? "403 casi siempre significa que el dominio de NOTIFY_FROM no está verificado en Resend. Usa onboarding@resend.dev mientras tanto."
              : res.status === 401
              ? "401 significa que la clave es inválida o de otra cuenta."
              : "Revisa el mensaje de Resend arriba.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      avisos: problemas.length ? problemas : undefined,
      enviadoA: destinoPrueba ? [destinoPrueba] : destinatarios,
      desde: from,
      idDeResend: cuerpo.id,
      nota: "Si no llega en un minuto, revisa la carpeta de spam y el panel de Resend en Logs.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "fallo_de_red",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
