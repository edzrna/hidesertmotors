import { IconVerified } from "@/components/HdmIcons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SellerBadge, SellerHistory } from "@/lib/seller-history";

/**
 * Historial del vendedor, junto al botón de contacto.
 *
 * Sin estrellas: sólo hechos que el sitio observó. "Ha vendido 3
 * autos aquí desde mayo" no se puede inflar; cinco estrellas de
 * desconocidos, sí.
 */
export default function SellerBadgeView({
  dict,
  badge,
  history,
  name,
}: {
  dict: Dictionary;
  badge: SellerBadge;
  history: SellerHistory;
  name: string;
}) {
  if (!badge) return null;

  return (
    <section className={`seller seller--${badge}`}>
      <header className="seller-head">
        <IconVerified className="seller-icon" />
        <div>
          <span className="seller-name">{name}</span>
          <span className="seller-badge">{dict.seller[badge]}</span>
        </div>
      </header>

      <dl className="seller-stats">
        <div>
          <dt>{dict.seller.published}</dt>
          <dd>{history.totalListings}</dd>
        </div>
        <div>
          <dt>{dict.seller.sold}</dt>
          <dd>{history.sold}</dd>
        </div>
        {history.monthsActive > 0 && (
          <div>
            <dt>{dict.seller.since}</dt>
            <dd>
              {history.monthsActive}
              {dict.seller.monthsShort}
            </dd>
          </div>
        )}
      </dl>

      <p className="seller-note">{dict.seller.note}</p>
    </section>
  );
}
