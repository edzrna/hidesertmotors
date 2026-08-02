"use client";

import AIChat from "@/components/AIChat";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { vehicles as rawVehicles } from "@/data/vehicles";
import { Montserrat, Inter } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const PRIMARY_WHATSAPP = "+1 760 620 6390";
const SECONDARY_WHATSAPP = "+1 760 641 1996";
const PRIMARY_WHATSAPP_URL = "https://wa.me/17606206390";
const SECONDARY_WHATSAPP_URL = "https://wa.me/17606411996";
const FACEBOOK_URL = "https://facebook.com/hidesertmotors";
const ENGLISH_PAGE_URL = "/en";
const SITE_URL = "https://www.hidesertmotors.com";

/* ============================================================
   CALIFICACIÓN HDM
   Fuera del componente: son funciones puras, no necesitan
   recrearse en cada render.
   ============================================================ */

const MOOD_SCALE = [
  { key: "good_option", label: "Buena opción", icon: "/icons/neutral.png" },
  { key: "good_deal", label: "Buen trato", icon: "/icons/good.png" },
  { key: "great_buy", label: "Muy buena compra", icon: "/icons/great.png" },
  { key: "best_option", label: "Mejor opción", icon: "/icons/best.png" },
];

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
  const total =
    getConditionScore(vehicle.condition) * 0.25 +
    getMilesScore(vehicle.miles) * 0.2 +
    getYearScore(vehicle.year) * 0.15 +
    getHistoryScore({
      titleStatus: vehicle.titleStatus,
      serviceRecords: vehicle.serviceRecords,
      accidents: vehicle.accidents,
      owners: vehicle.owners,
    }) * 0.25 +
    getMarketValueScore(vehicle.priceValue, vehicle.marketPrice) * 0.15;

  return Math.round(clamp(total, 60, 100));
}

function getHDMLevel(score: number) {
  if (score >= 90) return MOOD_SCALE[3];
  if (score >= 80) return MOOD_SCALE[2];
  if (score >= 70) return MOOD_SCALE[1];
  return MOOD_SCALE[0];
}

/* ============================================================
   MEDIDOR HDM — el anillo se llena al entrar en pantalla
   ============================================================ */

function RingGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="hdmRingGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#d88a00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HDMRing({
  score,
  small = false,
  dark = false,
}: {
  score: number;
  small?: boolean;
  dark?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Calificación HDM: ${score} de 100`}
      className={`hdm-ring${small ? " hdm-ring--sm" : ""}${dark ? " hdm-ring--dark" : ""}`}
      style={{ "--score": score } as React.CSSProperties}
    >
      <g className="hdm-ring-rot">
        <circle cx="50" cy="50" r="44" className="hdm-ring-track" />
        <circle cx="50" cy="50" r="44" className="hdm-ring-fill" />
      </g>
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="hdm-ring-value"
      >
        {score}
      </text>
    </svg>
  );
}

/* ============================================================
   PÁGINA
   ============================================================ */

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const touchStartX = useRef<number | null>(null);

  const vehicles = rawVehicles.map((vehicle: any) => {
    const score = getHDMScore(vehicle);
    const level = getHDMLevel(score);

    return {
      ...vehicle,
      sold: Boolean(vehicle.sold),
      score,
      levelKey: level.key,
      level: level.label,
      icon: level.icon,
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
        vehicles.reduce((sum, v) => sum + v.score, 0) / vehicles.length
      )
    : 60;

  const inventoryLevel = getHDMLevel(inventoryScore);
  const featuredVehicle = vehicles[0];
  const bestVehicle = [...vehicles].sort((a, b) => b.score - a.score)[0];

  const featuredGallery: string[] = featuredVehicle?.gallery?.length
    ? featuredVehicle.gallery
    : featuredVehicle
    ? [featuredVehicle.image]
    : [];

  const activeFeaturedImage =
    featuredGallery[activeFeaturedIndex] || featuredVehicle?.image;

  /* --- Sombra del header al hacer scroll --- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- Aparición de secciones --- */
  useEffect(() => {
    const targets = document.querySelectorAll(".hdm-reveal");
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [vehicles.length]);

  /* --- Lightbox: Escape y bloqueo de scroll --- */
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    setActiveFeaturedIndex(0);
  }, [featuredVehicle?.id]);

  function animateToSlide(nextIndex: number) {
    setIsFading(true);
    window.setTimeout(() => {
      setActiveFeaturedIndex(nextIndex);
      setIsFading(false);
    }, 140);
  }

  function goToFeaturedSlide(index: number) {
    if (index !== activeFeaturedIndex) animateToSlide(index);
  }

  function goToPrevFeaturedSlide() {
    animateToSlide(
      activeFeaturedIndex === 0
        ? featuredGallery.length - 1
        : activeFeaturedIndex - 1
    );
  }

  function goToNextFeaturedSlide() {
    animateToSlide(
      activeFeaturedIndex === featuredGallery.length - 1
        ? 0
        : activeFeaturedIndex + 1
    );
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.changedTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) goToNextFeaturedSlide();
    else if (delta < -40) goToPrevFeaturedSlide();

    touchStartX.current = null;
  }

  function getVehicleUrl(vehicle: any) {
    if (typeof window === "undefined") return `${SITE_URL}/car/${vehicle.id}`;
    return `${window.location.origin}/car/${vehicle.id}`;
  }

  async function handleCopyVehicleLink(vehicle: any) {
    try {
      await navigator.clipboard.writeText(getVehicleUrl(vehicle));
      setShareMessage(`Link copiado: ${vehicle.name}`);
    } catch {
      setShareMessage("No se pudo copiar el link");
    }
    window.setTimeout(() => setShareMessage(""), 2200);
  }

  return (
    <main className={`${montserrat.variable} ${inter.variable}`}>
      <RingGradientDefs />

      {/* ============ HEADER ============ */}
      <header className={`hdm-header${isScrolled ? " is-scrolled" : ""}`}>
        <div className="hdm-shell hdm-header-inner">
          <div className="hdm-brand">
            <img src="/logo.png" alt="HI DESERT MOTORS" className="hdm-logo" />
            <span className="hdm-tagline">Compra con confianza.</span>
          </div>

          <nav className="hdm-nav">
            <span className="hdm-lang hdm-lang--active" aria-current="page">
              ES
            </span>

            <Link href={ENGLISH_PAGE_URL} className="hdm-lang">
              EN
            </Link>

            <a href="#inventario" className="hdm-btn hdm-btn--primary">
              Ver inventario
            </a>

            <a href="#opiniones" className="hdm-btn hdm-btn--ghost">
              Opiniones
            </a>

            <a
              href={PRIMARY_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Escribir por WhatsApp"
              className="hdm-wa"
            >
              <WhatsAppGlyph />
            </a>
          </nav>
        </div>
      </header>

      {/* ============ HERO + DESTACADO ============ */}
      <div className="hdm-shell hdm-top">
        <section className="hdm-hero">
          <span className="hdm-pill">Calificación HDM</span>

          <h1 className="hdm-h1">
            Encuentra el auto correcto.
            <br />
            <span className="hdm-accent">Sin adivinar.</span>
          </h1>

          <p className="hdm-hero-lead">
            Cada vehículo recibe una calificación del 60 al 100 según su
            condición, millas, año, historial y precio contra el mercado.
          </p>

          <div className="hdm-meter">
            <div className="hdm-meter-top">
              <HDMRing score={inventoryScore} dark />

              <div>
                <div className="hdm-meter-label">Nivel del inventario</div>
                <div className="hdm-meter-level">{inventoryLevel.label}</div>
              </div>
            </div>

            <div className="hdm-scale">
              {MOOD_SCALE.map((item) => (
                <div
                  key={item.key}
                  className={`hdm-scale-item${
                    item.key === inventoryLevel.key ? " is-current" : ""
                  }`}
                >
                  <div className="hdm-scale-frame">
                    <img src={item.icon} alt="" />
                  </div>
                  <span className="hdm-scale-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {bestVehicle && (
            <p className="hdm-note">
              Mejor evaluado del inventario: <strong>{bestVehicle.name}</strong>{" "}
              con <strong>{bestVehicle.score}</strong> puntos.
            </p>
          )}
        </section>

        {featuredVehicle && (
          <section className="hdm-panel">
            <div className="hdm-eyebrow">Auto destacado</div>
            <h2 className="hdm-featured-title">{featuredVehicle.name}</h2>

            <div
              className={`hdm-stage${isFading ? " is-fading" : ""}${
                featuredVehicle.sold ? " is-sold" : ""
              }`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={activeFeaturedImage}
                alt={featuredVehicle.name}
                onClick={() => {
                  if (!featuredVehicle.sold) setIsLightboxOpen(true);
                }}
              />

              {featuredVehicle.sold && (
                <span className="hdm-badge-sold">VENDIDO</span>
              )}

              {featuredGallery.length > 1 && !featuredVehicle.sold && (
                <>
                  <button
                    onClick={goToPrevFeaturedSlide}
                    aria-label="Imagen anterior"
                    className="hdm-arrow hdm-arrow--prev"
                  >
                    ‹
                  </button>
                  <button
                    onClick={goToNextFeaturedSlide}
                    aria-label="Imagen siguiente"
                    className="hdm-arrow hdm-arrow--next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {featuredGallery.length > 1 && !featuredVehicle.sold && (
              <div className="hdm-thumbs">
                {featuredGallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => goToFeaturedSlide(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                    className={`hdm-thumb${
                      index === activeFeaturedIndex ? " is-active" : ""
                    }`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="hdm-price">{featuredVehicle.priceText}</div>

            {featuredVehicle.sold && (
              <div className="hdm-sold-text">ESTE VEHÍCULO YA FUE VENDIDO</div>
            )}

            <div className="hdm-actions">
              <Link
                href={featuredVehicle.sold ? "#" : `/car/${featuredVehicle.id}`}
                aria-disabled={featuredVehicle.sold || undefined}
                className="hdm-btn hdm-btn--primary"
              >
                {featuredVehicle.sold ? "No disponible" : "Ver detalles"}
              </Link>

              <a
                href={
                  featuredVehicle.sold
                    ? "#"
                    : `${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                        `Hola, me interesa el ${featuredVehicle.name}`
                      )}`
                }
                target="_blank"
                rel="noreferrer"
                aria-disabled={featuredVehicle.sold || undefined}
                className="hdm-btn hdm-btn--ghost"
              >
                {featuredVehicle.sold ? "Vendido" : "Pedir información"}
              </a>
            </div>

            {!featuredVehicle.sold && (
              <>
                <div className="hdm-share-title">Compartir vehículo</div>

                <div className="hdm-share-grid">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${featuredVehicle.name} - ${
                        featuredVehicle.priceText
                      } ${getVehicleUrl(featuredVehicle)}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hdm-share-btn"
                  >
                    <WhatsAppGlyph />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      getVehicleUrl(featuredVehicle)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hdm-share-btn"
                  >
                    <FacebookGlyph />
                    <span>Facebook</span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `${featuredVehicle.name} - ${featuredVehicle.priceText}`
                    )}&url=${encodeURIComponent(
                      getVehicleUrl(featuredVehicle)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hdm-share-btn"
                  >
                    <XGlyph />
                    <span>X</span>
                  </a>

                  <button
                    onClick={() => handleCopyVehicleLink(featuredVehicle)}
                    className="hdm-share-btn"
                  >
                    <LinkGlyph />
                    <span>Copiar link</span>
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* ============ INVENTARIO ============ */}
      <section id="inventario" className="hdm-shell" style={{ paddingBlock: "18px 24px" }}>
        <div className="hdm-section-head hdm-reveal">
          <div className="hdm-kicker">Inventario</div>
          <h2 className="hdm-h2">Vehículos calificados automáticamente</h2>
        </div>

        <div className="hdm-grid">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              className={`hdm-card hdm-reveal${
                vehicle.sold ? " hdm-card--sold" : ""
              }`}
            >
              <div className="hdm-card-media">
                <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
                {vehicle.tag && <span className="hdm-tag">{vehicle.tag}</span>}
                {vehicle.sold && <span className="hdm-badge-sold">VENDIDO</span>}
              </div>

              <div className="hdm-card-body">
                <div className="hdm-card-head">
                  <h3 className="hdm-card-title">{vehicle.name}</h3>
                  <span className="hdm-card-price">{vehicle.priceText}</span>
                </div>

                {vehicle.sold && (
                  <div className="hdm-sold-text">
                    ESTE VEHÍCULO YA FUE VENDIDO
                  </div>
                )}

                <div className="hdm-score-row">
                  <HDMRing score={vehicle.score} small />
                  <div>
                    <div className="hdm-score-level">{vehicle.level}</div>
                    <div className="hdm-score-caption">
                      Calificación HDM sobre 100
                    </div>
                  </div>
                </div>

                <p className="hdm-card-text">{vehicle.details}</p>

                <dl className="hdm-specs">
                  <div>
                    <dt>Año: </dt>
                    <dd>{vehicle.year}</dd>
                  </div>
                  <div>
                    <dt>Millas: </dt>
                    <dd>{vehicle.miles.toLocaleString("es-MX")}</dd>
                  </div>
                  <div>
                    <dt>Título: </dt>
                    <dd>{vehicle.titleStatus}</dd>
                  </div>
                  <div>
                    <dt>Dueños: </dt>
                    <dd>{vehicle.owners}</dd>
                  </div>
                </dl>

                <div className="hdm-actions">
                  <Link
                    href={vehicle.sold ? "#" : `/car/${vehicle.id}`}
                    aria-disabled={vehicle.sold || undefined}
                    className="hdm-btn hdm-btn--primary"
                  >
                    {vehicle.sold ? "No disponible" : "Ver detalles"}
                  </Link>

                  <a
                    href={
                      vehicle.sold
                        ? "#"
                        : `${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                            `Hola, me interesa el ${vehicle.name}`
                          )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={vehicle.sold || undefined}
                    className="hdm-btn hdm-btn--ghost"
                  >
                    {vehicle.sold ? "Vendido" : "Pedir información"}
                  </a>
                </div>

                {!vehicle.sold && (
                  <div className="hdm-share-mini">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${vehicle.name} - ${vehicle.priceText} ${getVehicleUrl(
                          vehicle
                        )}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Compartir por WhatsApp"
                      className="hdm-share-btn"
                    >
                      <WhatsAppGlyph />
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        getVehicleUrl(vehicle)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Compartir en Facebook"
                      className="hdm-share-btn"
                    >
                      <FacebookGlyph />
                    </a>

                    <button
                      onClick={() => handleCopyVehicleLink(vehicle)}
                      aria-label="Copiar link del vehículo"
                      className="hdm-share-btn"
                    >
                      <LinkGlyph />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============ OPINIONES ============ */}
      <section id="opiniones" className="hdm-shell" style={{ paddingBlock: "8px 60px" }}>
        <div className="hdm-section-head hdm-reveal">
          <div className="hdm-kicker">Opiniones</div>
          <h2 className="hdm-h2">Lo que dicen nuestros clientes</h2>
        </div>

        <div className="hdm-grid">
          {reviews.map((review, index) => (
            <figure key={index} className="hdm-review hdm-reveal">
              <span className="hdm-pill">{review.mood}</span>
              <blockquote>{review.text}</blockquote>
              <figcaption>{review.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {shareMessage && (
        <div className="hdm-toast" role="status">
          {shareMessage}
        </div>
      )}

      {/* ============ PIE ============ */}
      <footer className="hdm-footer">
        <div className="hdm-shell hdm-footer-grid">
          <div className="hdm-footer-brand">
            <img
              src="/logo.png"
              alt=""
              className="hdm-logo"
              style={{ width: "clamp(96px, 20vw, 120px)" }}
            />

            <div>
              <div className="hdm-footer-name">HI DESERT MOTORS</div>
              <p className="hdm-footer-text">
                Vehículos usados seleccionados con una evaluación clara.
                <br />
                Hesperia, California
              </p>
            </div>
          </div>

          <div className="hdm-contact-card">
            <div className="hdm-eyebrow">Redes de contacto</div>

            <div className="hdm-social">
              <a href="mailto:ventas@hidesertmotors.com" aria-label="Enviar correo">
                <MailGlyph />
              </a>

              <a
                href={PRIMARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`WhatsApp ${PRIMARY_WHATSAPP}`}
              >
                <WhatsAppGlyph />
              </a>

              <a
                href={SECONDARY_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`WhatsApp ${SECONDARY_WHATSAPP}`}
              >
                <WhatsAppGlyph />
              </a>

              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookGlyph />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ LIGHTBOX ============ */}
      {isLightboxOpen && featuredVehicle && !featuredVehicle.sold && (
        <div
          className="hdm-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={featuredVehicle.name}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar"
            className="hdm-lightbox-close"
          >
            ×
          </button>

          <img
            src={activeFeaturedImage}
            alt={featuredVehicle.name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <AIChat />
    </main>
  );
}

/* ============================================================
   ICONOS
   El tamaño y el color los define el CSS del contenedor.
   ============================================================ */

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden>
      <path d="M16.04 3C8.85 3 3 8.73 3 15.79c0 2.48.73 4.88 2.11 6.95L3 29l6.49-2.02a13.2 13.2 0 0 0 6.55 1.77h.01c7.19 0 13.04-5.73 13.04-12.79C29.09 8.73 23.24 3 16.04 3Zm0 23.45h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-3.85 1.2 1.26-3.72-.26-.38a10.43 10.43 0 0 1-1.66-5.63c0-5.8 4.72-10.52 10.52-10.52 2.8 0 5.43 1.08 7.41 3.04a10.36 10.36 0 0 1 3.09 7.45c0 5.8-4.72 10.52-10.54 10.52Zm5.77-7.87c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.69.08-.32-.16-1.33-.48-2.54-1.54-.94-.82-1.57-1.84-1.76-2.15-.18-.31-.02-.48.14-.63.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.68-.97-2.3-.25-.6-.51-.52-.71-.53l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.5 5.38 4.77.75.31 1.33.49 1.79.63.75.24 1.43.21 1.97.13.6-.09 1.88-.77 2.14-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.7v8h2.8Z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.26l-4.9-6.41L6.23 22H3.1l7.24-8.27L1 2h6.42l4.43 5.85L18.9 2Zm-1.1 18h1.73L6.47 3.9H4.61L17.8 20Z" />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M10.59 13.41a1 1 0 0 0 1.41 1.41l3.59-3.59a3 3 0 0 0-4.24-4.24l-1.88 1.88a1 1 0 1 0 1.41 1.41l1.88-1.88a1 1 0 1 1 1.41 1.41l-3.58 3.6Zm2.82-2.82a1 1 0 0 0-1.41-1.41l-3.59 3.59a3 3 0 1 0 4.24 4.24l1.88-1.88a1 1 0 1 0-1.41-1.41l-1.88 1.88a1 1 0 1 1-1.41-1.41l3.58-3.6Z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.01L12 13l8-5.99V7H4Zm16 10V9.49l-7.4 5.55a1 1 0 0 1-1.2 0L4 9.49V17h16Z" />
    </svg>
  );
}
