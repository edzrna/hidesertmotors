"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { vehicles as sourceVehicles } from "@/data/vehicles";
import { Montserrat, Inter } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const BRAND_YELLOW = "#f5c542";
const BRAND_ORANGE = "#d88a00";
const BRAND_DARK = "#071018";
const PRIMARY_WHATSAPP = "+1 760 641 1996";
const PRIMARY_WHATSAPP_URL = "https://wa.me/17606411996";

type Vehicle = (typeof sourceVehicles)[number];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getConditionScore(condition: string) {
  const map: Record<string, number> = {
    excelente: 95,
    muy_bueno: 82,
    bueno: 72,
    regular: 66,
    malo: 60,
  };

  return map[condition] ?? 60;
}

function getMilesScore(miles: number) {
  if (miles <= 30000) return 95;
  if (miles <= 60000) return 85;
  if (miles <= 90000) return 78;
  if (miles <= 130000) return 70;
  return 60;
}

function getYearScore(year: number) {
  if (year >= 2024) return 96;
  if (year >= 2021) return 86;
  if (year >= 2018) return 78;
  if (year >= 2014) return 70;
  return 60;
}

function getHistoryScore({
  titleStatus,
  serviceRecords,
  accidents,
  owners,
}: {
  titleStatus: string;
  serviceRecords: boolean;
  accidents: number;
  owners: number;
}) {
  let score = 72;

  if (titleStatus === "clean") score += 14;
  if (titleStatus === "rebuilt") score -= 8;
  if (titleStatus === "salvage") score -= 14;
  if (serviceRecords) score += 6;
  if (accidents === 1) score -= 6;
  if (accidents >= 2) score -= 12;
  if (owners === 1) score += 4;
  if (owners >= 3) score -= 6;

  return clamp(score, 60, 100);
}

function getMarketValueScore(price: number, marketPrice: number) {
  if (!marketPrice || marketPrice <= 0) return 70;
  const diffPercent = ((marketPrice - price) / marketPrice) * 100;

  if (diffPercent >= 10) return 95;
  if (diffPercent >= 5) return 86;
  if (diffPercent >= 0) return 78;
  if (diffPercent >= -5) return 70;
  return 60;
}

function getHDMScore(vehicle: Vehicle) {
  const conditionScore = getConditionScore(vehicle.condition);
  const milesScore = getMilesScore(vehicle.miles);
  const yearScore = getYearScore(vehicle.year);
  const historyScore = getHistoryScore({
    titleStatus: vehicle.titleStatus,
    serviceRecords: vehicle.serviceRecords,
    accidents: vehicle.accidents,
    owners: vehicle.owners,
  });
  const valueScore = getMarketValueScore(vehicle.priceValue, vehicle.marketPrice);

  const total =
    conditionScore * 0.25 +
    milesScore * 0.2 +
    yearScore * 0.15 +
    historyScore * 0.25 +
    valueScore * 0.15;

  return Math.round(clamp(total, 60, 100));
}

function getHDMLabel(score: number) {
  if (score >= 90) return "Mejor opción";
  if (score >= 80) return "Muy buena compra";
  if (score >= 70) return "Buen trato";
  return "Buena opción";
}

function getHDMColor(score: number) {
  if (score >= 90) return { bg: "#ffd85a", text: "#2f1b00" };
  if (score >= 80) return { bg: "#f7c84a", text: "#2f1b00" };
  if (score >= 70) return { bg: "#f5b93f", text: "#2f1b00" };
  return { bg: "#f0a43a", text: "#2f1b00" };
}

export default function CarDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : String(rawId ?? "");

  const vehicle = useMemo(
    () => sourceVehicles.find((item) => item.id === id),
    [id]
  );

  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [screen, setScreen] = useState({
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreen({
        isMobile: width < 768,
        isTablet: width < 1100,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isMobile, isTablet } = screen;

  if (!vehicle) {
    return (
      <main
        style={{
          padding: isMobile ? "28px 18px" : "40px",
          fontFamily: inter.style.fontFamily,
          background: "#f4f7fb",
          minHeight: "100vh",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#7a4d00",
            textDecoration: "none",
            fontWeight: 700,
            fontFamily: montserrat.style.fontFamily,
            fontSize: isMobile ? "14px" : "15px",
          }}
        >
          ← Volver
        </Link>

        <h1
          style={{
            marginTop: "18px",
            fontFamily: montserrat.style.fontFamily,
            fontSize: isMobile ? "28px" : "36px",
            lineHeight: 1.05,
          }}
        >
          Auto no encontrado
        </h1>
      </main>
    );
  }

  const gallery = vehicle.gallery?.length ? vehicle.gallery : [vehicle.image];
  const score = getHDMScore(vehicle);
  const scoreLabel = getHDMLabel(score);
  const scoreTone = getHDMColor(score);

  const prevImage = () => {
    setIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#0b1622",
        fontFamily: inter.style.fontFamily,
        padding: isMobile ? "18px 14px 40px" : isTablet ? "24px 18px 50px" : "28px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "1220px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#7a4d00",
            textDecoration: "none",
            fontWeight: 800,
            fontFamily: montserrat.style.fontFamily,
            fontSize: isMobile ? "13px" : "14px",
          }}
        >
          ← Volver al inventario
        </Link>

        <div
          style={{
            marginTop: isMobile ? "14px" : "18px",
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "minmax(0, 1.12fr) minmax(360px, 0.88fr)",
            gap: isMobile ? "16px" : "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              borderRadius: isMobile ? "22px" : "28px",
              background: "#ffffff",
              border: "1px solid rgba(216,138,0,0.10)",
              boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
              padding: isMobile ? "12px" : isTablet ? "16px" : "22px",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={gallery[index]}
                alt={vehicle.name}
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  width: "100%",
                  height: isMobile ? "250px" : isTablet ? "420px" : "520px",
                  objectFit: "cover",
                  borderRadius: isMobile ? "16px" : "22px",
                  cursor: "zoom-in",
                  display: "block",
                }}
              />

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                    style={{
                      ...detailArrowLeft,
                      width: isMobile ? "38px" : "42px",
                      height: isMobile ? "38px" : "42px",
                      fontSize: isMobile ? "18px" : "20px",
                      left: isMobile ? "8px" : "12px",
                    }}
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
                    style={{
                      ...detailArrowRight,
                      width: isMobile ? "38px" : "42px",
                      height: isMobile ? "38px" : "42px",
                      fontSize: isMobile ? "18px" : "20px",
                      right: isMobile ? "8px" : "12px",
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: isMobile ? "8px" : "10px",
                overflowX: "auto",
                paddingTop: "12px",
                scrollbarWidth: "thin",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
              }}
            >
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Abrir imagen ${i + 1}`}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    flex: "0 0 auto",
                  }}
                >
                  <img
                    src={img}
                    alt={`${vehicle.name} ${i + 1}`}
                    style={{
                      width: isMobile ? "68px" : isTablet ? "78px" : "86px",
                      height: isMobile ? "68px" : isTablet ? "78px" : "86px",
                      minWidth: isMobile ? "68px" : isTablet ? "78px" : "86px",
                      objectFit: "cover",
                      borderRadius: isMobile ? "12px" : "14px",
                      display: "block",
                      border:
                        i === index
                          ? "2px solid #7a4d00"
                          : "1px solid rgba(216,138,0,0.10)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: isMobile ? "22px" : "28px",
              background: "#ffffff",
              border: "1px solid rgba(216,138,0,0.10)",
              boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
              padding: isMobile ? "18px 16px" : isTablet ? "22px 18px" : "24px",
            }}
          >
            <div
              style={{
                color: "#8a5a00",
                textTransform: "uppercase",
                fontSize: isMobile ? "11px" : "12px",
                letterSpacing: "0.2em",
                marginBottom: "8px",
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              Ficha del vehículo
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? "28px" : isTablet ? "32px" : "36px",
                lineHeight: 1.04,
                fontFamily: montserrat.style.fontFamily,
                wordBreak: "break-word",
              }}
            >
              {vehicle.name}
            </h1>

            <div
              style={{
                fontSize: isMobile ? "28px" : isTablet ? "32px" : "36px",
                fontWeight: 900,
                marginTop: "16px",
                fontFamily: montserrat.style.fontFamily,
                lineHeight: 1,
              }}
            >
              {vehicle.priceText}
            </div>

            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "14px",
                padding: isMobile ? "10px 12px" : "10px 14px",
                borderRadius: "999px",
                background: scoreTone.bg,
                color: scoreTone.text,
                border: "1px solid rgba(216,138,0,0.10)",
                fontWeight: 800,
                fontFamily: montserrat.style.fontFamily,
                fontSize: isMobile ? "13px" : "14px",
              }}
            >
              {scoreLabel} - {score}
            </div>

            <p
              style={{
                color: "#5b6b7f",
                lineHeight: 1.8,
                marginTop: "18px",
                fontSize: isMobile ? "14px" : "15px",
              }}
            >
              {vehicle.details}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              <InfoBox label="Año" value={String(vehicle.year)} />
              <InfoBox label="Millas" value={vehicle.miles.toLocaleString()} />
              <InfoBox label="Título" value={vehicle.titleStatus} />
              <InfoBox label="Dueños" value={String(vehicle.owners)} />
              <InfoBox label="Accidentes" value={String(vehicle.accidents)} />
              <InfoBox label="Condición" value={vehicle.condition} />
            </div>

            <a
              href={`${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                `Hola, me interesa el ${vehicle.name}`
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{
                ...whatsAppButtonStyle,
                width: isMobile ? "100%" : "auto",
                textAlign: "center" as const,
                marginTop: "22px",
                fontSize: isMobile ? "14px" : "15px",
                padding: isMobile ? "15px 16px" : "14px 18px",
              }}
            >
              Contactar por WhatsApp
            </a>

            <div
              style={{
                marginTop: "14px",
                color: "#7a4d00",
                fontSize: isMobile ? "12px" : "13px",
                wordBreak: "break-word",
              }}
            >
              WhatsApp principal: {PRIMARY_WHATSAPP}
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7,16,24,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: isMobile ? "16px" : "24px",
          }}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar"
            style={{
              ...closeLightboxStyle,
              top: isMobile ? "12px" : "18px",
              right: isMobile ? "12px" : "18px",
              width: isMobile ? "40px" : "44px",
              height: isMobile ? "40px" : "44px",
              fontSize: isMobile ? "20px" : "22px",
            }}
          >
            ×
          </button>

          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Imagen anterior"
                style={{
                  ...detailLightboxArrowLeft,
                  left: isMobile ? "10px" : "18px",
                  width: isMobile ? "40px" : "48px",
                  height: isMobile ? "40px" : "48px",
                  fontSize: isMobile ? "20px" : "24px",
                }}
              >
                ‹
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Imagen siguiente"
                style={{
                  ...detailLightboxArrowRight,
                  right: isMobile ? "10px" : "18px",
                  width: isMobile ? "40px" : "48px",
                  height: isMobile ? "40px" : "48px",
                  fontSize: isMobile ? "20px" : "24px",
                }}
              >
                ›
              </button>
            </>
          )}

          <img
            src={gallery[index]}
            alt={vehicle.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "94vw",
              maxHeight: isMobile ? "78vh" : "88vh",
              borderRadius: isMobile ? "14px" : "18px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      )}
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  const isLong = value.length > 14;

  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "16px",
        border: "1px solid rgba(216,138,0,0.10)",
        background: "#fffdf8",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#8a5a00",
          marginBottom: "6px",
          fontFamily: montserrat.style.fontFamily,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 800,
          fontSize: isLong ? "14px" : "15px",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const whatsAppButtonStyle = {
  display: "inline-block",
  padding: "14px 18px",
  borderRadius: "999px",
  textDecoration: "none",
  background: `linear-gradient(135deg, ${BRAND_YELLOW}, ${BRAND_ORANGE})`,
  color: BRAND_DARK,
  fontWeight: 800,
  fontFamily: montserrat.style.fontFamily,
  boxShadow: "0 10px 24px rgba(216,138,0,0.28)",
};

const detailArrowLeft = {
  position: "absolute" as const,
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(216,138,0,0.10)",
  background: "rgba(255,250,240,0.95)",
  color: "#7a4d00",
  fontSize: "20px",
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
};

const detailArrowRight = {
  ...detailArrowLeft,
  left: "auto",
  right: "12px",
};

const detailLightboxArrowLeft = {
  position: "absolute" as const,
  left: "18px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "48px",
  height: "48px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
};

const detailLightboxArrowRight = {
  ...detailLightboxArrowLeft,
  left: "auto",
  right: "18px",
};

const closeLightboxStyle = {
  position: "absolute" as const,
  top: "18px",
  right: "18px",
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
};