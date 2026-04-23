"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { vehicles as rawVehicles } from "@/data/vehicles";
import { Montserrat, Inter } from "next/font/google";
import AIChat from "@/components/AIChat";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const PRIMARY_WHATSAPP = "+1 760 620 6390";
const SECONDARY_WHATSAPP = "+1 760 641 1996";
const PRIMARY_WHATSAPP_URL = "https://wa.me/17606206390";
const SECONDARY_WHATSAPP_URL = "https://wa.me/17606411996";
const SPANISH_PAGE_URL = "/";

export default function EnglishHomePage() {
  const moodScale = [
    {
      key: "good_option",
      label: "Good option",
      icon: "/icons/neutral.png",
      color: "#f0a43a",
      text: "#2f1b00",
    },
    {
      key: "good_deal",
      label: "Good deal",
      icon: "/icons/good.png",
      color: "#f5b93f",
      text: "#2f1b00",
    },
    {
      key: "great_buy",
      label: "Great buy",
      icon: "/icons/great.png",
      color: "#f7c84a",
      text: "#2f1b00",
    },
    {
      key: "best_option",
      label: "Best option",
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

  const vehicles = rawVehicles.map((vehicle: any) => {
    const score = getHDMScore(vehicle);
    const level = getHDMLevel(score);

    return {
      ...vehicle,
      sold: Boolean(vehicle.sold),
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
      mood: "Great buy",
      text: "Everything was clear, fast, and the truck looked exactly like the photos.",
    },
    {
      name: "Ashley M.",
      mood: "Good deal",
      text: "The rating helped me understand the car’s value from the start.",
    },
    {
      name: "Marco C.",
      mood: "Best option",
      text: "One of the best car-buying experiences I’ve had. No pressure and everything clear.",
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
                    Buy with confidence.
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
              <Link
                href={SPANISH_PAGE_URL}
                style={{
                  padding: "10px 12px",
                  borderRadius: "999px",
                  border: "1px solid rgba(216,138,0,0.18)",
                  background: "#fffaf0",
                  color: "#5a3900",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontFamily: montserrat.style.fontFamily,
                  fontSize: "13px",
                }}
              >
                ES
              </Link>

              <span
                style={{
                  padding: "10px 12px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg,#f5c542,#d88a00)",
                  color: "#071018",
                  fontWeight: 800,
                  fontFamily: montserrat.style.fontFamily,
                  fontSize: "13px",
                }}
              >
                EN
              </span>

              <a href="#inventario" style={primaryButtonStyle}>
                View inventory
              </a>

              <a href="#opiniones" style={ghostButtonStyle}>
                Reviews
              </a>

              <a
                href={PRIMARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                style={whatsAppIconButtonStyle}
              >
                <svg viewBox="0 0 32 32" style={{ width: 20, height: 20, fill: "#071018" }}>
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
          }}
        >
          <div style={pillStyle}>HDM Rating</div>

          <h1
            style={{
              fontSize: isMobile ? "28px" : isTablet ? "34px" : "clamp(26px, 6vw, 40px)",
              lineHeight: 0.98,
              margin: "0 0 14px 0",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            Find the right car.
            <br />
            No guessing.
          </h1>

          <p
            style={{
              color: "#5b6b7f",
              fontSize: isMobile ? "15px" : "18px",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            Used vehicles with a clear rating based on condition, price, mileage and buyer confidence.
          </p>

          <div style={meterWrapStyle}>
            <div style={meterHeaderStyle}>
              <span>Overall inventory level</span>
              <strong style={{ color: "#b97400" }}>
                {inventoryLevel.label} - {inventoryScore}
              </strong>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              {moodScale.map((item) => (
                <div key={item.key} style={scaleGridItemStyle}>
                  <div
                    style={{
                      ...scaleIconFrameStyle,
                      border:
                        item.key === inventoryLevel.key
                          ? "2px solid #0b1622"
                          : "1px solid rgba(216,138,0,0.10)",
                    }}
                  >
                    <img src={item.icon} alt={item.label} style={scaleIconStyle} />
                  </div>
                  <div style={scaleLabelStyle}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {bestVehicle && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "18px",
                background: "#fff8ea",
                border: "1px solid rgba(216,138,0,0.10)",
                color: "#7a4d00",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Best rated in inventory: <strong>{bestVehicle.name}</strong> with{" "}
              <strong>{bestVehicle.score}</strong> points.
            </div>
          )}
        </div>

        {featuredVehicle && (
          <div
            style={{
              borderRadius: isMobile ? "22px" : "30px",
              border: "1px solid rgba(216,138,0,0.10)",
              background: "#ffffff",
              padding: isMobile ? "16px" : "24px",
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
              Featured vehicle
            </div>

            <div
              style={{
                fontSize: isMobile ? 19 : 24,
                fontWeight: 800,
                lineHeight: 1.08,
                fontFamily: montserrat.style.fontFamily,
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
                  height: isMobile ? 220 : 320,
                  objectFit: "cover",
                  borderRadius: 20,
                  opacity: isImageVisible ? 1 : 0.4,
                  transition: "0.25s",
                  display: "block",
                  cursor: featuredVehicle.sold ? "default" : "zoom-in",
                  filter: featuredVehicle.sold ? "grayscale(100%) brightness(0.7)" : "none",
                }}
                onClick={() => {
                  if (!featuredVehicle.sold) setIsLightboxOpen(true);
                }}
              />

              {featuredVehicle.sold && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#ff3b4d",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    fontWeight: 900,
                    fontSize: "12px",
                    fontFamily: montserrat.style.fontFamily,
                  }}
                >
                  SOLD
                </div>
              )}
            </div>

            {!featuredVehicle.sold && featuredGallery.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {featuredGallery.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToFeaturedSlide(index)}
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
                      alt={`${featuredVehicle.name} ${index + 1}`}
                      style={{
                        width: "76px",
                        height: "76px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border:
                          index === activeFeaturedIndex
                            ? "2px solid #7a4d00"
                            : "1px solid rgba(216,138,0,0.12)",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 14,
                fontSize: 28,
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
                href={featuredVehicle.sold ? "#" : `/car/${featuredVehicle.id}`}
                style={{
                  ...primaryButtonStyle,
                  opacity: featuredVehicle.sold ? 0.5 : 1,
                  pointerEvents: featuredVehicle.sold ? "none" : "auto",
                }}
              >
                {featuredVehicle.sold ? "Unavailable" : "View details"}
              </Link>

              <a
                href={
                  featuredVehicle.sold
                    ? "#"
                    : `${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                        `Hi, I'm interested in the ${featuredVehicle.name}`
                      )}`
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  ...ghostButtonStyle,
                  opacity: featuredVehicle.sold ? 0.5 : 1,
                  pointerEvents: featuredVehicle.sold ? "none" : "auto",
                }}
              >
                {featuredVehicle.sold ? "Sold" : "Request info"}
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
            Inventory
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
            Vehicles rated automatically
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
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
                    display: "block",
                    filter: vehicle.sold ? "grayscale(100%) brightness(0.7)" : "none",
                  }}
                />

                {vehicle.sold && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "#ff3b4d",
                      color: "#fff",
                      padding: "8px 14px",
                      borderRadius: "999px",
                      fontWeight: 900,
                      fontSize: "12px",
                      fontFamily: montserrat.style.fontFamily,
                    }}
                  >
                    SOLD
                  </div>
                )}

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
                    flexDirection: isMobile ? "column" : "row",
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
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px",
                    marginTop: "14px",
                    fontSize: "13px",
                    color: "#7a4d00",
                  }}
                >
                  <div>Year: {vehicle.year}</div>
                  <div>Miles: {vehicle.miles.toLocaleString()}</div>
                  <div>Title: {vehicle.titleStatus}</div>
                  <div>Owners: {vehicle.owners}</div>
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
                    href={vehicle.sold ? "#" : `/car/${vehicle.id}`}
                    style={{
                      ...primaryButtonStyle,
                      opacity: vehicle.sold ? 0.5 : 1,
                      pointerEvents: vehicle.sold ? "none" : "auto",
                    }}
                  >
                    {vehicle.sold ? "Unavailable" : "View details"}
                  </Link>

                  <a
                    href={
                      vehicle.sold
                        ? "#"
                        : `${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                            `Hi, I'm interested in the ${vehicle.name}`
                          )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...ghostButtonStyle,
                      opacity: vehicle.sold ? 0.5 : 1,
                      pointerEvents: vehicle.sold ? "none" : "auto",
                    }}
                  >
                    {vehicle.sold ? "Sold" : "Request info"}
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
            Reviews
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
            What our customers say
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))",
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
                Carefully selected used vehicles with a clear evaluation.
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
              }}
            >
              Contact
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <a
                href="mailto:ventas@hidesertmotors.com"
                style={footerContactRowStyle}
              >
                ventas@hidesertmotors.com
              </a>

              <a
                href={PRIMARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                style={footerContactRowStyle}
              >
                {PRIMARY_WHATSAPP}
              </a>

              <a
                href={SECONDARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                style={footerContactRowStyle}
              >
                {SECONDARY_WHATSAPP}
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AIChat />
    </main>
  );
}

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
  padding: "18px",
  borderRadius: "22px",
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
  width: "64px",
  height: "64px",
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
  width: "50px",
  height: "50px",
};

const footerContactRowStyle = {
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  textDecoration: "none",
};