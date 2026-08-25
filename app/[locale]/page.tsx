import { notFound } from "next/navigation";
import { isLocale } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublishedListings } from "@/lib/listings-db";
import HomeView from "@/components/HomeView";

/**
 * Los anuncios cambian sin que haya un despliegue, así que la página
 * se regenera cada minuto en vez de quedar fija en el build.
 */
export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const listings = await getPublishedListings(locale);

  return (
    <HomeView locale={locale} dict={getDictionary(locale)} listings={listings} />
  );
}
