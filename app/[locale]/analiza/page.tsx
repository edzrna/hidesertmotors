import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, localePath } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import AnalyzeView from "@/components/AnalyzeView";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    title: dict.analyze.title,
    description: dict.analyze.lead,
    alternates: {
      canonical: locale === "es" ? "/analiza" : "/en/analiza",
      languages: { es: "/analiza", en: "/en/analiza" },
    },
  };
}

export default async function AnalyzePage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const t = getListingDictionary(locale);

  return (
    /* Claro, igual que publicar: es un formulario, y un formulario
       largo sobre negro cansa. */
    <div className="theme-light">
      <main className="hdm-shell hdm-detail">
        <Link href={localePath(locale, "/")} className="hdm-back">
          ← {dict.vehicle.back}
        </Link>

        <header className="pub-head">
          <div className="hdm-kicker">{dict.analyze.kicker}</div>
          <h1 className="hdm-h2">{dict.analyze.title}</h1>
          <p className="pub-lede">{dict.analyze.lead}</p>
        </header>

        <AnalyzeView locale={locale} dict={dict} t={t} />
      </main>
    </div>
  );
}
