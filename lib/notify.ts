import { SITE_URL } from "@/lib/site";

/**
 * Avisos por correo cuando entra un anuncio.
 *
 * Dos destinatarios con propósitos distintos:
 *
 *  - Tú, para saber que hay algo por revisar sin estar consultando
 *    la base.
 *  - El vendedor, con su enlace de edición. Sin esto, quien no copie
 *    el enlace de la pantalla lo pierde para siempre y su única
 *    salida es escribirte para que le retires el anuncio a mano.
 *
 * Ninguno puede tumbar la publicación. Si el correo falla, el anuncio
 * ya está guardado y eso es lo que importa; el error queda en los
 * registros de Vercel.
 */

interface NewListingInfo {
  id: number | string;
  name: string;
  price: number | null;
  city: string;
  score: number;
  confidence: number;
  flags: string[];
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string | null;
  editUrl: string;
  reviewUrl: string | null;
  photoCount: number;
}

/**
 * Destinatarios administrativos.
 *
 * NOTIFY_ADMIN_EMAIL acepta varios separados por coma, así todo lo
 * que llega al correo del sitio llega también al personal sin
 * depender de que el reenvío del dominio esté bien configurado.
 */
function adminRecipients(): string[] {
  return (process.env.NOTIFY_ADMIN_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;

  if (!key || !from) {
    console.error("Falta RESEND_API_KEY o NOTIFY_FROM");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      // El cuerpo de Resend dice el motivo real: dominio sin
      // verificar, clave inválida, destinatario rechazado.
      console.error("resend failed", await res.text().catch(() => ""));
    }
  } catch (error) {
    console.error("resend error", error);
  }
}

/* ============================================================
   EL AVISO PARA TI
   ============================================================ */

async function notifyAdmin(listing: NewListingInfo) {
  const to = adminRecipients();
  if (!to.length) return;

  const price = listing.price
    ? `$${listing.price.toLocaleString("en-US")}`
    : "Sin precio";

  await sendEmail(
    to,
    // El asunto lleva el auto y la calificación: en la lista del
    // correo ya sabes qué llegó sin abrirlo.
    `Pendiente: ${listing.name} · HDM ${listing.score}`,
    `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:540px;line-height:1.55">
        <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a06a00;margin:0 0 8px">
          Anuncio por revisar
        </p>

        <h2 style="margin:0 0 4px;font-size:22px">${escapeHtml(listing.name)}</h2>
        <p style="margin:0 0 20px;color:#666">
          ${price} · ${escapeHtml(listing.city || "sin ciudad")}
        </p>

        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr>
            <td style="padding:7px 0;color:#777;width:120px">Calificación</td>
            <td style="font-weight:700">${listing.score} / 100</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#777">Respaldo</td>
            <td>${listing.confidence}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#777">Vendedor</td>
            <td>${escapeHtml(listing.sellerName)}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#777">Teléfono</td>
            <td>${escapeHtml(listing.sellerPhone)}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#777">Correo</td>
            <td>${escapeHtml(listing.sellerEmail ?? "—")}</td>
          </tr>
          ${
            listing.flags.length
              ? `<tr>
                   <td style="padding:7px 0;color:#777">Banderas</td>
                   <td style="color:#c0392b;font-weight:600">${escapeHtml(
                     listing.flags.join(", ")
                   )}</td>
                 </tr>`
              : ""
          }
        </table>

        ${
          listing.reviewUrl
            ? `<div style="margin:26px 0;padding:20px;background:#fff7e6;border:1px solid #f0d9a8;border-radius:14px">
                 <p style="margin:0 0 6px;font-weight:700;font-size:15px">
                   Revísalo antes de publicar
                 </p>
                 <p style="margin:0 0 14px;font-size:13px;color:#5a5348">
                   Trae ${listing.photoCount} ${
                     listing.photoCount === 1 ? "foto" : "fotos"
                   }. Ábrelas todas antes de aprobar: es el único filtro
                   que hay contra lo que no debería publicarse.
                 </p>
                 <a href="${listing.reviewUrl}"
                    style="display:inline-block;background:#ff8a1f;color:#fff;padding:13px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px">
                   Ver y aprobar
                 </a>
               </div>`
            : ""
        }

        <p style="margin:24px 0 8px;color:#777;font-size:13px">
          O directo en el SQL Editor de Neon:
        </p>
        <pre style="background:#f5f4f1;padding:14px;border-radius:10px;font-size:12px;overflow-x:auto;margin:0"><code>UPDATE listings
SET status = 'published',
    published_at = NOW(),
    expires_at = NOW() + INTERVAL '30 days'
WHERE id = ${listing.id};</code></pre>

        <p style="margin:14px 0 0;color:#777;font-size:13px">
          Para rechazarlo:
        </p>
        <pre style="background:#f5f4f1;padding:14px;border-radius:10px;font-size:12px;overflow-x:auto;margin:6px 0 0"><code>UPDATE listings SET status = 'rejected' WHERE id = ${listing.id};</code></pre>
      </div>
    `
  );
}

/* ============================================================
   EL ENLACE PARA EL VENDEDOR
   ============================================================ */

async function sendEditLink(listing: NewListingInfo, locale: "es" | "en") {
  if (!listing.sellerEmail) return;

  const es = locale === "es";

  await sendEmail(
    listing.sellerEmail,
    es
      ? "Tu anuncio en Hi Desert Motors — guarda este enlace"
      : "Your Hi Desert Motors listing — save this link",
    `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;line-height:1.6">
        <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#a06a00;margin:0 0 8px">
          Hi Desert Motors
        </p>

        <h2 style="margin:0 0 14px;font-size:22px">
          ${es ? "Recibimos tu anuncio" : "We received your listing"}
        </h2>

        <p style="margin:0 0 18px">
          ${escapeHtml(listing.sellerName)}, ${
            es
              ? `tu <b>${escapeHtml(
                  listing.name
                )}</b> está en revisión. Lo publicamos en cuanto esté listo y te avisamos.`
              : `your <b>${escapeHtml(
                  listing.name
                )}</b> is under review. We will publish it shortly and let you know.`
          }
        </p>

        <div style="background:#fff7e6;border:1px solid #f0d9a8;border-radius:14px;padding:20px;margin:24px 0">
          <p style="margin:0 0 10px;font-weight:700;font-size:16px">
            ${es ? "Guarda este enlace" : "Save this link"}
          </p>

          <p style="margin:0 0 16px;font-size:14px;color:#5a5348">
            ${
              es
                ? "Es la única forma de editar tu anuncio, marcarlo como vendido o retirarlo. No lo compartas: quien lo tenga puede modificarlo."
                : "It is the only way to edit your listing, mark it as sold or withdraw it. Do not share it: anyone who has it can change it."
            }
          </p>

          <a href="${listing.editUrl}"
             style="display:inline-block;background:#ff8a1f;color:#ffffff;padding:13px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px">
            ${es ? "Editar mi anuncio" : "Edit my listing"}
          </a>

          <p style="margin:16px 0 0;font-size:11px;color:#8a8272;word-break:break-all">
            ${listing.editUrl}
          </p>
        </div>

        <p style="margin:0 0 4px;font-size:15px">
          ${
            es
              ? `Calificación HDM: <b>${listing.score}</b> de 100`
              : `HDM rating: <b>${listing.score}</b> out of 100`
          }
        </p>

        ${
          listing.flags.length
            ? `<p style="margin:10px 0 0;font-size:13px;color:#c0392b">
                 ${es ? "A revisar antes de pagar:" : "To check before paying:"}
                 ${escapeHtml(listing.flags.join(", "))}
               </p>`
            : ""
        }

        <p style="margin:26px 0 0;font-size:12px;color:#8a8a8a;border-top:1px solid #ececec;padding-top:16px">
          ${
            es
              ? "Hi Desert Motors es un tablero de anuncios. No compramos, vendemos ni intermediamos: el comprador trata directamente contigo."
              : "Hi Desert Motors is a listings board. We do not buy, sell or broker: the buyer deals directly with you."
          }
          <br /><br />
          <a href="${SITE_URL}" style="color:#a06a00;text-decoration:none">${SITE_URL.replace(
            /^https?:\/\//,
            ""
          )}</a>
        </p>
      </div>
    `
  );
}

/* ============================================================
   REPORTES DE ANUNCIOS
   ============================================================ */

/**
 * Un reporte que se queda sólo en la base es un reporte que nadie
 * lee. Si alguien avisa que un auto es robado, enterarte tres
 * semanas después al consultar la tabla no sirve de nada.
 */
export async function notifyReport(report: {
  listingId: string | number;
  listingName: string;
  reason: string;
  detail: string;
  contact: string | null;
}) {
  const to = adminRecipients();
  if (!to.length) return;

  await sendEmail(
    to,
    `Reporte: ${report.listingName}`,
    `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:540px;line-height:1.55">
        <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c0392b;margin:0 0 8px">
          Anuncio reportado
        </p>

        <h2 style="margin:0 0 4px;font-size:21px">${escapeHtml(
          report.listingName
        )}</h2>
        <p style="margin:0 0 20px;color:#666">Anuncio #${report.listingId}</p>

        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr>
            <td style="padding:7px 0;color:#777;width:110px">Motivo</td>
            <td style="font-weight:700">${escapeHtml(report.reason)}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#777;vertical-align:top">Detalle</td>
            <td>${escapeHtml(report.detail)}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#777">Contacto</td>
            <td>${escapeHtml(report.contact ?? "no dejó")}</td>
          </tr>
        </table>

        <p style="margin:24px 0 8px;color:#777;font-size:13px">
          Para retirar el anuncio mientras lo revisas:
        </p>
        <pre style="background:#f5f4f1;padding:14px;border-radius:10px;font-size:12px;overflow-x:auto;margin:0"><code>UPDATE listings SET status = 'rejected' WHERE id = ${report.listingId};</code></pre>

        <p style="margin:14px 0 8px;color:#777;font-size:13px">
          Para marcar el reporte como atendido:
        </p>
        <pre style="background:#f5f4f1;padding:14px;border-radius:10px;font-size:12px;overflow-x:auto;margin:0"><code>UPDATE reports SET status = 'actioned' WHERE listing_id = ${report.listingId};</code></pre>
      </div>
    `
  );
}

/** Los dos en paralelo: ninguno espera al otro. */
export async function notifyNewListing(
  listing: NewListingInfo,
  locale: "es" | "en"
) {
  await Promise.allSettled([notifyAdmin(listing), sendEditLink(listing, locale)]);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
