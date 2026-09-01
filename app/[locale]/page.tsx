import { notFound } from "next/navigation";
import { isLocale } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import { getPublishedListings } from "@/lib/listings-db";
import HomeView from "@/components/HomeView";

/**
 * Los anuncios cambian sin que haya un despliegue, así que la página
 * se regenera cada minuto en vez de quedar fija en el build.
 */
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const listings = await getPublishedListings(locale);

  return (
    <HomeView
      locale={locale}
      dict={getDictionary(locale)}
      t={getListingDictionary(locale)}
      listings={listings}
    />
  );
}
