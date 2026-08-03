"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AIChat from "@/components/AIChat";
import HDMRing, { RingGradientDefs } from "@/components/HDMRing";
import Gallery from "@/components/Gallery";
import ShareButtons from "@/components/ShareButtons";
import { WhatsAppGlyph, FacebookGlyph, MailGlyph } from "@/components/Icons";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  MOOD_SCALE,
  averageScore,
  formatMiles,
  getHDMLevel,
  localePath,
  pick,
  type Locale,
  type ScoredVehicle,
} from "@/lib/hdm";
import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  PRIMARY_WHATSAPP,
  PRIMARY_WHATSAPP_URL,
  SECONDARY_WHATSAPP,
  SECONDARY_WHATSAPP_URL,
  SITE_URL,
} from "@/lib/site";

export default function HomeView({
  locale,
  dict,
  vehicles,
}: {
  locale: Locale;
  dict: Dictionary;
  vehicles: ScoredVehicle[];
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [toast, setToast] = useState("");

  const inventoryScore = averageScore(vehicles);
  const inventoryLevel = getHDMLevel(inventoryScore);
  const featured = vehicles[0];
  const best = [...vehicles].sort((a, b) => b.score - a.score)[0];

  const otherLocale: Locale = locale === "es" ? "en" : "es";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Aparición progresiva de las secciones */
  useEffect(() => {
    const targets = document.querySelectorAll(".hdm-reveal");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [vehicles.length]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function vehicleUrl(id: string) {
    const path = localePath(locale, `/car/${id}`);
    if (typeof window === "undefined") return `${SITE_URL}${path}`;
    return `${window.location.origin}${path}`;
  }

  function ringLabel(score: number) {
    return `${dict.hero.pill}: ${score}/100`;
  }

  return (
    <main>
      <RingGradientDefs />

      {/* ============ HEADER ============ */}
      <header className={`hdm-header${isScrolled ? " is-scrolled" : ""}`}>
        <div className="hdm-shell hdm-header-inner">
          <div className="hdm-brand">
            <img src="/logo.png" alt="HI DESERT MOTORS" className="hdm-logo" />
            <span className="hdm-tagline">{dict.nav.tagline}</span>
          </div>

          <nav className="hdm-nav">
            <span className="hdm-lang hdm-lang--active" aria-current="page">
              {locale.toUpperCase()}
            </span>

            <Link
              href={localePath(otherLocale, "/")}
              className="hdm-lang"
              hrefLang={otherLocale}
            >
              {otherLocale.toUpperCase()}
            </Link>

            <a href="#inventario" className="hdm-btn hdm-btn--primary">
              {dict.nav.inventory}
            </a>

            <a href="#opiniones" className="hdm-btn hdm-btn--ghost">
              {dict.nav.reviews}
            </a>

            <a
              href={PRIMARY_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={dict.nav.whatsapp}
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
          <span className="hdm-pill">{dict.hero.pill}</span>

          <h1 className="hdm-h1">
            {dict.hero.titleTop}
            <br />
            <span className="hdm-accent">{dict.hero.titleAccent}</span>
          </h1>

          <p className="hdm-hero-lead">{dict.hero.lead}</p>

          <div className="hdm-meter">
            <div className="hdm-meter-top">
              <HDMRing score={inventoryScore} label={ringLabel(inventoryScore)} dark />

              <div>
                <div className="hdm-meter-label">{dict.hero.meterLabel}</div>
                <div className="hdm-meter-level">{dict.levels[inventoryLevel]}</div>
              </div>
            </div>

            <div className="hdm-scale">
              {MOOD_SCALE.map((item) => (
                <div
                  key={item.key}
                  className={`hdm-scale-item${
                    item.key === inventoryLevel ? " is-current" : ""
                  }`}
                >
                  <div className="hdm-scale-frame">
                    <img src={item.icon} alt="" />
                  </div>
                  <span className="hdm-scale-label">{dict.levels[item.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {best && (
            <p className="hdm-note">
              {dict.hero.best}: <strong>{best.name}</strong> — {best.score}{" "}
              {dict.hero.points}.
            </p>
          )}
        </section>

        {featured && (
          <section className="hdm-panel">
            <div className="hdm-eyebrow">{dict.vehicle.featured}</div>
            <h2 className="hdm-featured-title">{featured.name}</h2>

            <Gallery
              images={featured.gallery?.length ? featured.gallery : [featured.image]}
              alt={featured.name}
              dict={dict}
              sold={featured.sold}
            />

            <div className="hdm-price">{featured.priceText}</div>

            {featured.sold && (
              <div className="hdm-sold-text">{dict.vehicle.soldNotice}</div>
            )}

            <div className="hdm-actions">
              <Link
                href={featured.sold ? "#" : localePath(locale, `/car/${featured.id}`)}
                aria-disabled={featured.sold || undefined}
                className="hdm-btn hdm-btn--primary"
              >
                {featured.sold ? dict.vehicle.unavailable : dict.vehicle.details}
              </Link>

              <a
                href={
                  featured.sold
                    ? "#"
                    : `${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                        dict.vehicle.whatsappMessage(featured.name)
                      )}`
                }
                target="_blank"
                rel="noreferrer"
                aria-disabled={featured.sold || undefined}
                className="hdm-btn hdm-btn--ghost"
              >
                {featured.sold ? dict.vehicle.sold : dict.vehicle.ask}
              </a>
            </div>

            {!featured.sold && (
              <ShareButtons
                url={vehicleUrl(featured.id)}
                text={`${featured.name} - ${featured.priceText}`}
                dict={dict}
                onNotify={showToast}
              />
            )}
          </section>
        )}
      </div>

      {/* ============ INVENTARIO ============ */}
      <section id="inventario" className="hdm-shell hdm-section">
        <div className="hdm-section-head hdm-reveal">
          <div className="hdm-kicker">{dict.inventory.kicker}</div>
          <h2 className="hdm-h2">{dict.inventory.title}</h2>
        </div>

        <div className="hdm-grid">
          {vehicles.map((vehicle) => {
            const tag = vehicle.tag ? pick(vehicle.tag, locale) : "";

            return (
              <article
                key={vehicle.id}
                className={`hdm-card hdm-reveal${
                  vehicle.sold ? " hdm-card--sold" : ""
                }`}
              >
                <div className="hdm-card-media">
                  <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
                  {tag && <span className="hdm-tag">{tag}</span>}
                  {vehicle.sold && (
                    <span className="hdm-badge-sold">{dict.vehicle.soldBadge}</span>
                  )}
                </div>

                <div className="hdm-card-body">
                  <div className="hdm-card-head">
                    <h3 className="hdm-card-title">{vehicle.name}</h3>
                    <span className="hdm-card-price">{vehicle.priceText}</span>
                  </div>

                  {vehicle.sold && (
                    <div className="hdm-sold-text">{dict.vehicle.soldNotice}</div>
                  )}

                  <div className="hdm-score-row">
                    <HDMRing
                      score={vehicle.score}
                      label={ringLabel(vehicle.score)}
                      small
                    />
                    <div>
                      <div className="hdm-score-level">
                        {dict.levels[vehicle.levelKey]}
                      </div>
                      <div className="hdm-score-caption">
                        {dict.vehicle.scoreCaption}
                      </div>
                    </div>
                  </div>

                  <p className="hdm-card-text">{pick(vehicle.details, locale)}</p>

                  <dl className="hdm-specs">
                    <div>
                      <dt>{dict.specs.year}: </dt>
                      <dd>{vehicle.year}</dd>
                    </div>
                    <div>
                      <dt>{dict.specs.miles}: </dt>
                      <dd>{formatMiles(vehicle.miles, locale)}</dd>
                    </div>
                    <div>
                      <dt>{dict.specs.title}: </dt>
                      <dd>{dict.titles[vehicle.titleStatus]}</dd>
                    </div>
                    <div>
                      <dt>{dict.specs.owners}: </dt>
                      <dd>{vehicle.owners}</dd>
                    </div>
                  </dl>

                  <div className="hdm-actions">
                    <Link
                      href={vehicle.sold ? "#" : localePath(locale, `/car/${vehicle.id}`)}
                      aria-disabled={vehicle.sold || undefined}
                      className="hdm-btn hdm-btn--primary"
                    >
                      {vehicle.sold ? dict.vehicle.unavailable : dict.vehicle.details}
                    </Link>

                    <a
                      href={
                        vehicle.sold
                          ? "#"
                          : `${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                              dict.vehicle.whatsappMessage(vehicle.name)
                            )}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={vehicle.sold || undefined}
                      className="hdm-btn hdm-btn--ghost"
                    >
                      {vehicle.sold ? dict.vehicle.sold : dict.vehicle.ask}
                    </a>
                  </div>

                  {!vehicle.sold && (
                    <ShareButtons
                      url={vehicleUrl(vehicle.id)}
                      text={`${vehicle.name} - ${vehicle.priceText}`}
                      dict={dict}
                      variant="mini"
                      onNotify={showToast}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============ OPINIONES ============ */}
      <section id="opiniones" className="hdm-shell hdm-section">
        <div className="hdm-section-head hdm-reveal">
          <div className="hdm-kicker">{dict.reviewsSection.kicker}</div>
          <h2 className="hdm-h2">{dict.reviewsSection.title}</h2>
        </div>

        <div className="hdm-grid">
          {dict.reviewsSection.items.map((review) => (
            <figure key={review.name} className="hdm-review hdm-reveal">
              <span className="hdm-pill">{dict.levels[review.level]}</span>
              <blockquote>{review.text}</blockquote>
              <figcaption>{review.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {toast && (
        <div className="hdm-toast" role="status">
          {toast}
        </div>
      )}

      {/* ============ PIE ============ */}
      <footer className="hdm-footer">
        <div className="hdm-shell hdm-footer-grid">
          <div className="hdm-footer-brand">
            <img src="/logo.png" alt="" className="hdm-logo hdm-logo--footer" />

            <div>
              <div className="hdm-footer-name">HI DESERT MOTORS</div>
              <p className="hdm-footer-text">
                {dict.footer.tagline}
                <br />
                {dict.footer.city}
              </p>
            </div>
          </div>

          <div className="hdm-contact-card">
            <div className="hdm-eyebrow">{dict.footer.contact}</div>

            <div className="hdm-social">
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label={dict.footer.email}>
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

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FacebookGlyph />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AIChat />
    </main>
  );
}
