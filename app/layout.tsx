import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HI DESERT MOTORS",
    template: "%s | HI DESERT MOTORS",
  },
  description: "Compra autos con confianza en Hesperia, California.",
  keywords: [
    "autos usados",
    "carros en venta",
    "Hesperia California",
    "used cars",
    "car dealer",
    "Hi Desert Motors",
  ],
  authors: [{ name: "HI DESERT MOTORS" }],
  openGraph: {
    title: "HI DESERT MOTORS",
    description: "Vehículos usados con evaluación clara.",
    url: "https://hidesertmotors.com",
    siteName: "HI DESERT MOTORS",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "HI DESERT MOTORS",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HI DESERT MOTORS",
    description: "Compra autos con confianza.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f4f7fb] text-[#0b1622]">
        {children}
      </body>
    </html>
  );
}