import { notFound } from "next/navigation";
import { vehicles } from "@/data/vehicles";
import { scoreAll, isLocale, type Vehicle } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import HomeView from "@/components/HomeView";

/**
 * Server component: calcula las calificaciones en el servidor y le pasa
 * a la vista solo lo que necesita. El HTML sale ya renderizado, que es
 * lo que Google indexa.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const scored = scoreAll(vehicles as Vehicle[]);

  return (
    <HomeView locale={locale} dict={getDictionary(locale)} vehicles={scored} />
  );
}
