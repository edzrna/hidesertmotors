"use client";

import Link from "next/link";
import HDMRing from "@/components/HDMRing";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/hdm";

/**
 * "Por qué aquí" — el argumento del sitio.
 *
 * Sin carrusel a propósito: en un carrusel la gente lee el primer
 * panel y se va, así que los otros dos argumentos no existen. Aquí los
 * tres se ven a la vez.
 *
 * Y no se explican con texto: se enseña el producto real. El anillo,
 * la bandera roja y la barra de respaldo son los mismos componentes
 * que salen en los anuncios.
 */
export default function WhySection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <>
      {/* ---------- Para quien compra ---------- */}
      <section className="hdm-shell hdm-why">
        <div className="hdm-section-head hdm-reveal">
          <div className="hdm-kicker">{dict.why.buyerKicker}</div>
          <h2 className="hdm-h2">{dict.why.buyerTitle}</h2>
          <p className="hdm-why-lead">{dict.why.buyerLead}</p>
        </div>

        <div className="hdm-why-grid">
          <article className="hdm-why-card hdm-reveal">
            <div className="hdm-why-demo">
              <HDMRing score={84} label={dict.why.demoScoreLabel} />
            </div>
            <h3>{dict.why.point1Title}</h3>
            <p>{dict.why.point1Body}</p>
          </article>

          <article className="hdm-why-card hdm-reveal">
            <div className="hdm-why-demo">
              {/* Banderas reales, no un icono decorativo. */}
              <ul className="hdm-card-flags hdm-why-flags">
                <li>{dict.flags.title_salvage}</li>
                <li>{dict.flags.check_engine}</li>
                <li>{dict.flags.no_smog}</li>
              </ul>
            </div>
            <h3>{dict.why.point2Title}</h3>
            <p>{dict.why.point2Body}</p>
          </article>

          <article className="hdm-why-card hdm-reveal">
            <div className="hdm-why-demo hdm-why-demo--bars">
              <div className="hdm-why-bar">
                <span className="hdm-why-bar-label">
                  {dict.why.backingLabel} · {dict.why.backingHigh}
                </span>
                <div className="pub-bar">
                  <span style={{ width: "82%" }} />
                </div>
              </div>
              <div className="hdm-why-bar">
                <span className="hdm-why-bar-label">
                  {dict.why.backingLabel} · {dict.why.backingLow}
                </span>
                <div className="pub-bar">
                  <span style={{ width: "18%" }} />
                </div>
              </div>
            </div>
            <h3>{dict.why.point3Title}</h3>
            <p>{dict.why.point3Body}</p>
          </article>
        </div>

        <p className="hdm-why-honest">{dict.why.honestNote}</p>
      </section>

      {/* ---------- Para quien vende ---------- */}
      <section className="hdm-shell hdm-steps">
        <div className="hdm-steps-inner">
          <div className="hdm-steps-copy">
            <div className="hdm-kicker">{dict.why.sellerKicker}</div>
            <h2 className="hdm-h2">{dict.why.sellerTitle}</h2>
            <p className="hdm-why-lead">{dict.why.sellerLead}</p>

            <div className="hdm-steps-cta">
              <Link
                href={localePath(locale, "/publicar")}
                className="hdm-btn hdm-btn--primary"
              >
                {dict.nav.publish}
              </Link>

              {/* Para quien todavía no sabe si quiere publicar. */}
              <Link
                href={localePath(locale, "/analiza")}
                className="hdm-btn hdm-btn--ghost"
              >
                {dict.analyze.navLabel}
              </Link>
            </div>
          </div>

          <ol className="hdm-steps-list">
            <li>
              <span className="hdm-step-n">1</span>
              <div>
                <h3>{dict.why.step1Title}</h3>
                <p>{dict.why.step1Body}</p>
              </div>
            </li>
            <li>
              <span className="hdm-step-n">2</span>
              <div>
                <h3>{dict.why.step2Title}</h3>
                <p>{dict.why.step2Body}</p>
              </div>
            </li>
            <li>
              <span className="hdm-step-n">3</span>
              <div>
                <h3>{dict.why.step3Title}</h3>
                <p>{dict.why.step3Body}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
