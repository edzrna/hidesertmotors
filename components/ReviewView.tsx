"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import HDMRing from "@/components/HDMRing";
import AxelFace from "@/components/AxelFace";
import CategoryGrid from "@/components/CategoryGrid";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ListingDictionary } from "@/i18n/listing";
import { formatMiles, type Locale } from "@/lib/hdm";
import type { ReviewListing } from "@/lib/listings-db";

/**
 * Revisión de un anuncio antes de publicarlo.
 *
 * Existe sobre todo por las fotos: alguien puede subir cualquier cosa,
 * y aprobar a ciegas desde el SQL Editor significa publicarla sin
 * haberla visto. Aquí se ven todas, grandes, antes de decidir.
 *
 * También ahorra el UPDATE a mano — y con él, el olvido de poner la
 * fecha de caducidad.
 */
export default function ReviewView({
  locale,
  dict,
  t,
  listing,
  adminKey,
}: {
  locale: Locale;
  dict: Dictionary;
  t: ListingDictionary;
  listing: ReviewListing;
  adminKey: string;
}) {
  const [status, setStatus] = useState(listing.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "publish" | "reject") {
    if (action === "reject" && !window.confirm("¿Rechazar este anuncio?")) return;

    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, id: listing.id, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "error");

      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="hdm-shell review">
      <header className="review-head">
        <span className={`review-status is-${status}`}>{status}</span>
        <h1>{listing.name}</h1>
        <p className="review-meta">
          {listing.priceText} · {formatMiles(listing.miles, locale)} ·{" "}
          {listing.city || "sin ciudad"}
        </p>
      </header>

      {/* Las fotos primero y grandes: es la razón de esta página. */}
      <section className="review-photos">
        <h2>
          {listing.gallery.length} {listing.gallery.length === 1 ? "foto" : "fotos"}
        </h2>
        <Gallery
          images={listing.gallery}
          alt={listing.name}
          dict={dict}
          size="detail"
        />

        <div className="review-thumbs">
          {listing.gallery.map((url, index) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt={`${index + 1}`} loading="lazy" />
              <span>{index + 1}</span>
            </a>
          ))}
        </div>
        <p className="review-hint">
          Toca una miniatura para abrirla a tamaño completo.
        </p>
      </section>

      <section className="review-score">
        <HDMRing score={listing.score} label={String(listing.score)} />
        <div>
          <AxelFace level={listing.levelKey} size="md" />
          <strong>{dict.levels[listing.levelKey]}</strong>
          <span>Respaldo {listing.confidence}</span>
        </div>
      </section>

      <CategoryGrid dict={dict} categories={listing.categories} />

      {listing.flags.length > 0 && (
        <section className="review-block">
          <h2>Banderas</h2>
          <ul className="hdm-flags">
            {listing.flags.map((flag) => (
              <li key={flag}>{t.flags[flag as keyof typeof t.flags] ?? flag}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="review-block">
        <h2>Lo declarado</h2>
        <dl className="review-data">
          <div><dt>Año</dt><dd>{listing.year}</dd></div>
          <div><dt>Marca</dt><dd>{listing.make} {listing.model}</dd></div>
          <div><dt>Millas</dt><dd>{formatMiles(listing.miles, locale)}</dd></div>
          <div><dt>Título</dt><dd>{dict.titles[listing.titleStatus]}</dd></div>
          <div><dt>Dueños</dt><dd>{listing.owners}</dd></div>
          <div><dt>Accidentes</dt><dd>{listing.accidents}</dd></div>
          <div><dt>Carrocería</dt><dd>{t.bodyTypes[listing.bodyType]}</dd></div>
          <div><dt>Color</dt><dd>{t.colors[listing.color as keyof typeof t.colors] ?? listing.color}</dd></div>
          <div><dt>Combustible</dt><dd>{t.fuelTypes[listing.fuelType]}</dd></div>
          <div><dt>Transmisión</dt><dd>{t.transmissions[listing.transmission]}</dd></div>
        </dl>
      </section>

      {listing.knownIssues && (
        <section className="review-block">
          <h2>Problemas conocidos</h2>
          <p className="review-text">{listing.knownIssues}</p>
        </section>
      )}

      <section className="review-block">
        <h2>Descripción</h2>
        <p className="review-text">{listing.description}</p>
      </section>

      <section className="review-block">
        <h2>Vendedor</h2>
        <dl className="review-data">
          <div><dt>Nombre</dt><dd>{listing.sellerName}</dd></div>
          <div><dt>Teléfono</dt><dd>{listing.sellerPhone}</dd></div>
          <div><dt>Correo</dt><dd>{listing.sellerEmail || "—"}</dd></div>
        </dl>
      </section>

      {error && (
        <div className="pub-error" role="alert">
          <span className="pub-error-detail">{error}</span>
        </div>
      )}

      {/* Las acciones al final: se decide después de ver todo, no
          antes. */}
      <div className="review-actions">
        {status === "published" ? (
          <p className="review-done is-ok">
            Publicado. Vence en 30 días.
          </p>
        ) : status === "rejected" ? (
          <p className="review-done is-no">Rechazado. No aparece en el sitio.</p>
        ) : (
          <>
            <button
              type="button"
              className="hdm-btn hdm-btn--primary hdm-btn--block"
              disabled={busy}
              onClick={() => act("publish")}
            >
              {busy ? "Un momento…" : "Publicar"}
            </button>

            <button
              type="button"
              className="review-reject"
              disabled={busy}
              onClick={() => act("reject")}
            >
              Rechazar
            </button>
          </>
        )}
      </div>
    </main>
  );
}
