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

  const featuredGallery =
    featuredVehicle?.gallery || [featuredVehicle?.image];

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

return ( {
    const nextIndex =
      activeFeaturedIndex === 0
        ? featuredGallery.length - 1
        : activeFeaturedIndex - 1;

    animate
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
                  width: isScrolled
                    ? "120px"
                    : isMobile
                    ? "150px"
                    : "220px",
                  height: isScrolled
                    ? "120px"
                    : isMobile
                    ? "150px"
                    : "220px",
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
                }}
              >
                Opiniones
              </a>

              <a
                href={PRIMARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...whatsAppIconButtonStyle,
                  width: isScrolled ? "42px" : "50px",
                  height: isScrolled ? "42px" : "50px",
                }}
              >
                <svg viewBox="0 0 32 32" style={{ width: 20, fill: "#071018" }}>
                  <path d="M19.11 17.21..." />
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
              <strong style={{ color: "#b97400" }}>
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
                    }}
                  >
                    <img src={item.icon} style={scaleIconStyle} />
                  </div>
                  <div style={scaleLabelStyle}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {featuredVehicle && (
          <div
            style={{
              borderRadius: "30px",
              border: "1px solid rgba(216,138,0,0.10)",
              background: "#ffffff",
              padding: "24px",
              boxShadow: "0 18px 48px rgba(216,138,0,0.06)",
            }}
          >
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              Auto destacado
            </div>

            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {featuredVehicle.name}
            </div>

            <div style={{ position: "relative", marginTop: 14 }}>
              <img
                src={activeFeaturedImage}
                style={{
                  width: "100%",
                  height: 300,
                  objectFit: "cover",
                  borderRadius: 20,
                  opacity: isImageVisible ? 1 : 0.4,
                  transition: "0.25s",
                }}
                onClick={() => setIsLightboxOpen(true)}
              />

              {featuredGallery.length > 1 && (
                <>
                  <button onClick={goToPrevFeaturedSlide}>
                    ‹
                  </button>
                  <button onClick={goToNextFeaturedSlide}>
                    ›
                  </button>
                </>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              {featuredVehicle.priceText}
            </div>

            <Link href={`/car/${featuredVehicle.id}`}>
              Ver detalles
            </Link>
          </div>
        )}
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

                {/* 🔥 SCORE HDM */}
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

                {/* 🔥 DATOS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
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

                {/* 🔥 BOTONES */}
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

              <div style={{ color: "#5b6b7f", fontWeight: 700 }}>
                {review.name}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
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
            }}
          >
            <img
              src="/logo.png"
              alt="HI DESERT MOTORS"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "contain",
              }}
            />

            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "22px",
                  marginBottom: "8px",
                  fontFamily: montserrat.style.fontFamily,
                }}
              >
                HI DESERT MOTORS
              </div>

              <div style={{ color: "#c9d2df", lineHeight: 1.8 }}>
                Vehículos usados seleccionados con una evaluación clara.
                <br />
                Hesperia, California
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "22px",
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
              }}
            >
              Contacto
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <a
                href="mailto:ventas@hidesertmotors.com"
                style={footerContactRowStyle}
              >
                ventas@hidesertmotors.com
              </a>

              <a
                href="https://wa.me/17606411996"
                target="_blank"
                style={footerContactRowStyle}
              >
                {PRIMARY_WHATSAPP}
              </a>

              <a
                href="https://wa.me/17606206390"
                target="_blank"
                style={footerContactRowStyle}
              >
                {SECONDARY_WHATSAPP}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {isLightboxOpen && featuredVehicle && (
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
          }}
        >
          <img
            src={activeFeaturedImage}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "20px",
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
};

const primaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(135deg,#f5c542,#d88a00)",
  color: "#071018",
  fontWeight: 800,
  textDecoration: "none",
};

const ghostButtonStyle = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "1px solid rgba(216,138,0,0.18)",
  background: "#fffaf0",
  color: "#5a3900",
  textDecoration: "none",
};

const footerContactRowStyle = {
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  textDecoration: "none",
};
