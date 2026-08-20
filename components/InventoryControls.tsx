"use client";

import { fill, type Dictionary } from "@/i18n/dictionaries";
import { SORT_KEYS, type SortKey } from "@/lib/sort";

/**
 * Barra de orden y filtro del inventario.
 *
 * Es "controlado": no guarda estado propio, lo recibe y lo reporta.
 * Así HomeView es el único dueño de la vista y no hay dos verdades.
 */
export default function InventoryControls({
  dict,
  makes,
  sort,
  make,
  hideSold,
  shown,
  total,
  onSortChange,
  onMakeChange,
  onHideSoldChange,
  onReset,
}: {
  dict: Dictionary;
  makes: string[];
  sort: SortKey;
  make: string | null;
  hideSold: boolean;
  shown: number;
  total: number;
  onSortChange: (value: SortKey) => void;
  onMakeChange: (value: string | null) => void;
  onHideSoldChange: (value: boolean) => void;
  onReset: () => void;
}) {
  const isFiltered = make !== null || hideSold;

  return (
    <div className="hdm-controls">
      <div className="hdm-control">
        <label className="hdm-control-label" htmlFor="hdm-sort">
          {dict.inventory.sortLabel}
        </label>
        <select
          id="hdm-sort"
          className="hdm-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {dict.inventory.sort[key]}
            </option>
          ))}
        </select>
      </div>

      {makes.length > 1 && (
        <div className="hdm-control">
          <label className="hdm-control-label" htmlFor="hdm-make">
            {dict.inventory.makeLabel}
          </label>
          <select
            id="hdm-make"
            className="hdm-select"
            value={make ?? ""}
            onChange={(e) => onMakeChange(e.target.value || null)}
          >
            <option value="">{dict.inventory.allMakes}</option>
            {makes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="hdm-toggle">
        <input
          type="checkbox"
          checked={hideSold}
          onChange={(e) => onHideSoldChange(e.target.checked)}
        />
        <span>{dict.inventory.hideSold}</span>
      </label>

      <div className="hdm-controls-tail">
        <span className="hdm-count">
          {fill(dict.inventory.count, { n: shown, total })}
        </span>

        {isFiltered && (
          <button type="button" className="hdm-reset" onClick={onReset}>
            {dict.inventory.reset}
          </button>
        )}
      </div>
    </div>
  );
}
