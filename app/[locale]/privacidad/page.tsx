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
    title: t.privacy.title,
    description: t.privacy.description,
    alternates: {
      canonical: locale === "es" ? "/privacidad" : "/en/privacidad",
      languages: { es: "/privacidad", en: "/en/privacidad" },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getLegalDictionary(locale);

  return (
    <LegalPage
      locale={locale}
      label={t.privacy.label}
      title={t.privacy.title}
      subtitle={t.privacy.subtitle}
      updated={t.updated}
      backLabel={t.backToSite}
      sections={t.privacy.sections}
    />
  );
}
