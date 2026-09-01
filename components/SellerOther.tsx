import Link from "next/link";
import AxelFace from "@/components/AxelFace";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath, formatMiles, type Locale } from "@/lib/hdm";
import type { PublicListing } from "@/lib/listings-db";

/**
 * Otros anuncios del mismo vendedor.
 *
 * Va después del contacto, no antes: primero que decida sobre este
 * auto. Ofrecerle otros mientras evalúa el que está viendo lo distrae
 * de la decisión que vino a tomar.
 */
export default function SellerOther({
  locale,
  dict,
  listings,
  sellerName,
}: {
  locale: Locale;
  dict: Dictionary;
  listings: PublicListing[];
  sellerName: string;
}) {
  if (!listings.length) return null;

  return (
    <section className="seller-other">
      <h2>
        {dict.sellerOther.title} <strong>{sellerName}</strong>
      </h2>

      <ul>
        {listings.map((item) => (
          <li key={item.id}>
            <Link href={localePath(locale, `/car/${item.id}`)}>
              <img src={item.image} alt="" loading="lazy" />

              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.priceText} · {formatMiles(item.miles, locale)}
                </span>
                {item.sold && (
                  <span className="seller-other-sold">
                    {dict.vehicle.sold}
                  </span>
                )}
              </div>

              <div className="seller-other-score">
                <AxelFace level={item.levelKey} size="sm" />
                <b>{item.score}</b>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
