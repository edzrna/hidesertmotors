"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { vehicles as rawVehicles } from "@/data/vehicles";
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
const SECONDARY_WHATSAPP = "+1 760 620 6390";
const PRIMARY_WHATSAPP_URL = "https://wa.me/17606411996";
const FACEBOOK_URL = "https://facebook.com/hidesertmotors";

export default function Home() {
  const moodScale = [
    {
      key: "good_option",
      label: "Buena opción",
      icon: "/icons/neutral.png",
      color: "#f0a43a",
      text: "#2f1b00",
    },
    {
      key: "good_deal",
      label: "Buen trato",
      icon: "/icons/good.png",
      color: "#f5b93f",
      text: "#2f1b00",
    },
    {
      key: "great_buy",
      label: "Muy buena compra",
      icon: "/icons/great.png",
      color: "#f7c84a",
      text: "#2f1b00",
    },
    {
      key: "best_option",
      label: "Mejor opción",
      icon: "/icons/best.png",
      color: "#ffd85a",
      text: "#2f1b00",
    },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width < 1100);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  function getHDMScore(vehicle: any) {
    const conditionScore = getConditionScore(vehicle.condition);
    const milesScore = getMilesScore(vehicle.miles);
    const yearScore = getYearScore(vehicle.year);
    const historyScore = getHistoryScore({
      titleStatus: vehicle.titleStatus,
      serviceRecords: vehicle.serviceRecords,
      accidents: vehicle.accidents,
      owners: vehicle.owners,
    });
    const valueScore = getMarketValueScore(
      vehicle.priceValue,
      vehicle.marketPrice
    );

    const total =
      conditionScore * 0.25 +
      milesScore * 0.2 +
      yearScore * 0.15 +
      historyScore * 0.25 +
      valueScore * 0.15;

    return Math.round(clamp(total, 60, 100));
  }

  function getHDMLevel(score: number) {
    if (score >= 90) return moodScale[3];
    if (score >= 80) return moodScale[2];
    if (score >= 70) return moodScale[1];
    return moodScale[0];
  }

  const vehicles = rawVehicles.map((vehicle) => {
    const score = getHDMScore(vehicle);
    const level = getHDMLevel(score);

    return {
      ...vehicle,
      score,
      level: level.label,
      color: level.color,
      text: level.text,
      icon: level.icon,
      iconKey: level.key,
    };
  });

  const reviews = [
    {
      name: "Daniel R.",
      mood: "Muy buena compra",
      text: "Todo fue claro, rápido y la troca estaba tal como en las fotos.",
    },
    {
      name: "Ashley M.",
      mood: "Buen trato",
      text: "La calificación me ayudó a entender el valor del auto desde el principio.",
    },
    {
      name: "Marco C.",
      mood: "Mejor opción",
      text: "De las mejores experiencias que he tenido comprando auto. Sin presión y todo claro.",
    },
  ];

  const inventoryScore = vehicles.length
    ? Math.round(
        vehicles.reduce((sum, vehicle) => sum + vehicle.score, 0) /
          vehicles.length
      )
    : 60;

  const inventoryLevel = getHDMLevel(inventoryScore);
  const featuredVehicle = vehicles[0];
  const bestVehicle = [...vehicles].sort((a, b) => b.score - a.score)[0];

  const featuredGallery = featuredVehicle?.gallery?.length
    ? featuredVehicle.gallery
    : featuredVehicle
    ? [featuredVehicle.image]
    : [];

  const activeFeaturedImage =
    featuredGallery?.[activeFeaturedIndex] || featuredVehicle?.image;

  useEffect(() => {
    setActiveFeaturedIndex(0);
  }, [featuredVehicle?.id]);

  function animateToSlide(nextIndex: number) {
    setIsImageVisible(false);

    window.setTimeout(() => {
      setActiveFeaturedIndex(nextIndex);
      setIsImageVisible(true);
    }, 140);
  }

  function goToFeaturedSlide(index: number) {
    if (index === activeFeaturedIndex) return;
    animateToSlide(index);
  }

  function goToPrevFeaturedSlide() {
    const nextIndex =
      activeFeaturedIndex === 0
        ? featuredGallery.length - 1
        : activeFeaturedIndex - 1;

    animateToSlide(nextIndex);
  }

  function goToNextFeaturedSlide() {
    const nextIndex =
      activeFeaturedIndex === featuredGallery.length - 1
        ? 0
        : activeFeaturedIndex + 1;

    animateToSlide(nextIndex);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.changedTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    touchEndX.current = e.changedTouches[0].clientX;

    if (touchStartX.current === null || touchEndX.current === null) return;

    const delta = touchStartX.current - touchEndX.current;

    if (delta > 40) {
      goToNextFeaturedSlide();
    } else if (delta < -40) {
      goToPrevFeaturedSlide();
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
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background:
            "linear-gradient(180deg, rgba(7,16,24,0.96), rgba(7,16,24,0.92))",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(245,197,66,0.14)",
          boxShadow: isScrolled
            ? "0 10px 30px rgba(0,0,0,0.22)"
            : "none",
          transition: "all 0.3s ease",
          padding: isScrolled ? "6px 0" : "0px",
        }}
      >
        <section
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: isMobile ? "12px 14px 10px" : "16px 20px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: isMobile ? "12px" : "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "10px" : "14px",
                width: isTablet ? "100%" : "auto",
                justifyContent: isTablet ? "center" : "flex-start",
                textAlign: isTablet ? "center" : "left",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <img
                src="/logo.png"
                alt="HI DESERT MOTORS"
                style={{
                  width: isScrolled ? "110px" : isMobile ? "120px" : "220px",
                  height: isScrolled ? "110px" : isMobile ? "120px" : "220px",
                  objectFit: "contain",
                  transition: "all 0.35s ease",
                  filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.12))",
                  display: "block",
                  margin: isTablet ? "0 auto" : "0",
                }}
              />

              {!isMobile && (
                <div>
                  <div
                    style={{
                      fontSize: isScrolled ? "18px" : isTablet ? "22px" : "26px",
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                      transition: "all 0.3s ease",
                      fontFamily: montserrat.style.fontFamily,
                      color: "#ffffff",
                      textShadow: "0 2px 10px rgba(0,0,0,0.18)",
                    }}
                  >
                    Compra con confianza.
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
                width: isTablet ? "100%" : "auto",
                justifyContent: "center",
              }}
            >
              <a
                href="#inventario"
                style={{
                  ...primaryButtonStyle,
                  padding: isScrolled ? "10px 14px" : isMobile ? "11px 14px" : "12px 18px",
                  fontSize: isScrolled ? "13px" : isMobile ? "13px" : "15px",
                  textAlign: "center",
                }}
              >
                Ver inventario
              </a>

              <a
                href="#opiniones"
                style={{
                  ...ghostButtonStyle,
                  padding: isScrolled ? "10px 14px" : isMobile ? "11px 14px" : "12px 18px",
                  fontSize: isScrolled ? "13px" : isMobile ? "13px" : "15px",
                  textAlign: "center",
                }}
              >
                Opiniones
              </a>

              <a
                href={PRIMARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                style={{
                  ...whatsAppIconButtonStyle,
                  width: isScrolled ? "42px" : isMobile ? "44px" : "50px",
                  height: isScrolled ? "42px" : isMobile ? "44px" : "50px",
                }}
              >
                <svg
                  viewBox="0 0 32 32"
                  style={{ width: 20, height: 20, fill: "#071018" }}
                >
                  <path d="M16.04 3C8.85 3 3 8.73 3 15.79c0 2.48.73 4.88 2.11 6.95L3 29l6.49-2.02a13.2 13.2 0 0 0 6.55 1.77h.01c7.19 0 13.04-5.73 13.04-12.79C29.09 8.73 23.24 3 16.04 3Zm0 23.45h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-3.85 1.2 1.26-3.72-.26-.38a10.43 10.43 0 0 1-1.66-5.63c0-5.8 4.72-10.52 10.52-10.52 2.8 0 5.43 1.08 7.41 3.04a10.36 10.36 0 0 1 3.09 7.45c0 5.8-4.72 10.52-10.54 10.52Zm5.77-7.87c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.69.08-.32-.16-1.33-.48-2.54-1.54-.94-.82-1.57-1.84-1.76-2.15-.18-.31-.02-.48.14-.63.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.68-.97-2.3-.25-.6-.51-.52-.71-.53l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.5 5.38 4.77.75.31 1.33.49 1.79.63.75.24 1.43.21 1.97.13.6-.09 1.88-.77 2.14-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </header>

      <section
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: isMobile ? "18px 14px 14px" : "28px 20px 18px",
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "minmax(0,1.2fr) minmax(340px,0.8fr)",
          gap: isMobile ? "16px" : "22px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            borderRadius: isMobile ? "22px" : "30px",
            border: "1px solid rgba(216,138,0,0.10)",
            background: "#ffffff",
            padding: isMobile ? "18px" : isTablet ? "22px" : "32px",
            boxShadow: "0 18px 48px rgba(216,138,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={pillStyle}>Calificación HDM</div>

          <h1
            style={{
              fontSize: isMobile ? "28px" : isTablet ? "34px" : "clamp(26px, 6vw, 40px)",
              lineHeight: 0.98,
              margin: "0 0 14px 0",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              fontFamily: montserrat.style.fontFamily,
              maxWidth: "680px",
            }}
          >
            Encuentra el auto correcto.
            <br />
            Sin adivinar.
          </h1>

          <p
            style={{
              color: "#5b6b7f",
              fontSize: isMobile ? "15px" : "18px",
              lineHeight: 1.6,
              maxWidth: isTablet ? "100%" : "650px",
              marginBottom: "20px",
            }}
          >
            Vehículos usados con una calificación clara basada en condición,
            precio, millas y confianza del comprador.
          </p>

          <div
            style={{
              ...meterWrapStyle,
              padding: isMobile ? "14px" : "18px",
              borderRadius: isMobile ? "18px" : "22px",
            }}
          >
            <div
              style={{
                ...meterHeaderStyle,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? "8px" : "12px",
                marginBottom: isMobile ? "14px" : "16px",
              }}
            >
              <span style={{ fontSize: isMobile ? "13px" : "14px" }}>
                Nivel general del inventario
              </span>
              <strong
                style={{
                  color: "#b97400",
                  fontSize: isMobile ? "14px" : "15px",
                }}
              >
                {inventoryLevel.label} - {inventoryScore}
              </strong>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : isTablet
                  ? "repeat(4, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))",
                gap: isMobile ? "12px 10px" : "14px",
              }}
            >
              {moodScale.map((item) => (
                <div key={item.key} style={scaleGridItemStyle}>
                  <div
                    style={{
                      ...scaleIconFrameStyle,
                      width: isMobile ? "54px" : "64px",
                      height: isMobile ? "54px" : "64px",
                      border:
                        item.key === inventoryLevel.key
                          ? "2px solid #0b1622"
                          : "1px solid rgba(216,138,0,0.10)",
                    }}
                  >
                    <img src={item.icon} alt={item.label} style={scaleIconStyle} />
                  </div>
                  <div
                    style={{
                      ...scaleLabelStyle,
                      fontSize: isMobile ? "11px" : "12px",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {bestVehicle && (
            <div
              style={{
                marginTop: "16px",
                padding: isMobile ? "13px 14px" : "16px",
                borderRadius: "18px",
                background: "#fff8ea",
                border: "1px solid rgba(216,138,0,0.10)",
                color: "#7a4d00",
                fontSize: isMobile ? "13px" : "14px",
                lineHeight: 1.6,
                wordBreak: "break-word",
              }}
            >
              Mejor evaluado del inventario: <strong>{bestVehicle.name}</strong> con{" "}
              <strong>{bestVehicle.score}</strong> puntos.
            </div>
          )}
        </div>

        {featuredVehicle && (
          <div
            style={{
              borderRadius: isMobile ? "22px" : "30px",
              border: "1px solid rgba(216,138,0,0.10)",
              background: "#ffffff",
              padding: isMobile ? "16px" : isTablet ? "18px" : "24px",
              boxShadow: "0 18px 48px rgba(216,138,0,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 13,
                marginBottom: 8,
                color: "#8a5a00",
                fontFamily: montserrat.style.fontFamily,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              Auto destacado
            </div>

            <div
              style={{
                fontSize: isMobile ? 19 : isTablet ? 22 : 24,
                fontWeight: 800,
                lineHeight: 1.08,
                fontFamily: montserrat.style.fontFamily,
                wordBreak: "break-word",
              }}
            >
              {featuredVehicle.name}
            </div>

            <div
              style={{ position: "relative", marginTop: 14 }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={activeFeaturedImage}
                alt={featuredVehicle.name}
                style={{
                  width: "100%",
                  height: isMobile ? 220 : isTablet ? 280 : 320,
                  objectFit: "cover",
                  borderRadius: isMobile ? 18 : 20,
                  opacity: isImageVisible ? 1 : 0.4,
                  transition: "0.25s",
                  display: "block",
                  cursor: "zoom-in",
                  touchAction: "pan-y",
                }}
                onClick={() => setIsLightboxOpen(true)}
              />

              {featuredGallery.length > 1 && (
                <>
                  <button
                    onClick={goToPrevFeaturedSlide}
                    aria-label="Imagen anterior"
                    style={{
                      ...featuredArrowStyle,
                      left: "10px",
                      width: isMobile ? "42px" : "44px",
                      height: isMobile ? "42px" : "44px",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={goToNextFeaturedSlide}
                    aria-label="Imagen siguiente"
                    style={{
                      ...featuredArrowStyle,
                      right: "10px",
                      width: isMobile ? "42px" : "44px",
                      height: isMobile ? "42px" : "44px",
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {featuredGallery.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                  paddingBottom: "4px",
                }}
              >
                {featuredGallery.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToFeaturedSlide(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
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
                      alt={`${featuredVehicle.name} ${index + 1}`}
                      style={{
                        width: isMobile ? "64px" : "76px",
                        height: isMobile ? "64px" : "76px",
                        minWidth: isMobile ? "64px" : "76px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border:
                          index === activeFeaturedIndex
                            ? "2px solid #7a4d00"
                            : "1px solid rgba(216,138,0,0.12)",
                        display: "block",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 14,
                fontSize: isMobile ? 24 : 28,
                fontWeight: 900,
                fontFamily: montserrat.style.fontFamily,
                lineHeight: 1,
              }}
            >
              {featuredVehicle.priceText}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "16px",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <Link
                href={`/car/${featuredVehicle.id}`}
                style={{
                  ...primaryButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  textAlign: "center",
                }}
              >
                Ver detalles
              </Link>

              <a
                href={`${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                  `Hola, me interesa el ${featuredVehicle.name}`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...ghostButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  textAlign: "center",
                }}
              >
                Pedir información
              </a>
            </div>
          </div>
        )}
      </section>

      <section
        id="inventario"
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: isMobile ? "10px 14px 22px" : "18px 20px 24px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              color: "#8a5a00",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "12px",
              marginBottom: "8px",
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Inventario
          </div>

          <h2
            style={{
              fontSize: isMobile ? "28px" : "36px",
              margin: 0,
              fontWeight: 900,
              lineHeight: 1.05,
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Vehículos calificados automáticamente
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              style={{
                borderRadius: isMobile ? "22px" : "26px",
                overflow: "hidden",
                border: "1px solid rgba(216,138,0,0.10)",
                background: "#ffffff",
                boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    background: "rgba(255,250,240,0.96)",
                    border: "1px solid rgba(216,138,0,0.14)",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#7a4d00",
                    fontFamily: montserrat.style.fontFamily,
                  }}
                >
                  {vehicle.tag}
                </div>
              </div>

              <div style={{ padding: isMobile ? "16px" : "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "start",
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: isMobile ? "20px" : "22px",
                      lineHeight: 1.1,
                      fontFamily: montserrat.style.fontFamily,
                    }}
                  >
                    {vehicle.name}
                  </h3>

                  <div
                    style={{
                      color: "#0b1622",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      fontSize: isMobile ? "20px" : "inherit",
                      fontFamily: montserrat.style.fontFamily,
                    }}
                  >
                    {vehicle.priceText}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={vehicle.icon}
                    alt={vehicle.level}
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "contain",
                    }}
                  />

                  <div
                    style={{
                      padding: "9px 13px",
                      borderRadius: "999px",
                      background: vehicle.color,
                      color: vehicle.text,
                      fontWeight: 800,
                      fontSize: "14px",
                      fontFamily: montserrat.style.fontFamily,
                    }}
                  >
                    {vehicle.level} - {vehicle.score}
                  </div>
                </div>

                <p
                  style={{
                    color: "#5b6b7f",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    marginTop: "14px",
                  }}
                >
                  {vehicle.details}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, 1fr)",
                    gap: "8px",
                    marginTop: "14px",
                    fontSize: "13px",
                    color: "#7a4d00",
                  }}
                >
                  <div>Año: {vehicle.year}</div>
                  <div>Millas: {vehicle.miles.toLocaleString()}</div>
                  <div>Título: {vehicle.titleStatus}</div>
                  <div>Dueños: {vehicle.owners}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "18px",
                    flexWrap: "wrap",
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <Link
                    href={`/car/${vehicle.id}`}
                    style={{
                      ...primaryButtonStyle,
                      width: isMobile ? "100%" : "auto",
                      textAlign: "center",
                    }}
                  >
                    Ver detalles
                  </Link>

                  <a
                    href={`${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                      `Hola, me interesa el ${vehicle.name}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...ghostButtonStyle,
                      width: isMobile ? "100%" : "auto",
                      textAlign: "center",
                    }}
                  >
                    Pedir información
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="opiniones"
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: isMobile ? "4px 14px 40px" : "8px 20px 60px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              color: "#8a5a00",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "12px",
              marginBottom: "8px",
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Opiniones
          </div>

          <h2
            style={{
              fontSize: isMobile ? "28px" : "36px",
              margin: 0,
              fontWeight: 900,
              lineHeight: 1.05,
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {reviews.map((review, index) => (
            <article
              key={index}
              style={{
                ...reviewCardStyle,
                padding: isMobile ? "18px" : "22px",
                borderRadius: isMobile ? "20px" : "24px",
              }}
            >
              <div style={pillStyle}>{review.mood}</div>

              <p
                style={{
                  color: "#1b2c42",
                  lineHeight: 1.7,
                  margin: "14px 0 18px",
                  fontSize: isMobile ? "14px" : "15px",
                }}
              >
                "{review.text}"
              </p>

              <div style={{ color: "#5b6b7f", fontWeight: 700 }}>
                {review.name}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(245,197,66,0.10)",
          background:
            "linear-gradient(180deg, rgba(7,16,24,0.98), rgba(4,10,16,1))",
          color: "#f5f7fb",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: isMobile ? "26px 14px 30px" : "34px 20px 40px",
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1.1fr 0.9fr",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "18px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: isTablet ? "center" : "flex-start",
              textAlign: isTablet ? "center" : "left",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <img
              src="/logo.png"
              alt="HI DESERT MOTORS"
              style={{
                width: isMobile ? "96px" : "120px",
                height: isMobile ? "96px" : "120px",
                objectFit: "contain",
              }}
            />

            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: isMobile ? "20px" : "22px",
                  marginBottom: "8px",
                  fontFamily: montserrat.style.fontFamily,
                }}
              >
                HI DESERT MOTORS
              </div>

              <div
                style={{
                  color: "#c9d2df",
                  lineHeight: 1.8,
                  fontSize: isMobile ? "14px" : "15px",
                }}
              >
                Vehículos usados seleccionados con una evaluación clara.
                <br />
                Hesperia, California
              </div>
            </div>
          </div>

          <div
            style={{
              padding: isMobile ? "18px" : "22px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                color: "#f5c542",
                fontSize: "12px",
                textTransform: "uppercase",
                marginBottom: "14px",
                fontFamily: montserrat.style.fontFamily,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Redes de contacto
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: isMobile ? "center" : "flex-start",
                flexWrap: "wrap",
              }}
            >
              <a
                href="mailto:ventas@hidesertmotors.com"
                aria-label="Email"
                style={socialIconButtonStyle}
              >
                <svg viewBox="0 0 24 24" style={footerIconSvgStyle}>
                  <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.01L12 13l8-5.99V7H4Zm16 10V9.49l-7.4 5.55a1 1 0 0 1-1.2 0L4 9.49V17h16Z" />
                </svg>
              </a>

              <a
                href="https://wa.me/17606411996"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp principal"
                style={socialIconButtonStyle}
              >
                <svg viewBox="0 0 32 32" style={footerIconSvgStyle}>
                  <path d="M16.04 3C8.85 3 3 8.73 3 15.79c0 2.48.73 4.88 2.11 6.95L3 29l6.49-2.02a13.2 13.2 0 0 0 6.55 1.77h.01c7.19 0 13.04-5.73 13.04-12.79C29.09 8.73 23.24 3 16.04 3Zm0 23.45h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-3.85 1.2 1.26-3.72-.26-.38a10.43 10.43 0 0 1-1.66-5.63c0-5.8 4.72-10.52 10.52-10.52 2.8 0 5.43 1.08 7.41 3.04a10.36 10.36 0 0 1 3.09 7.45c0 5.8-4.72 10.52-10.54 10.52Zm5.77-7.87c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.69.08-.32-.16-1.33-.48-2.54-1.54-.94-.82-1.57-1.84-1.76-2.15-.18-.31-.02-.48.14-.63.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.68-.97-2.3-.25-.6-.51-.52-.71-.53l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.5 5.38 4.77.75.31 1.33.49 1.79.63.75.24 1.43.21 1.97.13.6-.09 1.88-.77 2.14-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
                </svg>
              </a>

              <a
                href="https://wa.me/17606206390"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp secundario"
                style={socialIconButtonStyle}
              >
                <svg viewBox="0 0 32 32" style={footerIconSvgStyle}>
                  <path d="M16.04 3C8.85 3 3 8.73 3 15.79c0 2.48.73 4.88 2.11 6.95L3 29l6.49-2.02a13.2 13.2 0 0 0 6.55 1.77h.01c7.19 0 13.04-5.73 13.04-12.79C29.09 8.73 23.24 3 16.04 3Zm0 23.45h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-3.85 1.2 1.26-3.72-.26-.38a10.43 10.43 0 0 1-1.66-5.63c0-5.8 4.72-10.52 10.52-10.52 2.8 0 5.43 1.08 7.41 3.04a10.36 10.36 0 0 1 3.09 7.45c0 5.8-4.72 10.52-10.54 10.52Zm5.77-7.87c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.69.08-.32-.16-1.33-.48-2.54-1.54-.94-.82-1.57-1.84-1.76-2.15-.18-.31-.02-.48.14-.63.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.68-.97-2.3-.25-.6-.51-.52-.71-.53l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.5 5.38 4.77.75.31 1.33.49 1.79.63.75.24 1.43.21 1.97.13.6-.09 1.88-.77 2.14-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
                </svg>
              </a>

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                style={socialIconButtonStyle}
              >
                <svg viewBox="0 0 24 24" style={footerIconSvgStyle}>
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.7v8h2.8Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {isLightboxOpen && featuredVehicle && (
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
            style={closeLightboxStyle}
          >
            ×
          </button>

          <img
            src={activeFeaturedImage}
            alt={featuredVehicle.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "94vw",
              maxHeight: "88vh",
              borderRadius: isMobile ? "16px" : "20px",
              display: "block",
            }}
          />
        </div>
      )}
    </main>
  );
}

/* ================= STYLES ================= */

const reviewCardStyle = {
  padding: "22px",
  borderRadius: "24px",
  border: "1px solid rgba(216,138,0,0.10)",
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(135deg,#f5c542,#d88a00)",
  color: "#071018",
  fontWeight: 800,
  textDecoration: "none",
  fontFamily: montserrat.style.fontFamily,
  boxShadow: "0 10px 24px rgba(216,138,0,0.20)",
};

const ghostButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "999px",
  border: "1px solid rgba(216,138,0,0.18)",
  background: "#fffaf0",
  color: "#5a3900",
  textDecoration: "none",
  fontWeight: 700,
  fontFamily: montserrat.style.fontFamily,
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#fff7e6",
  color: "#8a5a00",
  border: "1px solid rgba(216,138,0,0.12)",
  fontSize: "12px",
  fontWeight: 800,
  marginBottom: "16px",
  fontFamily: montserrat.style.fontFamily,
};

const meterWrapStyle = {
  background: "#fffdf8",
  border: "1px solid rgba(216,138,0,0.10)",
};

const meterHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#7a4d00",
  fontWeight: 700,
};

const scaleGridItemStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  textAlign: "center" as const,
  gap: "8px",
  minWidth: 0,
};

const scaleIconFrameStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "18px",
  background: "#ffffff",
  boxShadow: "0 8px 20px rgba(216,138,0,0.06)",
  margin: "0 auto",
};

const scaleIconStyle = {
  width: "64%",
  height: "64%",
  objectFit: "contain" as const,
};

const scaleLabelStyle = {
  color: "#6c5030",
  lineHeight: 1.3,
  fontWeight: 700,
  wordBreak: "break-word" as const,
};

const whatsAppIconButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  textDecoration: "none",
  background: "linear-gradient(135deg,#f5c542,#d88a00)",
  boxShadow: "0 10px 24px rgba(216,138,0,0.22)",
  flexShrink: 0,
};

const featuredArrowStyle = {
  position: "absolute" as const,
  top: "50%",
  transform: "translateY(-50%)",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(7,16,24,0.45)",
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(6px)",
};

const socialIconButtonStyle = {
  width: "48px",
  height: "48px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  textDecoration: "none",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const footerIconSvgStyle = {
  width: "22px",
  height: "22px",
  fill: "#f5f7fb",
};

const closeLightboxStyle = {
  position: "absolute" as const,
  top: "16px",
  right: "16px",
  width: "42px",
  height: "42px",
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
};