import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, localePath, formatMiles } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getPendingListings } from "@/lib/listings-db";
import AxelFace from "@/components/AxelFace";

/**
 * Bandeja de anuncios pendientes.
 *
 * Existe para no depender del correo. Si un aviso no llega o se
 * pierde, aquí están todos los que esperan revisión — y desde el
 * celular, sin SQL.
 *
 * El acceso es la misma clave de la página de revisión, así que
 * basta guardar esta dirección en favoritos.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = Promise<{ locale: string }>;
type Search = Promise<{ k?: string }>;

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { k } = await searchParams;
  const admin = process.env.ADMIN_TOKEN;

  // Sin clave correcta la página no existe. Un 404 no delata que
  // aquí hay algo protegido.
  if (!admin || k !== admin) notFound();

  const dict = getDictionary(locale);
  const pending = await getPendingListings(locale);

  return (
    <main className="hdm-shell review">
      <header className="review-head">
        <span className="review-status is-pending">
          {pending.length} pendiente{pending.length === 1 ? "" : "s"}
        </span>
        <h1>Por revisar</h1>
        <p className="review-meta">
          Abre cada uno para ver sus fotos antes de aprobarlo.
        </p>
      </header>

      {pending.length === 0 ? (
        <div className="review-block">
          <p className="review-text">
            No hay anuncios esperando. Cuando alguien publique, aparece
            aquí.
          </p>
        </div>
      ) : (
        <ul className="admin-list">
          {pending.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`${localePath(locale, `/revisar/${listing.id}`)}?k=${admin}`}
              >
                <img
                  src={listing.image}
                  alt=""
                  className="admin-thumb"
                  loading="lazy"
                />

                <div className="admin-info">
                  <strong>{listing.name}</strong>
                  <span>
                    {listing.priceText} · {formatMiles(listing.miles, locale)}
                    {listing.city ? ` · ${listing.city}` : ""}
                  </span>
                  <span className="admin-seller">
                    {listing.sellerName} · {listing.photoCount} fotos
                  </span>

                  {listing.flags.length > 0 && (
                    <span className="admin-flags">
                      {listing.flags.length} bandera
                      {listing.flags.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                <div className="admin-score">
                  <AxelFace level={listing.levelKey} size="sm" />
                  <b>{listing.score}</b>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="diag-note diag-note--final">
        Guarda esta dirección en favoritos. Es la misma clave que la de
        revisión, así que no tienes que buscarla en el correo cada vez.
      </p>
    </main>
  );
}
