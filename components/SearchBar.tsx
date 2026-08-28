"use client";

import { useMemo } from "react";
import { IconGauge, IconPin } from "@/components/HdmIcons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ListingDictionary } from "@/i18n/listing";
import type { PublicListing } from "@/lib/listings-db";

/**
 * Buscador en barra horizontal, debajo del hero.
 *
 * Filtra en el cliente: con decenas de anuncios eso es instantáneo y
 * evita un viaje al servidor por cada tecla. Si algún día son miles,
 * se mueve a la base — pero optimizar eso hoy sería trabajo perdido.
 *
 * Las opciones salen de los anuncios que existen. Un desplegable con
 * 40 marcas de las que sólo 3 tienen autos hace perder el tiempo.
 */
export default function SearchBar({
  dict,
  t,
  listings,
  value,
  onChange,
}: {
  dict: Dictionary;
  t: ListingDictionary;
  listings: PublicListing[];
  value: {
    make: string;
    bodyType: string;
    city: string;
    year: string;
    maxPrice: string;
  };
  onChange: (next: typeof value) => void;
}) {
  const options = useMemo(() => {
    const makes = new Set<string>();
    const bodies = new Set<string>();
    const cities = new Set<string>();
    const years = new Set<number>();

    for (const listing of listings) {
      makes.add(listing.make);
      bodies.add(listing.bodyType);
      if (listing.city) cities.add(listing.city);
      years.add(listing.year);
    }

    return {
      makes: [...makes].sort(),
      bodies: [...bodies].sort(),
      cities: [...cities].sort(),
      years: [...years].sort((a, b) => b - a),
    };
  }, [listings]);

  function set(key: keyof typeof value, next: string) {
    onChange({ ...value, [key]: next });
  }

  return (
    <section className="finder" aria-label={dict.finder.title}>
      <div className="finder-head">
        <IconGauge className="finder-icon" />
        <span>{dict.finder.title}</span>
      </div>

      <div className="finder-grid">
        <label className="finder-field">
          <span>{dict.finder.bodyType}</span>
          <select
            value={value.bodyType}
            onChange={(e) => set("bodyType", e.target.value)}
          >
            <option value="">{dict.finder.allBodies}</option>
            {options.bodies.map((body) => (
              <option key={body} value={body}>
                {t.bodyTypes[body as keyof typeof t.bodyTypes]}
              </option>
            ))}
          </select>
        </label>

        <label className="finder-field">
          <span>{dict.finder.make}</span>
          <select value={value.make} onChange={(e) => set("make", e.target.value)}>
            <option value="">{dict.finder.allMakes}</option>
            {options.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </label>

        <label className="finder-field">
          <span>{dict.finder.city}</span>
          <select value={value.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">{dict.finder.allCities}</option>
            {options.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="finder-field">
          <span>{dict.finder.year}</span>
          <select value={value.year} onChange={(e) => set("year", e.target.value)}>
            <option value="">{dict.finder.anyYear}</option>
            {options.years.map((year) => (
              <option key={year} value={String(year)}>
                {year} {dict.finder.orNewer}
              </option>
            ))}
          </select>
        </label>

        <label className="finder-field">
          <span>{dict.finder.maxPrice}</span>
          <select
            value={value.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          >
            <option value="">{dict.finder.noLimit}</option>
            {[5000, 10000, 15000, 20000, 30000, 50000].map((price) => (
              <option key={price} value={String(price)}>
                ${price.toLocaleString("en-US")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Sin botón "Buscar": el filtro ya se aplicó al soltar el
          desplegable. Un botón que no hace nada enseña a desconfiar
          de los botones. */}
      <a href="#inventario" className="finder-go">
        <IconPin className="finder-go-icon" />
        {dict.finder.jump}
      </a>
    </section>
  );
}
