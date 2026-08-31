"use client";

import Link from "next/link";
import HDMRing, { RingGradientDefs } from "@/components/HDMRing";
import Gallery from "@/components/Gallery";
import ShareButtons from "@/components/ShareButtons";
import CategoryGrid from "@/components/CategoryGrid";
import SellerBadgeView from "@/components/SellerBadge";
import AxelFace from "@/components/AxelFace";
import type { SellerBadge, SellerHistory } from "@/lib/seller-history";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import type { ListingDictionary } from "@/i18n/listing";
import type { LegalDictionary } from "@/i18n/legal";
import ReportButton from "@/components/ReportButton";
import { formatMiles, localePath, type Locale } from "@/lib/hdm";
import { sellerWhatsAppUrl, type PublicListing } from "@/lib/listings-db";
import { SITE_URL } from "@/lib/site";

export default function CarView({
  locale,
  dict,
  t,
  legal,
  listing,
  seller,
}: {
  locale: Locale;
  dict: Dictionary;
  t: ListingDictionary;
  legal: LegalDictionary;
  listing: PublicListing;
  seller: { history: SellerHistory; badge: SellerBadge } | null;
}) {
  const path = localePath(locale, `/car/${listing.id}`);
  const shareUrl =
    typeof window === "undefined" ? `${SITE_URL}${path}` : window.location.href;

  const gallery = listing.gallery.length ? listing.gallery : [listing.image];

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
            alt={listing.name}
            dict={dict}
            sold={listing.sold}
            size="detail"
          />

          {/* El anuncio del vendedor, tal como lo escribió. */}
          {listing.description && (
            <section className="hdm-seller-note">
              <div className="hdm-eyebrow">{dict.vehicle.sellerSays}</div>
              <p>{listing.description}</p>
            </section>
          )}
        </div>

        <div className="hdm-panel hdm-detail-info">
          <div className="hdm-kicker">{dict.vehicle.sheet}</div>

          <h1 className="hdm-h2">{listing.name}</h1>

          <div className="hdm-price">{listing.priceText}</div>

          {listing.sold && (
            <div className="hdm-sold-text">{dict.vehicle.soldNotice}</div>
          )}

          <div className="hdm-score-row">
            <HDMRing
              score={listing.score}
              label={`${dict.hero.pill}: ${listing.score}/100`}
              small
            />
            <div>
              <div className="hdm-score-level">
                <AxelFace level={listing.levelKey} size="sm" />
                {dict.levels[listing.levelKey]}
              </div>
              <div className="hdm-score-caption">
                {dict.vehicle.declaredCaption}
              </div>
            </div>
          </div>

          {/* Aviso de origen del dato. Va junto al número, no al pie:
              quien ve la calificación tiene que ver de dónde sale. */}
          <p className="hdm-declared">{t.score.declaredBy}</p>

          <div className="hdm-conf">
            <div className="hdm-conf-head">
              <span>{t.score.confidence}</span>
              <strong>
                {t.score[listing.confidenceLevel]} · {listing.confidence}
              </strong>
            </div>
            <div className="pub-bar">
              <span style={{ width: `${listing.confidence}%` }} />
            </div>
          </div>

          <CategoryGrid dict={dict} categories={listing.categories} />

          {listing.flags.length > 0 && (
            <div className="hdm-flags">
              <div className="hdm-flags-title">{t.flags.title}</div>
              <ul>
                {listing.flags.map((flag) => (
                  <li key={flag}>
                    {t.flags[flag as keyof typeof t.flags] ?? flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <dl className="hdm-info-grid">
            <InfoBox label={dict.specs.year} value={String(listing.year)} />
            <InfoBox
              label={dict.specs.miles}
              value={formatMiles(listing.miles, locale)}
            />
            <InfoBox
              label={dict.specs.title}
              value={dict.titles[listing.titleStatus]}
            />
            <InfoBox label={dict.specs.owners} value={String(listing.owners)} />
            <InfoBox
              label={dict.specs.accidents}
              value={String(listing.accidents)}
            />
            <InfoBox
              label={dict.specs.bodyType}
              value={t.bodyTypes[listing.bodyType]}
            />
            <InfoBox
              label={dict.specs.fuelType}
              value={t.fuelTypes[listing.fuelType]}
            />
            <InfoBox
              label={t.fields.color}
              value={t.colors[listing.color as keyof typeof t.colors] ?? listing.color}
            />
            <InfoBox
              label={dict.specs.transmission}
              value={t.transmissions[listing.transmission]}
            />
            {listing.city && (
              <InfoBox label={dict.specs.city} value={listing.city} />
            )}
          </dl>

          {listing.knownIssues && (
            <section className="hdm-known">
              <div className="hdm-eyebrow">{t.fields.knownIssues}</div>
              <p>{listing.knownIssues}</p>
            </section>
          )}

          {seller && (
            <SellerBadgeView
              dict={dict}
              badge={seller.badge}
              history={seller.history}
              name={listing.sellerName}
            />
          )}

          {!listing.sold && (
            <>
              <a
                href={sellerWhatsAppUrl(
                  listing.sellerPhone,
                  fill(dict.vehicle.whatsappMessage, { name: listing.name })
                )}
                target="_blank"
                rel="noreferrer"
                className="hdm-btn hdm-btn--primary hdm-btn--block"
              >
                {dict.vehicle.contactSeller}
              </a>

              <p className="hdm-seller-line">
                {fill(dict.vehicle.soldBy, { name: listing.sellerName })}
              </p>
            </>
          )}

          {!listing.sold && listing.daysLeft !== null && (
            <p className="hdm-expires">
              {dict.specs.expires}{" "}
              {fill(dict.specs.daysLeft, { n: listing.daysLeft })}
            </p>
          )}

          <ShareButtons url={shareUrl} text={listing.name} dict={dict} extended />

          <ReportButton listingId={listing.id} t={legal} />
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
