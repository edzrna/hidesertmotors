import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { vehicles } from "@/data/vehicles";
import { scoreVehicle, isLocale, pick, type Vehicle } from "@/lib/hdm";
import { fill, getDictionary } from "@/i18n/dictionaries";
import CarView from "@/components/CarView";

type Params = Promise<{ locale: string; id: string }>;

/** Prerenderiza cada auto en los dos idiomas */
export function generateStaticParams() {
  return (vehicles as Vehicle[]).map((vehicle) => ({ id: vehicle.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};

  const vehicle = (vehicles as Vehicle[]).find((item) => item.id === id);
  if (!vehicle) return {};

  const dict = getDictionary(locale);
  const path = locale === "es" ? `/car/${id}` : `/en/car/${id}`;

  return {
    title: vehicle.name,
    description: fill(dict.meta.carDescription, { name: vehicle.name }),
    alternates: {
      canonical: path,
      languages: { es: `/car/${id}`, en: `/en/car/${id}` },
    },
    openGraph: {
      title: `${vehicle.name} — ${vehicle.priceText}`,
      description: pick(vehicle.details, locale),
      images: [vehicle.image],
      type: "website",
    },
  };
}

export default async function CarPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const vehicle = (vehicles as Vehicle[]).find((item) => item.id === id);
  if (!vehicle) notFound();

  return (
    <CarView
      locale={locale}
      dict={getDictionary(locale)}
      vehicle={scoreVehicle(vehicle)}
    />
  );
}
