"use client";

import Link from "next/link";
import HDMRing, { RingGradientDefs } from "@/components/HDMRing";
import Gallery from "@/components/Gallery";
import ShareButtons from "@/components/ShareButtons";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import {
  formatMiles,
  localePath,
  pick,
  type Locale,
  type ScoredVehicle,
} from "@/lib/hdm";
import { PRIMARY_WHATSAPP, PRIMARY_WHATSAPP_URL, SITE_URL } from "@/lib/site";

export default function CarView({
  locale,
  dict,
  vehicle,
}: {
  locale: Locale;
  dict: Dictionary;
  vehicle: ScoredVehicle;
}) {
  const gallery = vehicle.gallery?.length ? vehicle.gallery : [vehicle.image];
  const path = localePath(locale, `/car/${vehicle.id}`);

  const shareUrl =
    typeof window === "undefined" ? `${SITE_URL}${path}` : window.location.href;

  const shareText = `${vehicle.name} - ${vehicle.priceText} | HI DESERT MOTORS`;

  return (
    <main className="hdm-shell hdm-detail">
      <RingGradientDefs />

      <Link href={localePath(locale, "/")} className="hdm-back">
        ← {dict.vehicle.back}
      </Link>

      <div className="hdm-detail-grid">
        <div className="hdm-panel hdm-detail-media">
          <Gallery
            images={gallery}
            alt={vehicle.name}
            dict={dict}
            sold={vehicle.sold}
            size="detail"
          />
        </div>

        <div className="hdm-panel hdm-detail-info">
          <div className="hdm-kicker">{dict.vehicle.sheet}</div>

          <h1 className="hdm-h2">{vehicle.name}</h1>

          <div className="hdm-price">{vehicle.priceText}</div>

          {vehicle.sold && (
            <div className="hdm-sold-text">{dict.vehicle.soldNotice}</div>
          )}

          <div className="hdm-score-row">
            <HDMRing
              score={vehicle.score}
              label={`${dict.hero.pill}: ${vehicle.score}/100`}
              small
            />
            <div>
              <div className="hdm-score-level">{dict.levels[vehicle.levelKey]}</div>
              <div className="hdm-score-caption">{dict.vehicle.scoreCaption}</div>
            </div>
          </div>

          <p className="hdm-detail-text">{pick(vehicle.details, locale)}</p>

          <dl className="hdm-info-grid">
            <InfoBox label={dict.specs.year} value={String(vehicle.year)} />
            <InfoBox
              label={dict.specs.miles}
              value={formatMiles(vehicle.miles, locale)}
            />
            <InfoBox
              label={dict.specs.title}
              value={dict.titles[vehicle.titleStatus]}
            />
            <InfoBox label={dict.specs.owners} value={String(vehicle.owners)} />
            <InfoBox label={dict.specs.accidents} value={String(vehicle.accidents)} />
            <InfoBox
              label={dict.specs.condition}
              value={dict.conditions[vehicle.condition]}
            />
          </dl>

          {!vehicle.sold && (
            <a
              href={`${PRIMARY_WHATSAPP_URL}?text=${encodeURIComponent(
                fill(dict.vehicle.whatsappMessage, { name: vehicle.name })
              )}`}
              target="_blank"
              rel="noreferrer"
              className="hdm-btn hdm-btn--primary hdm-btn--block"
            >
              {dict.vehicle.contactWhatsapp}
            </a>
          )}

          <ShareButtons url={shareUrl} text={shareText} dict={dict} extended />

          <p className="hdm-detail-phone">
            {dict.vehicle.mainWhatsapp}: {PRIMARY_WHATSAPP}
          </p>
        </div>
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="hdm-info-box">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
