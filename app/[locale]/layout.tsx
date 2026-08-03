import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

/**
 * Este es el layout raíz del sitio: aquí viven <html> y <body>.
 * Por eso NO debe existir un src/app/layout.tsx — si tenías uno,
 * mueve su contenido aquí y bórralo.
 */

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

/** Prerenderiza /es y /en en el build */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return {
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    alternates: {
      canonical: locale === "es" ? "/" : "/en",
      languages: { es: "/", en: "/en" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${montserrat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
