"use client";

import CategoryGauge from "@/components/CategoryGauge";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CategoryKey } from "@/lib/listing-score";

/**
 * Los cuatro medidores juntos.
 *
 * El orden no es alfabético: va de lo que más cuesta arreglar a lo
 * que menos. Quien sólo mire el primero ya vio lo importante.
 */
const ORDER: { key: CategoryKey; icon: string }[] = [
  { key: "mechanical", icon: "⚙️" },
  { key: "legal", icon: "📄" },
  { key: "electrical", icon: "⚡" },
  { key: "cosmetic", icon: "✨" },
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
        {ORDER.map(({ key, icon }) => (
          <CategoryGauge
            key={key}
            value={categories[key] ?? 0}
            label={dict.categories[key]}
            icon={icon}
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
