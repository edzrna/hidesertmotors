import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/hdm";
import { getLegalDictionary } from "@/i18n/legal";
import LegalPage from "@/components/LegalPage";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getLegalDictionary(locale);

  return {
    title: t.terms.title,
    description: t.terms.description,
    alternates: {
      canonical: locale === "es" ? "/terminos" : "/en/terminos",
      languages: { es: "/terminos", en: "/en/terminos" },
    },
  };
}

export default async function TermsPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getLegalDictionary(locale);

  return (
    <LegalPage
      locale={locale}
      label={t.terms.label}
      title={t.terms.title}
      subtitle={t.terms.subtitle}
      updated={t.updated}
      backLabel={t.backToSite}
      sections={t.terms.sections}
    />
  );
}
