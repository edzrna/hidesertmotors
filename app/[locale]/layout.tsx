import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/**
 * Layout raíz del sitio: aquí viven <html> y <body>.
 * Por eso NO debe existir app/layout.tsx.
 *
 * Quité Geist y Geist_Mono: no se usaban en ninguna página, solo
 * agregaban dos descargas de fuente en cada visita.
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
    // Con esto las rutas relativas de abajo (/logo.png) se vuelven
    // absolutas solas. Sin metadataBase, Facebook y WhatsApp no
    // encuentran la imagen al compartir.
    metadataBase: new URL(SITE_URL),

    title: {
      default: "HI DESERT MOTORS",
      template: "%s | HI DESERT MOTORS",
    },
    description: dict.meta.homeDescription,
    keywords: [
      "autos usados",
      "carros en venta",
      "Hesperia California",
      "used cars",
      "car dealer",
      "Hi Desert Motors",
    ],
    authors: [{ name: "HI DESERT MOTORS" }],

    alternates: {
      canonical: locale === "es" ? "/" : "/en",
      languages: { es: "/", en: "/en" },
    },

    openGraph: {
      title: "HI DESERT MOTORS",
      description: dict.meta.homeDescription,
      url: locale === "es" ? SITE_URL : `${SITE_URL}/en`,
      siteName: "HI DESERT MOTORS",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "HI DESERT MOTORS",
        },
      ],
      locale: locale === "es" ? "es_MX" : "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: "HI DESERT MOTORS",
      description: dict.meta.homeDescription,
      images: ["/logo.png"],
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
    <html
      lang={locale}
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
