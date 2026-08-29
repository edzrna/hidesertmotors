import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, localePath } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import ListingForm from "@/components/ListingForm";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = getListingDictionary(locale);

  return {
    title: t.page.title,
    description: t.page.lede,
    alternates: {
      canonical: locale === "es" ? "/publicar" : "/en/publicar",
      languages: { es: "/publicar", en: "/en/publicar" },
    },
  };
}

export default async function PublishPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const t = getListingDictionary(locale);

  return (
    <div className="theme-light">
    <main className="hdm-shell hdm-detail">
      <Link href={localePath(locale, "/")} className="hdm-back">
        ← {dict.vehicle.back}
      </Link>

      {/* Encabezado oscuro con el mismo lenguaje que "Encuentra el
          auto correcto": píldora ámbar, título grande, segunda línea
          en acento. El formulario sigue claro debajo. */}
      <header className="pub-hero">
        <span className="pub-hero-pill">{t.page.kicker}</span>
        <h1 className="pub-hero-title">{t.page.title}</h1>
        <p className="pub-hero-lead">{t.page.lede}</p>

        {/* Va arriba y a la vista, no escondido en el pie: es lo que
            deja claro que el sitio no es parte de la venta. */}
        <div className="pub-hero-notes">
          <p>{t.page.disclaimer}</p>
          <p>{t.page.duration}</p>
        </div>
      </header>

      <ListingForm locale={locale} dict={dict} t={t} />
    </main>
    </div>
  );
}
