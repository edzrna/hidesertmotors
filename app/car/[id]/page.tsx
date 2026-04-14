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
  const id = String(params.id);

  const vehicle = useMemo(
    () => sourceVehicles.find((item) => item.id === id),
    [id]
  );

  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 760);
      setIsTablet(window.innerWidth < 980);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!vehicle) {
    return (
      <main
        style={{
          padding: "40px",
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
          }}
        >
          ← Volver
        </Link>
        <h1
          style={{
            marginTop: "18px",
            fontFamily: montserrat.style.fontFamily,
          }}
        >
          Auto no encontrado
        </h1>
      </main>
    );
  }

  const gallery = vehicle.gallery || [vehicle.image];
  const score = getHDMScore(vehicle);
  const scoreLabel = getHDMLabel(score);
  const scoreTone = getHDMColor(score);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#0b1622",
        fontFamily: inter.style.fontFamily,
        padding: "28px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: "#7a4d00",
            textDecoration: "none",
            fontWeight: 700,
            fontFamily: montserrat.style.fontFamily,
          }}
        >
          ← Volver al inventario
        </Link>

        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1.15fr 0.85fr",
            gap: "24px",
          }}
        >
          <div
            style={{
              borderRadius: "28px",
              background: "#ffffff",
              border: "1px solid rgba(216,138,0,0.10)",
              boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
              padding: isMobile ? "16px" : "22px",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={gallery[index]}
                alt={vehicle.name}
                onClick={() => setIsLightboxOpen(true)}
                style={{
                  width: "100%",
                  height: isMobile ? "260px" : "520px",
                  objectFit: "cover",
                  borderRadius: "22px",
                  cursor: "zoom-in",
                }}
              />

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setIndex(index === 0 ? gallery.length - 1 : index - 1)
                    }
                    style={detailArrowLeft}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setIndex(index === gallery.length - 1 ? 0 : index + 1)
                    }
                    style={detailArrowRight}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                paddingTop: "12px",
                scrollbarWidth: "thin",
                scrollBehavior: "smooth",
              }}
            >
              {gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${vehicle.name} ${i + 1}`}
                  onClick={() => setIndex(i)}
                  style={{
                    width: isMobile ? "72px" : "86px",
                    height: isMobile ? "72px" : "86px",
                    minWidth: isMobile ? "72px" : "86px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    cursor: "pointer",
                    border:
                      i === index
                        ? "2px solid #7a4d00"
                        : "1px solid rgba(216,138,0,0.10)",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: "28px",
              background: "#ffffff",
              border: "1px solid rgba(216,138,0,0.10)",
              boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
              padding: isMobile ? "18px" : "24px",
            }}
          >
            <div
              style={{
                color: "#8a5a00",
                textTransform: "uppercase",
                fontSize: "12px",
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
                fontSize: isMobile ? "28px" : "34px",
                lineHeight: 1.05,
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              {vehicle.name}
            </h1>

            <div
              style={{
                fontSize: isMobile ? "28px" : "34px",
                fontWeight: 900,
                marginTop: "18px",
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              {vehicle.priceText}
            </div>

            <div
              style={{
                display: "inline-flex",
                marginTop: "14px",
                padding: "10px 14px",
                borderRadius: "999px",
                background: scoreTone.bg,
                color: scoreTone.text,
                border: "1px solid rgba(216,138,0,0.10)",
                fontWeight: 800,
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              {scoreLabel} - {score}
            </div>

            <p style={{ color: "#5b6b7f", lineHeight: 1.8, marginTop: "18px" }}>
              {vehicle.details}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
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
              href={`${PRIMARY_WHATSAPP_URL}?text=Hola, me interesa el ${vehicle.name}`}
              target="_blank"
              rel="noreferrer"
              style={whatsAppButtonStyle}
            >
              Contactar por WhatsApp
            </a>

            <div
              style={{
                marginTop: "14px",
                color: "#7a4d00",
                fontSize: "13px",
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
            background: "rgba(7,16,24,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
          }}
        >
          <button onClick={() => setIsLightboxOpen(false)} style={closeLightboxStyle}>
            ×
          </button>

          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(index === 0 ? gallery.length - 1 : index - 1);
                }}
                style={detailLightboxArrowLeft}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(index === gallery.length - 1 ? 0 : index + 1);
                }}
                style={detailLightboxArrowRight}
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
              maxWidth: "92vw",
              maxHeight: "88vh",
              borderRadius: "18px",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "16px",
        border: "1px solid rgba(216,138,0,0.10)",
        background: "#fffdf8",
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
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const whatsAppButtonStyle = {
  display: "inline-block",
  marginTop: "22px",
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
};