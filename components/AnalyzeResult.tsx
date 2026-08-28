"use client";

import Link from "next/link";
import AxelFace from "@/components/AxelFace";
import CategoryGrid from "@/components/CategoryGrid";
import HDMRing from "@/components/HDMRing";
import { IconFlag, IconGauge, IconVerified } from "@/components/HdmIcons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ListingDictionary } from "@/i18n/listing";
import { localePath, type Locale } from "@/lib/hdm";
import type { CategoryKey } from "@/lib/listing-score";
import type { PriceAdjustment } from "@/lib/price-guide";

export interface AnalyzeResponse {
  score: number;
  levelKey: keyof Dictionary["levels"];
  categories: Record<CategoryKey, number>;
  confidence: number;
  flags: string[];
  adjustments: PriceAdjustment[];
  total: { min: number; max: number };
  comparables: {
    id: string;
    name: string;
    miles: number;
    price: number;
    score: number;
  }[];
  narrative: string;
  photoNotes: string[];
  photoTips: string[];
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

export default function AnalyzeResult({
  locale,
  dict,
  t,
  result,
  kbbHref,
  onReset,
}: {
  locale: Locale;
  dict: Dictionary;
  t: ListingDictionary;
  result: AnalyzeResponse;
  kbbHref: string;
  onReset: () => void;
}) {
  const hasAdjustments = result.adjustments.length > 0;

  return (
    <div className="diag">
      {/* ---------- Encabezado con la cara de Axel ---------- */}
      <header className="diag-head">
        <AxelFace level={result.levelKey} size="lg" />
        <div>
          <span className="hdm-kicker">{dict.analyze.resultTitle}</span>
          <h2>{dict.levels[result.levelKey]}</h2>
        </div>
        <HDMRing score={result.score} label={String(result.score)} />
      </header>

      {/* ---------- Lo que dice Axel ---------- */}
      {result.narrative && (
        <section className="diag-block diag-narrative">
          <h3>{dict.analyze.narrativeTitle}</h3>
          <p>{result.narrative}</p>
        </section>
      )}

      {/* ---------- Las cuatro categorías ---------- */}
      <section className="diag-block">
        <CategoryGrid dict={dict} categories={result.categories} />
      </section>

      {/* ---------- Banderas ---------- */}
      {result.flags.length > 0 && (
        <section className="diag-block diag-flags">
          <h3>
            <IconFlag />
            {t.flags.title}
          </h3>
          <ul className="hdm-flags">
            {result.flags.map((flag) => (
              <li key={flag}>{t.flags[flag as keyof typeof t.flags]}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Precio ---------- */}
      <section className="diag-block diag-price">
        <h3>
          <IconGauge />
          {dict.analyze.priceTitle}
        </h3>
        <p className="diag-lead">{dict.analyze.priceLead}</p>

        {hasAdjustments ? (
          <>
            <div className="diag-range">
              <strong>
                {fill(dict.analyze.priceRange, {
                  min: result.total.min,
                  max: result.total.max,
                })}
              </strong>
              <span>{dict.analyze.priceVsClean}</span>
            </div>

            <ul className="diag-factors">
              {result.adjustments.map((adjustment) => {
                const positive = adjustment.max > 0;
                return (
                  <li
                    key={adjustment.key}
                    className={positive ? "is-up" : "is-down"}
                  >
                    <span className="diag-factor-value">
                      {positive ? "+" : ""}
                      {adjustment.min} a {adjustment.max}%
                    </span>
                    <span>
                      {t.adjustments[
                        adjustment.key as keyof typeof t.adjustments
                      ] ?? adjustment.key}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="diag-clean">{dict.analyze.priceNoAdjust}</p>
        )}

        {/* El número duro no sale de aquí, y se dice. */}
        <div className="diag-kbb">
          <strong>{dict.analyze.kbbTitle}</strong>
          <p>{dict.analyze.kbbBody}</p>
          <a
            href={kbbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hdm-btn hdm-btn--ghost"
          >
            {dict.analyze.kbbCta}
          </a>
        </div>
      </section>

      {/* ---------- Comparables reales ---------- */}
      <section className="diag-block">
        <h3>
          <IconVerified />
          {dict.analyze.comparablesTitle}
        </h3>

        {result.comparables.length > 0 ? (
          <ul className="diag-comps">
            {result.comparables.map((car) => (
              <li key={car.id}>
                <Link href={localePath(locale, `/car/${car.id}`)}>
                  <span className="diag-comp-name">{car.name}</span>
                  <span className="diag-comp-meta">
                    {car.miles.toLocaleString(locale)}{" "}
                    {dict.analyze.comparablesMiles} · HDM {car.score}
                  </span>
                  <span className="diag-comp-price">
                    ${car.price.toLocaleString("en-US")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="diag-empty">{dict.analyze.comparablesEmpty}</p>
        )}
      </section>

      {/* ---------- Fotos ---------- */}
      {(result.photoNotes.length > 0 || result.photoTips.length > 0) && (
        <section className="diag-block diag-photos">
          <h3>{dict.analyze.photosTitle}</h3>

          {result.photoNotes.length > 0 && (
            <>
              <h4>{dict.analyze.photoNotesTitle}</h4>
              <ul className="diag-list">
                {result.photoNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </>
          )}

          {result.photoTips.length > 0 && (
            <>
              <h4>{dict.analyze.photoTipsTitle}</h4>
              <ul className="diag-list diag-list--tips">
                {result.photoTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </>
          )}

          <p className="diag-note">{dict.analyze.photoDisclaimer}</p>
        </section>
      )}

      {/* ---------- Publicar ---------- */}
      <section className="diag-block diag-publish">
        <h3>{dict.analyze.publishTitle}</h3>
        <p>{dict.analyze.publishBody}</p>
        <Link
          href={localePath(locale, "/publicar")}
          className="hdm-btn hdm-btn--primary hdm-btn--block"
        >
          {dict.analyze.publishCta}
        </Link>
      </section>

      <button type="button" className="diag-reset" onClick={onReset}>
        {dict.analyze.again}
      </button>

      <p className="diag-note diag-note--final">{dict.analyze.disclaimer}</p>
    </div>
  );
}
