import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import { getListingForReview } from "@/lib/listings-db";
import ReviewView from "@/components/ReviewView";

/**
 * Revisión de anuncios pendientes.
 *
 * Nunca en caché y fuera de buscadores: muestra anuncios que aún no
 * son públicos y la URL lleva la clave.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = Promise<{ locale: string; id: string }>;
type Search = Promise<{ k?: string }>;

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const { k } = await searchParams;
  const admin = process.env.ADMIN_TOKEN;

  // Sin clave configurada o sin coincidencia: la página no existe.
  // Un 404 no revela que aquí hay algo protegido.
  if (!admin || k !== admin) notFound();

  const listing = await getListingForReview(id, locale);
  if (!listing) notFound();

  return (
    <ReviewView
      locale={locale}
      dict={getDictionary(locale)}
      t={getListingDictionary(locale)}
      listing={listing}
      adminKey={admin}
    />
  );
}
