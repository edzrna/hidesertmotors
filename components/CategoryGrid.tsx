"use client";

import CategoryGauge from "@/components/CategoryGauge";
import {
  IconCosmetic,
  IconElectrical,
  IconLegal,
  IconMechanical,
} from "@/components/HdmIcons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CategoryKey } from "@/lib/listing-score";

/**
 * Los cuatro medidores juntos.
 *
 * El orden no es alfabético: va de lo que más cuesta arreglar a lo
 * que menos. Quien sólo mire el primero ya vio lo importante.
 */
const ORDER: {
  key: CategoryKey;
  Icon: (props: { className?: string }) => React.JSX.Element;
}[] = [
  { key: "mechanical", Icon: IconMechanical },
  { key: "legal", Icon: IconLegal },
  { key: "electrical", Icon: IconElectrical },
  { key: "cosmetic", Icon: IconCosmetic },
];

export default function CategoryGrid({
  dict,
  categories,
  compact = false,
}: {
  dict: Dictionary;
  categories: Record<CategoryKey, number>;
  /** En el formulario va sin encabezado y más apretado. */
  compact?: boolean;
}) {
  return (
    <section className={`gauges${compact ? " gauges--compact" : ""}`}>
      {!compact && (
        <header className="gauges-head">
          <h2>{dict.categories.title}</h2>
          <p>{dict.categories.lead}</p>
        </header>
      )}

      <div className="gauges-grid">
        {ORDER.map(({ key, Icon }) => (
          <CategoryGauge
            key={key}
            value={categories[key] ?? 0}
            label={dict.categories[key]}
            Icon={Icon}
            caption={
              compact
                ? undefined
                : dict.categories[
                    `${key}Caption` as keyof typeof dict.categories
                  ]
            }
          />
        ))}
      </div>
    </section>
  );
}
