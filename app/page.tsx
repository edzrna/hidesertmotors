"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 760);
      setIsTablet(window.innerWidth < 980);
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
    const valueScore = getMarketValueScore(vehicle.priceValue, vehicle.marketPrice);

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
    ? Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.score, 0) / vehicles.length)
    : 60;

  const inventoryLevel = getHDMLevel(inventoryScore);
  const featuredVehicle = vehicles[0];
  const bestVehicle = [...vehicles].sort((a, b) => b.score - a.score)[0];

  const featuredGallery = featuredVehicle?.gallery || [featuredVehicle?.image];
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
    }, 160);
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
          background: "linear-gradient(180deg, rgba(7,16,24,0.96), rgba(7,16,24,0.92))",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(245,197,66,0.14)",
          boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.22)" : "none",
          transition: "all 0.3s ease",
          padding: isScrolled ? "6px 0" : "0px",
        }}
      >
        <section
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "16px 20px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                width: isTablet ? "100%" : "auto",
                justifyContent: isTablet ? "center" : "flex-start",
                textAlign: isTablet ? "center" : "left",
              }}
            >
              <img
                src="/logo.png"
                alt="HI DESERT MOTORS"
                style={{
                  width: isScrolled ? "120px" : isMobile ? "150px" : "220px",
                  height: isScrolled ? "120px" : isMobile ? "150px" : "220px",
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
                      fontSize: isScrolled ? "18px" : "26px",
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
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "center" : "flex-end",
              }}
            >
              <a
                href="#inventario"
                style={{
                  ...primaryButtonStyle,
                  padding: isScrolled ? "10px 14px" : "12px 18px",
                  fontSize: isScrolled ? "13px" : "15px",
                  transition: "all 0.3s ease",
                }}
              >
                Ver inventario
              </a>

              <a
                href="#opiniones"
                style={{
                  ...ghostButtonStyle,
                  padding: isScrolled ? "10px 14px" : "12px 18px",
                  fontSize: isScrolled ? "13px" : "15px",
                  transition: "all 0.3s ease",
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
                  width: isScrolled ? "42px" : "50px",
                  height: isScrolled ? "42px" : "50px",
                  transition: "all 0.3s ease",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  style={{
                    width: isScrolled ? "18px" : "22px",
                    height: isScrolled ? "18px" : "22px",
                    fill: "#071018",
                    transition: "all 0.3s ease",
                  }}
                >
                  <path d="M19.11 17.21c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.14-1.31-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.33.97 2.62 1.11 2.8.13.18 1.91 2.92 4.63 4.09.65.28 1.16.44 1.56.56.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
                  <path d="M16.02 3.2c-7 0-12.67 5.67-12.67 12.67 0 2.22.58 4.39 1.68 6.31L3.2 28.8l6.78-1.78a12.63 12.63 0 0 0 6.04 1.53h.01c6.99 0 12.67-5.67 12.67-12.67S23.02 3.2 16.02 3.2zm0 23.18h-.01a10.48 10.48 0 0 1-5.34-1.46l-.38-.22-4.02 1.05 1.07-3.92-.25-.4a10.45 10.45 0 0 1-1.61-5.56c0-5.79 4.71-10.49 10.5-10.49 2.8 0 5.43 1.09 7.41 3.07a10.4 10.4 0 0 1 3.08 7.42c0 5.79-4.71 10.49-10.5 10.49z" />
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
          padding: "28px 20px 18px",
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "1.2fr 0.8fr",
          gap: "22px",
        }}
      >
        <div
          style={{
            borderRadius: "30px",
            border: "1px solid rgba(216,138,0,0.10)",
            background: "#ffffff",
            padding: isMobile ? "22px" : "32px",
            boxShadow: "0 18px 48px rgba(216,138,0,0.06)",
          }}
        >
          <div style={pillStyle}>Calificación HDM</div>

          <h1
            style={{
              fontSize: isMobile ? "34px" : "clamp(26px, 6vw, 40px)",
              lineHeight: 0.95,
              margin: "0 0 16px 0",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Encuentra el auto correcto.
            <br />
            Sin adivinar.
          </h1>

          <p
            style={{
              color: "#5b6b7f",
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: 1.6,
              maxWidth: "650px",
              marginBottom: "26px",
            }}
          >
            Vehículos usados con una calificación clara basada en condición,
            precio, millas y confianza del comprador.
          </p>

          <div style={meterWrapStyle}>
            <div style={meterHeaderStyle}>
              <span>Nivel general del inventario</span>
              <strong
                style={{
                  color: "#b97400",
                  fontFamily: montserrat.style.fontFamily,
                }}
              >
                {inventoryLevel.label} - {inventoryScore}
              </strong>
            </div>

            <div style={iconScaleWrapStyle}>
              {moodScale.map((item) => (
                <div key={item.key} style={scaleItemStyle}>
                  <div
                    style={{
                      ...scaleIconFrameStyle,
                      border:
                        item.key === inventoryLevel.key
                          ? "2px solid #0b1622"
                          : "1px solid rgba(216,138,0,0.10)",
                      transform:
                        item.key === inventoryLevel.key ? "scale(1.06)" : "scale(1)",
                    }}
                  >
                    <img src={item.icon} alt={item.label} style={scaleIconStyle} />
                  </div>
                  <div style={scaleLabelStyle}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: "14px",
              marginTop: "22px",
            }}
          >
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Calificación HDM</div>
              <div style={statValueStyle}>{inventoryScore}</div>
              <div style={statSubStyle}>{inventoryLevel.label}</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Autos disponibles</div>
              <div style={statValueStyle}>{vehicles.length}</div>
              <div style={statSubStyle}>Actualizado cada semana</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Mejor auto actual</div>
              <div style={statValueStyle}>{bestVehicle?.score || 60}</div>
              <div style={statSubStyle}>{bestVehicle?.level || "-"}</div>
            </div>
          </div>
        </div>

        {featuredVehicle && (
          <div
            style={{
              borderRadius: "30px",
              border: "1px solid rgba(216,138,0,0.10)",
              background: "#ffffff",
              padding: isMobile ? "18px" : "24px",
              boxShadow: "0 18px 48px rgba(216,138,0,0.06)",
            }}
          >
            <div
              style={{
                color: "#8a5a00",
                fontSize: "13px",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              Auto destacado
            </div>
            <div
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: 800,
                marginBottom: "18px",
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              {featuredVehicle.name}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ position: "relative" }}>
                <img
                  src={activeFeaturedImage}
                  alt={featuredVehicle.name}
                  onClick={() => setIsLightboxOpen(true)}
                  style={{
                    width: "100%",
                    height: isMobile ? "240px" : "320px",
                    objectFit: "cover",
                    borderRadius: "22px",
                    marginBottom: "12px",
                    cursor: "zoom-in",
                    opacity: isImageVisible ? 1 : 0.35,
                    transform: isImageVisible ? "scale(1)" : "scale(0.985)",
                    transition: "opacity 0.28s ease, transform 0.28s ease",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  }}
                />

                {featuredGallery.length > 1 && (
                  <>
                    <button onClick={goToPrevFeaturedSlide} style={featureArrowLeftStyle}>
                      ‹
                    </button>

                    <button onClick={goToNextFeaturedSlide} style={featureArrowRightStyle}>
                      ›
                    </button>
                  </>
                )}

                <button onClick={() => setIsLightboxOpen(true)} style={viewLargeButtonStyle}>
                  Ver grande
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                  scrollbarWidth: "thin",
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {featuredGallery.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${featuredVehicle.name} ${index + 1}`}
                    onClick={() => goToFeaturedSlide(index)}
                    style={{
                      width: "72px",
                      height: "72px",
                      minWidth: "72px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      cursor: "pointer",
                      border:
                        activeFeaturedIndex === index
                          ? "2px solid #0b1622"
                          : "1px solid rgba(216,138,0,0.10)",
                      opacity: activeFeaturedIndex === index ? 1 : 0.82,
                      flexShrink: 0,
                      background: "#fff",
                      transition: "all 0.22s ease",
                      transform: activeFeaturedIndex === index ? "scale(1.02)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#0b1622",
                  fontFamily: montserrat.style.fontFamily,
                }}
              >
                {featuredVehicle.priceText}
              </div>

              <div style={featuredBadgeWrapStyle}>
                <img
                  src={featuredVehicle.icon}
                  alt={featuredVehicle.level}
                  style={featuredBadgeIconStyle}
                />
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    background: featuredVehicle.color,
                    color: featuredVehicle.text,
                    fontWeight: 800,
                    fontFamily: montserrat.style.fontFamily,
                  }}
                >
                  {featuredVehicle.level} - {featuredVehicle.score}
                </div>
              </div>
            </div>

            <div style={{ color: "#5b6b7f", lineHeight: 1.7, marginBottom: "18px" }}>
              {featuredVehicle.details}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link href={`/car/${featuredVehicle.id}`} style={primaryButtonStyle}>
                Ver detalles
              </Link>
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "8px 20px 18px",
        }}
      >
        <div style={tickerWrapStyle}>
          <span>
            Mejor calificación de la semana: {bestVehicle?.name || "-"} - {bestVehicle?.score || 60}
          </span>
          <span>|</span>
          <span>Nivel general: {inventoryLevel.label}</span>
          <span>|</span>
          <span>Autos evaluados por datos reales</span>
          <span>|</span>
          <span>Hesperia, California</span>
        </div>
      </section>

      <section
        id="inventario"
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "18px 20px 24px",
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
              fontSize: isMobile ? "30px" : "36px",
              margin: 0,
              fontWeight: 900,
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Vehículos calificados automáticamente
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              style={{
                borderRadius: "26px",
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

              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "start",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "22px",
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
                      fontFamily: montserrat.style.fontFamily,
                    }}
                  >
                    {vehicle.priceText}
                  </div>
                </div>

                <div style={vehicleMoodWrapStyle}>
                  <img
                    src={vehicle.icon}
                    alt={vehicle.level}
                    style={vehicleMoodIconStyle}
                  />
                  <div
                    style={{
                      display: "inline-flex",
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
                    margin: "14px 0 0",
                  }}
                >
                  {vehicle.details}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "8px",
                    marginTop: "14px",
                    color: "#7a4d00",
                    fontSize: "13px",
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
                  }}
                >
                  <Link href={`/car/${vehicle.id}`} style={primaryButtonStyle}>
                    Ver detalles
                  </Link>
                  <a
                    href={`https://wa.me/17606411996?text=Hola, me interesa el ${vehicle.name}`}
                    target="_blank"
                    rel="noreferrer"
                    style={ghostButtonStyle}
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
          padding: "8px 20px 60px",
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
              fontSize: isMobile ? "30px" : "36px",
              margin: 0,
              fontWeight: 900,
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {reviews.map((review, index) => (
            <article key={index} style={reviewCardStyle}>
              <div style={pillStyle}>{review.mood}</div>
              <p
                style={{
                  color: "#1b2c42",
                  lineHeight: 1.7,
                  margin: "14px 0 18px",
                }}
              >
                "{review.text}"
              </p>
              <div style={{ color: "#5b6b7f", fontWeight: 700 }}>{review.name}</div>
            </article>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(245,197,66,0.10)",
          background: "linear-gradient(180deg, rgba(7,16,24,0.98), rgba(4,10,16,1))",
          color: "#f5f7fb",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "34px 20px 40px",
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
            }}
          >
            <img
              src="/logo.png"
              alt="HI DESERT MOTORS"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
                display: "block",
                margin: isTablet ? "0 auto" : "0",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "22px",
                  marginBottom: "8px",
                  fontFamily: montserrat.style.fontFamily,
                  color: "#ffffff",
                }}
              >
                HI DESERT MOTORS
              </div>
              <div style={{ color: "#c9d2df", lineHeight: 1.8, maxWidth: "420px" }}>
                Vehículos usados seleccionados con una evaluación clara para comprar con confianza.
                <br />
                Hesperia, California
              </div>
            </div>
          </div>

          <div
            style={{
              justifySelf: isTablet ? "stretch" : "end",
              width: "100%",
              maxWidth: "420px",
              padding: "22px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(245,197,66,0.10)",
              boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                color: "#f5c542",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                marginBottom: "14px",
                fontFamily: montserrat.style.fontFamily,
              }}
            >
              Contacto
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <a href="mailto:ventas@hidesertmotors.com" style={footerContactRowStyle}>
                <span style={footerIconWrapStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={footerIconStyle}>
                    <path d="M3 5h18a1 1 0 0 1 1 1v.2l-10 6.25L2 6.2V6a1 1 0 0 1 1-1Zm19 3.43V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.43l9.47 5.92a1 1 0 0 0 1.06 0L22 8.43Z" />
                  </svg>
                </span>
                <span style={footerContactTextStyle}>ventas@hidesertmotors.com</span>
              </a>

              <a
                href="https://wa.me/17606411996"
                target="_blank"
                rel="noreferrer"
                style={footerContactRowStyle}
              >
                <span style={footerIconWrapStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={footerIconStyle}>
                    <path d="M19.11 17.21c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.14-1.31-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.33.97 2.62 1.11 2.8.13.18 1.91 2.92 4.63 4.09.65.28 1.16.44 1.56.56.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
                    <path d="M16.02 3.2c-7 0-12.67 5.67-12.67 12.67 0 2.22.58 4.39 1.68 6.31L3.2 28.8l6.78-1.78a12.63 12.63 0 0 0 6.04 1.53h.01c6.99 0 12.67-5.67 12.67-12.67S23.02 3.2 16.02 3.2zm0 23.18h-.01a10.48 10.48 0 0 1-5.34-1.46l-.38-.22-4.02 1.05 1.07-3.92-.25-.4a10.45 10.45 0 0 1-1.61-5.56c0-5.79 4.71-10.49 10.5-10.49 2.8 0 5.43 1.09 7.41 3.07a10.4 10.4 0 0 1 3.08 7.42c0 5.79-4.71 10.49-10.5 10.49z" />
                  </svg>
                </span>
                <span style={footerContactTextStyle}>{PRIMARY_WHATSAPP}</span>
              </a>

              <a
                href="https://wa.me/17606206390"
                target="_blank"
                rel="noreferrer"
                style={footerContactRowStyle}
              >
                <span style={footerIconWrapStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={footerIconStyle}>
                    <path d="M19.11 17.21c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.14-1.31-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.33.97 2.62 1.11 2.8.13.18 1.91 2.92 4.63 4.09.65.28 1.16.44 1.56.56.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
                    <path d="M16.02 3.2c-7 0-12.67 5.67-12.67 12.67 0 2.22.58 4.39 1.68 6.31L3.2 28.8l6.78-1.78a12.63 12.63 0 0 0 6.04 1.53h.01c6.99 0 12.67-5.67 12.67-12.67S23.02 3.2 16.02 3.2zm0 23.18h-.01a10.48 10.48 0 0 1-5.34-1.46l-.38-.22-4.02 1.05 1.07-3.92-.25-.4a10.45 10.45 0 0 1-1.61-5.56c0-5.79 4.71-10.49 10.5-10.49 2.8 0 5.43 1.09 7.41 3.07a10.4 10.4 0 0 1 3.08 7.42c0 5.79-4.71 10.49-10.5 10.49z" />
                  </svg>
                </span>
                <span style={footerContactTextStyle}>{SECONDARY_WHATSAPP}</span>
              </a>

              <a
                href="https://www.facebook.com/hidesertmotors"
                target="_blank"
                rel="noreferrer"
                style={footerContactRowStyle}
              >
                <span style={footerIconWrapStyle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={footerIconStyle}>
                    <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.4-1.4H16V5.5c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2v1.8H9v2.8h2.4v7h2.1Z" />
                  </svg>
                </span>
                <span style={footerContactTextStyle}>Facebook</span>
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
            background: "rgba(7,16,24,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: "absolute",
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
            }}
          >
            x
          </button>

          {featuredGallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevFeaturedSlide();
                }}
                style={lightboxArrowLeftStyle}
              >
                ‹
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextFeaturedSlide();
                }}
                style={lightboxArrowRightStyle}
              >
                ›
              </button>
            </>
          )}

          <img
            src={activeFeaturedImage}
            alt={featuredVehicle.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "88vh",
              width: "auto",
              height: "auto",
              borderRadius: "20px",
              objectFit: "contain",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }}
          />
        </div>
      )}
    </main>
  );
}

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(245,197,66,0.14)",
  border: "1px solid rgba(216,138,0,0.24)",
  color: "#9a6400",
  fontWeight: 700,
  fontFamily: montserrat.style.fontFamily,
};

const statCardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "#fffdf8",
  border: "1px solid rgba(216,138,0,0.10)",
  boxShadow: "0 12px 30px rgba(216,138,0,0.06)",
};

const statLabelStyle = {
  color: "#8a5a00",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  marginBottom: "10px",
  fontFamily: montserrat.style.fontFamily,
};

const statValueStyle = {
  fontSize: "34px",
  fontWeight: 900,
  lineHeight: 1,
  marginBottom: "6px",
  fontFamily: montserrat.style.fontFamily,
  color: "#0b1622",
};

const statSubStyle = {
  color: "#7a4d00",
  fontSize: "13px",
};

const meterWrapStyle = {
  padding: "18px",
  borderRadius: "24px",
  border: "1px solid rgba(216,138,0,0.10)",
  background: "#fffdf8",
  boxShadow: "0 12px 30px rgba(216,138,0,0.05)",
};

const meterHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap" as const,
  marginBottom: "14px",
  color: "#1b2c42",
  fontWeight: 700,
};

const iconScaleWrapStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "12px",
  alignItems: "start",
};

const scaleItemStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "8px",
};

const scaleIconFrameStyle = {
  width: "74px",
  height: "74px",
  borderRadius: "20px",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 24px rgba(216,138,0,0.06)",
  transition: "all 0.2s ease",
};

const scaleIconStyle = {
  width: "56px",
  height: "56px",
  objectFit: "contain" as const,
};

const scaleLabelStyle = {
  fontSize: "12px",
  color: "#7a4d00",
  textAlign: "center" as const,
  lineHeight: 1.2,
  fontWeight: 700,
};

const featuredBadgeWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap" as const,
};

const featuredBadgeIconStyle = {
  width: "42px",
  height: "42px",
  objectFit: "contain" as const,
};

const vehicleMoodWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "14px",
  flexWrap: "wrap" as const,
};

const vehicleMoodIconStyle = {
  width: "30px",
  height: "30px",
  objectFit: "contain" as const,
};

const tickerWrapStyle = {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap" as const,
  padding: "16px 20px",
  borderRadius: "20px",
  border: "1px solid rgba(216,138,0,0.10)",
  background: "#fffaf2",
  color: "#7a4d00",
  boxShadow: "0 10px 26px rgba(216,138,0,0.05)",
};

const reviewCardStyle = {
  padding: "22px",
  borderRadius: "24px",
  border: "1px solid rgba(216,138,0,0.10)",
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(216,138,0,0.06)",
};

const primaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "none",
  background: `linear-gradient(135deg, ${BRAND_YELLOW}, ${BRAND_ORANGE})`,
  color: BRAND_DARK,
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
  boxShadow: "0 10px 24px rgba(216,138,0,0.28)",
  fontFamily: montserrat.style.fontFamily,
};

const ghostButtonStyle = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "1px solid rgba(216,138,0,0.18)",
  background: "#fffaf0",
  color: "#5a3900",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
  fontFamily: montserrat.style.fontFamily,
};

const whatsAppIconButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  border: "none",
  background: `linear-gradient(135deg, ${BRAND_YELLOW}, ${BRAND_ORANGE})`,
  boxShadow: "0 10px 24px rgba(216,138,0,0.28)",
  textDecoration: "none",
  cursor: "pointer",
};

const footerContactRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  textDecoration: "none",
  color: "#ffffff",
  padding: "10px 12px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(245,197,66,0.08)",
};

const footerIconWrapStyle = {
  width: "40px",
  height: "40px",
  minWidth: "40px",
  borderRadius: "999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${BRAND_YELLOW}, ${BRAND_ORANGE})`,
  boxShadow: "0 8px 18px rgba(216,138,0,0.22)",
};

const footerIconStyle = {
  width: "18px",
  height: "18px",
  fill: "#071018",
};

const footerContactTextStyle = {
  color: "#ffffff",
  lineHeight: 1.4,
};

const featureArrowLeftStyle = {
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
  boxShadow: "0 8px 18px rgba(216,138,0,0.10)",
};

const featureArrowRightStyle = {
  ...featureArrowLeftStyle,
  left: "auto",
  right: "12px",
};

const viewLargeButtonStyle = {
  position: "absolute" as const,
  right: "12px",
  bottom: "24px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(216,138,0,0.12)",
  background: "rgba(255,250,240,0.96)",
  color: "#7a4d00",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(216,138,0,0.10)",
  fontFamily: montserrat.style.fontFamily,
};

const lightboxArrowLeftStyle = {
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

const lightboxArrowRightStyle = {
  ...lightboxArrowLeftStyle,
  left: "auto",
  right: "18px",
};