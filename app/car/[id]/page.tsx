"use client";

import { useMemo, useRef, useState, useEffect } from "react";
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
  const [shareMessage, setShareMessage] = useState("");

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    setIndex(0);
  }, [id]);

  useEffect(() => {
    if (!thumbsRef.current) return;

    const activeThumb = thumbsRef.current.querySelector(
      `[data-thumb-index="${index}"]`
    ) as HTMLElement | null;

    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [index]);

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

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://www.hidesertmotors.com/car/${vehicle.id}`;

  const shareText = `${vehicle.name} - ${vehicle.priceText} | HI DESERT MOTORS`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copiado");
      window.setTimeout(() => setShareMessage(""), 2200);
    } catch {
      setShareMessage("No se pudo copiar el link");
      window.setTimeout(() => setShareMessage(""), 2200);
    }
  }

  const prevImage = () => {
    setIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.changedTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    touchEndX.current = e.changedTouches[0].clientX;

    if (touchStartX.current === null || touchEndX.current === null) return;

    const delta = touchStartX.current - touchEndX.current;

    if (delta > 40) {
      nextImage();
    } else if (delta < -40) {
      prevImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#0b1622",
        fontFamily: inter.style.fontFamily,
        padding: isMobile
          ? "18px 14px 40px"
          : isTablet
          ? "24px 18px 50px"
          : "28px 20px 60px",
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
            gridTemplateColumns: isTablet
              ? "1fr"
              : "minmax(0, 1.08fr) minmax(340px, 0.92fr)",
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
            <div
              style={{ position: "relative" }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
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
                  touchAction: "pan-y",
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
              ref={thumbsRef}
              style={{
                display: "flex",
                gap: isMobile ? "8px" : "10px",
                overflowX: "auto",
                paddingTop: "12px",
                scrollbarWidth: "thin",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory",
                paddingBottom: "2px",
              }}
            >
              {gallery.map((img, i) => (
                <button
                  key={i}
                  data-thumb-index={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Abrir imagen ${i + 1}`}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    flex: "0 0 auto",
                    scrollSnapAlign: "start",
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
              position: isTablet ? "static" : "sticky",
              top: isTablet ? "auto" : "24px",
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
                gridTemplateColumns: isMobile
                  ? "1fr 1fr"
                  : "repeat(2, minmax(0, 1fr))",
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
                width: "100%",
                textAlign: "center",
                marginTop: "22px",
                fontSize: isMobile ? "14px" : "15px",
                padding: isMobile ? "15px 16px" : "14px 18px",
              }}
            >
              Contactar por WhatsApp
            </a>

            <div
              style={{
                color: "#8a5a00",
                fontSize: isMobile ? "11px" : "12px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontFamily: montserrat.style.fontFamily,
                marginTop: "16px",
                marginBottom: "10px",
              }}
            >
              Compartir vehículo
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                style={shareNetworkButtonStyle}
              >
                <ShareIconWhatsApp />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                style={shareNetworkButtonStyle}
              >
                <ShareIconFacebook />
                <span>Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                style={shareNetworkButtonStyle}
              >
                <ShareIconX />
                <span>X</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
                style={shareNetworkButtonStyle}
              >
                <ShareIconTelegram />
                <span>Telegram</span>
              </a>

              <a
                href={`fb-messenger://share?link=${encodeURIComponent(shareUrl)}`}
                style={shareNetworkButtonStyle}
              >
                <ShareIconMessenger />
                <span>Messenger</span>
              </a>

              <button
                onClick={handleCopyLink}
                style={shareNetworkButtonStyle}
              >
                <ShareIconLink />
                <span>Copiar link</span>
              </button>
            </div>

            {shareMessage && (
              <div
                style={{
                  marginTop: "10px",
                  color: "#7a4d00",
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: 700,
                }}
              >
                {shareMessage}
              </div>
            )}

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

function ShareIconWhatsApp() {
  return (
    <svg viewBox="0 0 32 32" style={shareIconStyle}>
      <path d="M16.04 3C8.85 3 3 8.73 3 15.79c0 2.48.73 4.88 2.11 6.95L3 29l6.49-2.02a13.2 13.2 0 0 0 6.55 1.77h.01c7.19 0 13.04-5.73 13.04-12.79C29.09 8.73 23.24 3 16.04 3Zm0 23.45h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-3.85 1.2 1.26-3.72-.26-.38a10.43 10.43 0 0 1-1.66-5.63c0-5.8 4.72-10.52 10.52-10.52 2.8 0 5.43 1.08 7.41 3.04a10.36 10.36 0 0 1 3.09 7.45c0 5.8-4.72 10.52-10.54 10.52Zm5.77-7.87c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.69.08-.32-.16-1.33-.48-2.54-1.54-.94-.82-1.57-1.84-1.76-2.15-.18-.31-.02-.48.14-.63.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.68-.97-2.3-.25-.6-.51-.52-.71-.53l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.5 5.38 4.77.75.31 1.33.49 1.79.63.75.24 1.43.21 1.97.13.6-.09 1.88-.77 2.14-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function ShareIconFacebook() {
  return (
    <svg viewBox="0 0 24 24" style={shareIconStyle}>
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.7v8h2.8Z" />
    </svg>
  );
}

function ShareIconX() {
  return (
    <svg viewBox="0 0 24 24" style={shareIconStyle}>
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.26l-4.9-6.41L6.23 22H3.1l7.24-8.27L1 2h6.42l4.43 5.85L18.9 2Zm-1.1 18h1.73L6.47 3.9H4.61L17.8 20Z" />
    </svg>
  );
}

function ShareIconTelegram() {
  return (
    <svg viewBox="0 0 24 24" style={shareIconStyle}>
      <path d="M21.94 4.67a1.5 1.5 0 0 0-1.66-.23L3.1 12.13c-.79.35-.75 1.49.07 1.78l4.18 1.46 1.58 4.89c.24.74 1.18.95 1.72.38l2.3-2.42 4.52 3.31c.69.51 1.67.13 1.84-.71L22 6.14c.09-.52-.12-1.03-.56-1.47ZM9.63 14.62l8.6-6.84-6.96 8.3-.33 2.95-1.31-4.41Z" />
    </svg>
  );
}

function ShareIconMessenger() {
  return (
    <svg viewBox="0 0 24 24" style={shareIconStyle}>
      <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.91 1.45 5.5 3.72 7.19V22l3.27-1.8c.95.26 1.96.4 3.01.4 5.52 0 10-4.15 10-9.27S17.52 2 12 2Zm1.01 12.34-2.55-2.72-4.97 2.72 5.46-5.81 2.61 2.72 4.9-2.72-5.45 5.81Z" />
    </svg>
  );
}

function ShareIconLink() {
  return (
    <svg viewBox="0 0 24 24" style={shareIconStyle}>
      <path d="M10.59 13.41a1 1 0 0 0 1.41 1.41l3.59-3.59a3 3 0 0 0-4.24-4.24l-1.88 1.88a1 1 0 1 0 1.41 1.41l1.88-1.88a1 1 0 1 1 1.41 1.41l-3.58 3.6Zm2.82-2.82a1 1 0 0 0-1.41-1.41l-3.59 3.59a3 3 0 1 0 4.24 4.24l1.88-1.88a1 1 0 1 0-1.41-1.41l-1.88 1.88a1 1 0 1 1-1.41-1.41l3.58-3.6Z" />
    </svg>
  );
}

const shareIconStyle = {
  width: "16px",
  height: "16px",
  fill: "#5a3900",
  flexShrink: 0,
};

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

const shareNetworkButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(216,138,0,0.16)",
  background: "#fffaf0",
  color: "#5a3900",
  fontWeight: 800,
  fontFamily: montserrat.style.fontFamily,
  textDecoration: "none",
  cursor: "pointer",
  fontSize: "14px",
  boxShadow: "0 8px 18px rgba(216,138,0,0.08)",
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