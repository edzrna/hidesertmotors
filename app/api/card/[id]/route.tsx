import { ImageResponse } from "next/og";
import { getListingById } from "@/lib/listings-db";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import { isLocale, formatMiles } from "@/lib/hdm";

/**
 * Tarjeta de calificación, en imagen.
 *
 * Es para que el vendedor la use como última foto de su anuncio en
 * Facebook Marketplace. Ahí no funciona un logo suelto —nadie teclea
 * una dirección por ver una marca— pero sí funciona una credencial
 * del auto que están viendo: le sirve al comprador, distingue al
 * vendedor, y la marca viaja pegada a algo útil.
 *
 * 1080x1080 porque es el formato que Marketplace no recorta.
 */

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params;

  const url = new URL(request.url);
  const raw = url.searchParams.get("lang") ?? "es";
  const locale = isLocale(raw) ? raw : "es";

  const listing = await getListingById(id, locale);

  if (!listing) {
    return new Response("not found", { status: 404 });
  }

  try {

  const dict = getDictionary(locale);
  const t = getListingDictionary(locale);

  /**
   * Satori revienta con un texto undefined —"Cannot read properties of
   * undefined (reading 'trim')"— y el error no dice qué faltaba.
   *
   * Toda cadena que venga de un diccionario pasa por aquí. Una
   * traducción faltante se convierte en un hueco visible, no en una
   * imagen rota.
   */
  const texto = (valor: unknown, respaldo = "—") =>
    typeof valor === "string" && valor.trim() ? valor : respaldo;

  const AMBER = "#f5c542";
  const ORANGE = "#d88a00";
  const NAVY = "#071018";

  const pct = Math.max(0, Math.min(100, listing.score));

    return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          flexDirection: "column",
          background: NAVY,
          padding: 72,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Resplandor ámbar, el mismo del sitio */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -100,
            width: 900,
            height: 700,
            background: `radial-gradient(circle, rgba(245,197,66,0.16), rgba(7,16,24,0) 70%)`,
            display: "flex",
          }}
        />

        {/* ---------- Anillo y nivel ---------- */}
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          {/*
            Anillo con SVG, no con conic-gradient.

            next/og renderiza con Satori, que soporta un subconjunto
            de CSS: los gradientes cónicos no están. Un arco SVG con
            strokeDasharray sí, y además da control exacto de dónde
            empieza y termina.
          */}
          <div
            style={{
              display: "flex",
              width: 260,
              height: 260,
              flexShrink: 0,
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="260" height="260" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="22"
              />
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke={AMBER}
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 722.6} 722.6`}
                transform="rotate(-90 130 130)"
              />
            </svg>

            <div
              style={{
                position: "absolute",
                display: "flex",
                fontSize: 96,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {listing.score}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 30,
                letterSpacing: 4,
                color: AMBER,
                fontWeight: 700,
              }}
            >
              {locale === "es" ? "CALIFICACIÓN HDM" : "HDM RATING"}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.05,
                marginTop: 8,
                maxWidth: 560,
              }}
            >
              {texto(dict.levels[listing.levelKey])}
            </div>
          </div>
        </div>

        {/* ---------- El auto ---------- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 56,
            paddingTop: 44,
            borderTop: "2px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: 940,
            }}
          >
            {texto(listing.name)}
          </div>

          <div
            style={{
              display: "flex",
              gap: 36,
              marginTop: 20,
              fontSize: 32,
              color: "#b9c6d6",
            }}
          >
            <span>{texto(formatMiles(listing.miles, locale))}</span>
            <span>·</span>
            <span>{texto(dict.titles[listing.titleStatus])}</span>
            {listing.city && (
              <>
                <span>·</span>
                <span>{texto(listing.city)}</span>
              </>
            )}
          </div>
        </div>

        {/* ---------- Banderas ----------
            Se incluyen aunque sean malas. Un anuncio que admite el
            título Salvage de frente genera más confianza que uno que
            lo esconde, y el comprador que llega ya sabe a qué va. */}
        {listing.flags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 32,
            }}
          >
            {listing.flags.slice(0, 4).map((flag) => (
              <div
                key={flag}
                style={{
                  display: "flex",
                  padding: "14px 26px",
                  borderRadius: 999,
                  background: "rgba(255,77,94,0.14)",
                  border: "2px solid rgba(255,77,94,0.4)",
                  color: "#ff9aa6",
                  fontSize: 28,
                  fontWeight: 600,
                }}
              >
                {texto(t.flags[flag as keyof typeof t.flags], flag)}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flex: 1 }} />

        {/* ---------- Pie ---------- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 36,
            borderTop: "2px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 26, color: "#8ea0b3", maxWidth: 900 }}>
            {locale === "es"
              ? "Calificado con lo que declara su dueño. No inspeccionamos vehículos."
              : "Rated from what the owner declares. We do not inspect vehicles."}
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: AMBER,
              marginTop: 14,
            }}
          >
            hidesertmotors.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      /*
        Sin fuentes propias, Satori usa la que trae por defecto.
        Cargar Montserrat desde Google aquí exigiría una descarga en
        cada petición y una dependencia de red que puede fallar — y
        cuando falla, la tarjeta devuelve 500 en vez de una imagen.
      */
      }
    );
  } catch (error) {
    /*
      Un 500 mudo en un generador de imágenes es especialmente
      molesto: el navegador sólo enseña un icono roto y no hay forma
      de saber por qué. Aquí el motivo se devuelve como texto.
    */
    const detail = error instanceof Error ? error.message : String(error);
    console.error("card failed:", detail);

    return new Response(`No se pudo generar la tarjeta: ${detail}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
