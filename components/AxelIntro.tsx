"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/hdm";

/**
 * Presentación del sitio con Axel.
 *
 * Va arriba del todo, antes del inventario: quien llega por primera
 * vez tiene que entender qué es esto antes de ver autos. Quien ya
 * sabe, hace scroll y ya.
 *
 * Axel recortado sobre la línea de autos, ambos sobre el gris del
 * sitio. La línea va desenfocada y oscurecida para que Axel se lea
 * como el sujeto y los autos como el contexto.
 */
export default function AxelIntro({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <section className="axel-intro">
      <span className="light-pass" aria-hidden />

      <div className="axel-intro-bg" aria-hidden>
        <img src="/axel/lineup.webp" alt="" />
      </div>

      <div className="hdm-shell axel-intro-inner">
        <div className="axel-intro-copy">
          <span className="axel-intro-kicker">{dict.axel.kicker}</span>

          <h2 className="axel-intro-title">
            {dict.axel.titleTop}
            <br />
            <span className="hdm-accent">{dict.axel.titleAccent}</span>
          </h2>

          <p className="axel-intro-lead">{dict.axel.lead}</p>

          <ul className="axel-intro-points">
            <li>{dict.axel.point1}</li>
            <li>{dict.axel.point2}</li>
            <li>{dict.axel.point3}</li>
          </ul>

          <div className="axel-intro-actions">
            <a href="#inventario" className="hdm-btn hdm-btn--primary">
              {dict.nav.inventory}
            </a>
            <Link
              href={localePath(locale, "/publicar")}
              className="hdm-btn hdm-btn--ghost"
            >
              {dict.nav.publish}
            </Link>
          </div>
        </div>

        <figure className="axel-intro-figure">
          <img
            src="/axel/axel-hero.webp"
            alt={dict.axel.alt}
            width={720}
            height={1070}
          />
          <figcaption>{dict.axel.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
