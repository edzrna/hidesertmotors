import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import { getLegalDictionary } from "@/i18n/legal";
import { getListingById, getSellerHistory } from "@/lib/listings-db";
import CarView from "@/components/CarView";

/**
 * Se resuelve en cada visita, no durante el build.
 *
 * Con `revalidate = 60`, Next pre-generaba esta página al construir el
 * sitio. Si la base no responde en ese momento —Neon se suspende por
 * inactividad en el plan gratis, y despertarla desde la red del build
 * no siempre funciona— la página quedaba generada VACÍA y así se
 * servía hasta la primera revalidación.
 *
 * Un build exitoso que publica una portada sin autos es peor que un
 * build fallido: no avisa.
 *
 * A cambio de renderizar en cada visita se pagan unos 100 ms de
 * consulta. Con este volumen no se nota, y a cambio desaparece toda
 * una clase de fallos.
 */
export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};

  const listing = await getListingById(id, locale);
  if (!listing) return {};

  const path = locale === "es" ? `/car/${id}` : `/en/car/${id}`;

  return {
    title: listing.name,
    description: listing.description.slice(0, 155),
    alternates: {
      canonical: path,
      languages: { es: `/car/${id}`, en: `/en/car/${id}` },
    },
    openGraph: {
      title: `${listing.name} — ${listing.priceText}`,
      description: listing.description.slice(0, 200),
      images: listing.image ? [listing.image] : [],
      type: "website",
    },
  };
}

export default async function CarPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const listing = await getListingById(id, locale);
  if (!listing) notFound();

  const seller = await getSellerHistory(listing.sellerPhone);

  return (
    <CarView
      locale={locale}
      dict={getDictionary(locale)}
      t={getListingDictionary(locale)}
      legal={getLegalDictionary(locale)}
      seller={seller}
      listing={listing}
    />
  );
}
