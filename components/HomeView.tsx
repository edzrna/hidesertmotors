"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AIChat from "@/components/AIChat";
import HDMRing, { RingGradientDefs } from "@/components/HDMRing";
import Gallery from "@/components/Gallery";
import ShareButtons from "@/components/ShareButtons";
import InventoryControls from "@/components/InventoryControls";
import { WhatsAppGlyph, FacebookGlyph, MailGlyph } from "@/components/Icons";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import {
  MOOD_SCALE,
  formatMiles,
  getHDMLevel,
  localePath,
  type Locale,
} from "@/lib/hdm";
import {
  sellerWhatsAppUrl,
  type PublicListing,
} from "@/lib/listings-db";
import {
  DEFAULT_SORT,
  applyInventoryView,
  getMakes,
  type SortKey,
} from "@/lib/sort";
import { CONTACT_EMAIL, FACEBOOK_URL, SITE_URL } from "@/lib/site";

export default function HomeView({
  locale,
  dict,
  listings,
}: {
  locale: Locale;
  dict: Dictionary;
  listings: PublicListing[];
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [toast, setToast] = useState("");

  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [make, setMake] = useState<string | null>(null);
  const [hideSold, setHideSold] = useState(false);

  const makes = useMemo(() => getMakes(listings), [listings]);

  const visible = useMemo(
    () => applyInventoryView(listings, { sort, make, hideSold, locale }),
    [listings, sort, make, hideSold, locale]
  );

  const available = useMemo(() => listings.filter((l) => !l.sold), [listings]);

  const inventoryScore = available.length
    ? Math.round(
        available.reduce((sum, l) => sum + l.score, 0) / available.length
      )
    : 0;

  const inventoryLevel = getHDMLevel(inventoryScore || 60);
  const featured = available[0];
  const best = [...available].sort((a, b) => b.score - a.score)[0];

  const otherLocale: Locale = locale === "es" ? "en" : "es";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  }, [visible.length]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function listingUrl(id: string) {
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

            <Link
              href={localePath(locale, "/publicar")}
              className="hdm-btn hdm-btn--ghost"
            >
              {dict.nav.publish}
            </Link>
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

          {/* Deja claro de entrada qué es el sitio. */}
          <p className="hdm-board-note">{dict.hero.boardNotice}</p>

          {available.length > 0 && (
            <div className="hdm-meter">
              <div className="hdm-meter-top">
                <HDMRing
                  score={inventoryScore}
                  label={ringLabel(inventoryScore)}
                  dark
                />

                <div>
                  <div className="hdm-meter-label">{dict.hero.meterLabel}</div>
                  <div className="hdm-meter-level">
                    {dict.levels[inventoryLevel]}
                  </div>
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
                    <span className="hdm-scale-label">
                      {dict.levels[item.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {best && (
            <p className="hdm-note">
              {dict.hero.best}: <strong>{best.name}</strong> — {best.score}{" "}
              {dict.hero.points}.
            </p>
          )}
        </section>

        {featured ? (
          <section className="hdm-panel">
            <div className="hdm-eyebrow">{dict.vehicle.featured}</div>
            <h2 className="hdm-featured-title">{featured.name}</h2>

            <Gallery
              images={featured.gallery.length ? featured.gallery : [featured.image]}
              alt={featured.name}
              dict={dict}
              sold={featured.sold}
            />

            <div className="hdm-price">{featured.priceText}</div>

            <div className="hdm-actions">
              <Link
                href={localePath(locale, `/car/${featured.id}`)}
                className="hdm-btn hdm-btn--primary"
              >
                {dict.vehicle.details}
              </Link>

              <a
                href={sellerWhatsAppUrl(
                  featured.sellerPhone,
                  fill(dict.vehicle.whatsappMessage, { name: featured.name })
                )}
                target="_blank"
                rel="noreferrer"
                className="hdm-btn hdm-btn--ghost"
              >
                {dict.vehicle.contactSeller}
              </a>
            </div>

            <ShareButtons
              url={listingUrl(featured.id)}
              text={`${featured.name} - ${featured.priceText}`}
              dict={dict}
              onNotify={showToast}
            />
          </section>
        ) : (
          <section className="hdm-panel hdm-empty-panel">
            <div className="hdm-eyebrow">{dict.inventory.kicker}</div>
            <h2 className="hdm-featured-title">{dict.inventory.emptyTitle}</h2>
            <p className="hdm-card-text">{dict.inventory.emptyBody}</p>

            <div className="hdm-actions">
              <Link
                href={localePath(locale, "/publicar")}
                className="hdm-btn hdm-btn--primary"
              >
                {dict.nav.publish}
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* ============ INVENTARIO ============ */}
      <section id="inventario" className="hdm-shell hdm-section hdm-section--last">
        <div className="hdm-section-head hdm-reveal">
          <div className="hdm-kicker">{dict.inventory.kicker}</div>
          <h2 className="hdm-h2">{dict.inventory.title}</h2>
        </div>

        {listings.length > 0 && (
          <InventoryControls
            dict={dict}
            makes={makes}
            sort={sort}
            make={make}
            hideSold={hideSold}
            shown={visible.length}
            total={listings.length}
            onSortChange={setSort}
            onMakeChange={setMake}
            onHideSoldChange={setHideSold}
            onReset={() => {
              setMake(null);
              setHideSold(false);
            }}
          />
        )}

        {visible.length === 0 && (
          <p className="hdm-empty">
            {listings.length === 0
              ? dict.inventory.emptyBody
              : dict.inventory.empty}
          </p>
        )}

        <div className="hdm-grid">
          {visible.map((listing) => (
            <article
              key={listing.id}
              className={`hdm-card hdm-reveal${
                listing.sold ? " hdm-card--sold" : ""
              }`}
            >
              <div className="hdm-card-media">
                <img src={listing.image} alt={listing.name} loading="lazy" />
                {listing.sold && (
                  <span className="hdm-badge-sold">{dict.vehicle.soldBadge}</span>
                )}
              </div>

              <div className="hdm-card-body">
                <div className="hdm-card-head">
                  <h3 className="hdm-card-title">{listing.name}</h3>
                  <span className="hdm-card-price">{listing.priceText}</span>
                </div>

                {listing.sold && (
                  <div className="hdm-sold-text">{dict.vehicle.soldNotice}</div>
                )}

                <div className="hdm-score-row">
                  <HDMRing
                    score={listing.score}
                    label={ringLabel(listing.score)}
                    small
                  />
                  <div>
                    <div className="hdm-score-level">
                      {dict.levels[listing.levelKey]}
                    </div>
                    <div className="hdm-score-caption">
                      {dict.vehicle.declaredCaption}
                    </div>
                  </div>
                </div>

                {/* Las banderas van en la tarjeta, no escondidas en la
                    ficha: son la razón por la que el sitio sirve. */}
                {listing.flags.length > 0 && (
                  <ul className="hdm-card-flags">
                    {listing.flags.slice(0, 3).map((flag) => (
                      <li key={flag}>
                        {dict.flags[flag as keyof typeof dict.flags] ?? flag}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="hdm-card-text">
                  {listing.description.slice(0, 160)}
                  {listing.description.length > 160 ? "…" : ""}
                </p>

                <dl className="hdm-specs">
                  <div>
                    <dt>{dict.specs.year}: </dt>
                    <dd>{listing.year}</dd>
                  </div>
                  <div>
                    <dt>{dict.specs.miles}: </dt>
                    <dd>{formatMiles(listing.miles, locale)}</dd>
                  </div>
                  <div>
                    <dt>{dict.specs.title}: </dt>
                    <dd>{dict.titles[listing.titleStatus]}</dd>
                  </div>
                  <div>
                    <dt>{dict.specs.owners}: </dt>
                    <dd>{listing.owners}</dd>
                  </div>
                </dl>

                <div className="hdm-actions">
                  <Link
                    href={localePath(locale, `/car/${listing.id}`)}
                    className="hdm-btn hdm-btn--primary"
                  >
                    {dict.vehicle.details}
                  </Link>

                  {!listing.sold && (
                    <a
                      href={sellerWhatsAppUrl(
                        listing.sellerPhone,
                        fill(dict.vehicle.whatsappMessage, {
                          name: listing.name,
                        })
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="hdm-btn hdm-btn--ghost"
                    >
                      {dict.vehicle.contactSeller}
                    </a>
                  )}
                </div>

                {!listing.sold && (
                  <ShareButtons
                    url={listingUrl(listing.id)}
                    text={`${listing.name} - ${listing.priceText}`}
                    dict={dict}
                    variant="mini"
                    onNotify={showToast}
                  />
                )}
              </div>
            </article>
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

            {/* Ya no hay teléfono del sitio. El contacto de cada auto
                es su vendedor; este correo es sólo para el sitio. */}
            <p className="hdm-footer-text">{dict.footer.noPhoneNotice}</p>

            <div className="hdm-social">
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label={dict.footer.email}>
                <MailGlyph />
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
