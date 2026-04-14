// Pega TODO este archivo directamente en app/page.tsx

"use client";

import { useState, useEffect } from "react"; import Link from "next/link"; import { vehicles as rawVehicles } from "@/data/vehicles"; import { Montserrat, Inter } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "800", "900"], });

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], });

const BRAND_YELLOW = "#f5c542"; const BRAND_ORANGE = "#d88a00"; const BRAND_DARK = "#071018";

const PRIMARY_WHATSAPP_URL = "https://wa.me/17606411996";

export default function Home() { const [isScrolled, setIsScrolled] = useState(false); const [isMobile, setIsMobile] = useState(false); const [isTablet, setIsTablet] = useState(false); const [isLightboxOpen, setIsLightboxOpen] = useState(false); const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);

useEffect(() => { const handleResize = () => { setIsMobile(window.innerWidth < 760); setIsTablet(window.innerWidth < 980); };

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

const vehicles = rawVehicles; const featuredVehicle = vehicles[0]; const featuredGallery = featuredVehicle?.gallery || [featuredVehicle?.image]; const activeImage = featuredGallery[activeFeaturedIndex];

return ( <main style={{ background: "#f4f7fb", fontFamily: inter.style.fontFamily }}>

{/* HEADER */}
  <header style={{ background: BRAND_DARK, padding: "10px 0" }}>
    <div
      style={{
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "12px",
        display: "flex",
        flexDirection: isTablet ? "column" : "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <img
        src="/logo.png"
        style={{ width: isMobile ? "110px" : "180px" }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <a href="#inventario" style={primaryButtonStyle}>Ver inventario</a>
        <a href="#opiniones" style={ghostButtonStyle}>Opiniones</a>
      </div>
    </div>
  </header>

  {/* HERO */}
  <section
    style={{
      maxWidth: "1240px",
      margin: "0 auto",
      padding: "20px",
      display: "grid",
      gridTemplateColumns: isTablet ? "1fr" : "1.2fr 0.8fr",
      gap: "20px",
    }}
  >
    <div style={cardStyle}>
      <h1 style={{ fontSize: isMobile ? "26px" : "40px", fontWeight: 900 }}>
        Encuentra el auto correcto.
      </h1>
    </div>

    {featuredVehicle && (
      <div style={cardStyle}>
        <img
          src={activeImage}
          onClick={() => setIsLightboxOpen(true)}
          style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "20px" }}
        />
      </div>
    )}
  </section>

  {/* INVENTARIO */}
  <section id="inventario" style={{ maxWidth: "1240px", margin: "0 auto", padding: "20px" }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "18px",
      }}
    >
      {vehicles.map((v) => (
        <div key={v.id} style={cardStyle}>
          <img src={v.image} style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "16px" }} />
          <h3>{v.name}</h3>
          <strong>{v.priceText}</strong>

          <Link href={`/car/${v.id}`} style={primaryButtonStyle}>Ver detalles</Link>
        </div>
      ))}
    </div>
  </section>

  {/* FOOTER */}
  <footer style={{ background: BRAND_DARK, color: "#fff", padding: "40px", textAlign: "center" }}>
    HI DESERT MOTORS
  </footer>

  {/* LIGHTBOX */}
  {isLightboxOpen && (
    <div
      onClick={() => setIsLightboxOpen(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <img src={activeImage} style={{ maxWidth: "90%", maxHeight: "80%" }} />
    </div>
  )}
</main>

); }

const cardStyle = { background: "#fff", padding: "20px", borderRadius: "24px", };

const primaryButtonStyle = { padding: "12px 18px", borderRadius: "999px", background: linear-gradient(135deg, ${BRAND_YELLOW}, ${BRAND_ORANGE}), color: BRAND_DARK, textDecoration: "none", display: "inline-block", };

const ghostButtonStyle = { padding: "12px 18px", borderRadius: "999px", border: "1px solid #d88a00",