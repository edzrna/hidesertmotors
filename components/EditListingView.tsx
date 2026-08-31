"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ListingDictionary } from "@/i18n/listing";
import { localePath, formatMiles, type Locale } from "@/lib/hdm";
import type { EditableListing } from "@/lib/listings-db";
import { IconLock } from "@/components/HdmIcons";
import { CITIES, OTHER_CITY, isValidEmail, normalizePhone } from "@/lib/locations";
import { DESCRIPTION_MAX, QUICK_EMOJI } from "@/lib/vehicle-data";

/**
 * Edición de un anuncio ya publicado.
 *
 * Lo bloqueado se muestra, no se esconde: el vendedor tiene que ver
 * exactamente qué declaró y por qué no puede tocarlo. Un campo que
 * simplemente no aparece se siente como un error del sitio; uno que
 * aparece con su razón se entiende.
 */
export default function EditListingView({
  locale,
  dict,
  t,
  listing,
  token,
}: {
  locale: Locale;
  dict: Dictionary;
  t: ListingDictionary;
  listing: EditableListing;
  token: string;
}) {
  const [price, setPrice] = useState(listing.price?.toString() ?? "");
  const [description, setDescription] = useState(listing.description);
  const [city, setCity] = useState(
    CITIES.includes(listing.city as never) ? listing.city : OTHER_CITY
  );
  const [otherCity, setOtherCity] = useState(
    CITIES.includes(listing.city as never) ? "" : listing.city
  );
  const [photos, setPhotos] = useState<string[]>(listing.photos);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [name, setName] = useState(listing.sellerName);
  const [phone, setPhone] = useState(listing.sellerPhone);
  const [email, setEmail] = useState(listing.sellerEmail);

  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "withdrawn" | "sold"
  >("idle");
  const [error, setError] = useState("");

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const resolvedCity = city === OTHER_CITY ? otherCity.trim() : city;

  function insertEmoji(emoji: string) {
    const el = descriptionRef.current;
    if (!el) {
      setDescription((prev) => (prev + emoji).slice(0, DESCRIPTION_MAX));
      return;
    }
    const start = el.selectionStart ?? description.length;
    const end = el.selectionEnd ?? start;
    const next = description.slice(0, start) + emoji + description.slice(end);
    setDescription(next.slice(0, DESCRIPTION_MAX));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  /**
   * Mueve una foto una posición.
   *
   * Botones y no arrastrar: en móvil el arrastre pelea con el scroll
   * de la página, y basta un dedo torpe para soltar la foto en otra
   * parte. Dos flechas siempre funcionan.
   */
  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;

    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleSave() {
    setError("");

    if (!description.trim() || !resolvedCity || !name.trim()) {
      setError(t.form.errorTitle);
      return;
    }
    if (!normalizePhone(phone)) {
      setError(t.form.invalidPhone);
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      setError(t.form.invalidEmail);
      return;
    }
    if (photos.length + newFiles.length < 3) {
      setError(t.form.minPhotos);
      return;
    }

    setStatus("saving");

    try {
      const uploaded: string[] = [];
      for (const file of newFiles) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(`${t.form.uploadFailed} ${detail.slice(0, 140)}`);
        }
        const { url } = await res.json();
        uploaded.push(url);
      }

      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          price: Number(price) || null,
          description,
          city: resolvedCity,
          photos: [...photos, ...uploaded],
          sellerName: name,
          sellerPhone: phone,
          sellerEmail: email,
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`${t.form.saveFailed} (${res.status}) ${detail.slice(0, 160)}`);
      }

      setPhotos((prev) => [...prev, ...uploaded]);
      setNewFiles([]);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2600);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : t.form.saveFailed);
    }
  }

  async function handleMarkSold() {
    if (!window.confirm(t.form.edit.markSoldConfirm)) return;

    setStatus("saving");
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, markSold: true }),
      });
      if (!res.ok) throw new Error();
      setStatus("sold");
    } catch {
      setStatus("idle");
      setError(t.form.saveFailed);
    }
  }

  async function handleWithdraw() {
    if (!window.confirm(t.form.edit.withdrawConfirm)) return;

    setStatus("saving");
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      setStatus("withdrawn");
    } catch {
      setStatus("idle");
      setError(t.form.saveFailed);
    }
  }

  if (status === "sold") {
    return (
      <main className="hdm-shell hdm-detail">
        <div className="pub-done">
          <h2>{t.form.edit.soldTitle}</h2>
          <p>{t.form.edit.soldBody}</p>
          <Link
            href={localePath(locale, "/")}
            className="hdm-btn hdm-btn--primary hdm-btn--block"
          >
            {dict.vehicle.back}
          </Link>
        </div>
      </main>
    );
  }

  if (status === "withdrawn") {
    return (
      <main className="hdm-shell hdm-detail">
        <div className="pub-done">
          <h2>{t.form.edit.withdrawn}</h2>
          <p>{t.form.edit.withdrawnBody}</p>
          <Link
            href={localePath(locale, "/")}
            className="hdm-btn hdm-btn--primary hdm-btn--block"
          >
            {dict.vehicle.back}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="hdm-shell hdm-detail">
      <Link href={localePath(locale, "/")} className="hdm-back">
        ← {dict.vehicle.back}
      </Link>

      <header className="pub-hero">
        <span className="pub-hero-pill">{listing.name}</span>
        <h1 className="pub-hero-title">{t.form.edit.title}</h1>
        <p className="pub-hero-lead">{t.form.edit.lead}</p>

        {listing.status === "pending" && (
          <p className="pub-disclaimer">{t.form.edit.pendingNotice}</p>
        )}

        {listing.status === "sold" && (
          <p className="pub-disclaimer">{t.form.edit.alreadySold}</p>
        )}
      </header>

      {/* ---------- Lo que quedó fijo ---------- */}
      <section className="edit-locked">
        <div className="edit-locked-head">
          <IconLock className="edit-lock-icon" />
          <div>
            <h2>{t.form.edit.lockedTitle}</h2>
            <p>{t.form.edit.lockedBody}</p>
          </div>
        </div>

        <dl className="edit-locked-grid">
          <div>
            <dt>{dict.specs.year}</dt>
            <dd>{listing.year}</dd>
          </div>
          <div>
            <dt>{t.fields.make}</dt>
            <dd>
              {listing.make} {listing.model}
            </dd>
          </div>
          <div>
            <dt>{dict.specs.miles}</dt>
            <dd>{formatMiles(listing.miles, locale)}</dd>
          </div>
          <div>
            <dt>{dict.specs.title}</dt>
            <dd>{dict.titles[listing.titleStatus]}</dd>
          </div>
          <div>
            <dt>{dict.specs.owners}</dt>
            <dd>{listing.owners}</dd>
          </div>
          <div>
            <dt>{dict.specs.accidents}</dt>
            <dd>{listing.accidents}</dd>
          </div>
        </dl>

        <p className="edit-locked-fix">{t.form.edit.lockedFix}</p>
      </section>

      {/* ---------- Lo editable ---------- */}
      <div className="pub-fields edit-fields">
        <fieldset className="pub-step">
          <legend>{t.steps.vehicle}</legend>

          <label className="pub-field">
            <span className="pub-label">{t.fields.price}</span>
            <input
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <label className="pub-field">
            <span className="pub-label">{t.fields.city}</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value={OTHER_CITY}>{t.fields.otherCity}</option>
            </select>
          </label>

          {city === OTHER_CITY && (
            <label className="pub-field">
              <span className="pub-label">{t.fields.otherCityLabel}</span>
              <input
                value={otherCity}
                onChange={(e) => setOtherCity(e.target.value)}
              />
            </label>
          )}
        </fieldset>

        <fieldset className="pub-step">
          <legend>{t.fields.description}</legend>

          <label className="pub-field">
            <div className="pub-emoji">
              {QUICK_EMOJI.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <textarea
              ref={descriptionRef}
              rows={8}
              maxLength={DESCRIPTION_MAX}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <span className="pub-chars">
              {DESCRIPTION_MAX - description.length} {t.form.charsLeft}
            </span>
          </label>
        </fieldset>

        <fieldset className="pub-step">
          <legend>{t.fields.photos}</legend>

          {/* Rejilla de miniaturas en vez de lista.
              Con once fotos, una lista de nombres de archivo es
              ilegible y no dice cuál es cuál. */}
          <ul className="photo-grid">
            {photos.map((url, index) => (
              <li key={url} className={index === 0 ? "is-cover" : undefined}>
                <img src={url} alt="" />

                {index === 0 && (
                  <span className="photo-cover-tag">{t.form.coverPhoto}</span>
                )}

                <div className="photo-actions">
                  <button
                    type="button"
                    onClick={() => movePhoto(index, index - 1)}
                    disabled={index === 0}
                    aria-label={t.form.moveLeft}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, i) => i !== index))
                    }
                    aria-label={t.form.removePhoto}
                  >
                    ×
                  </button>

                  <button
                    type="button"
                    onClick={() => movePhoto(index, index + 1)}
                    disabled={index === photos.length - 1}
                    aria-label={t.form.moveRight}
                  >
                    ›
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="pub-help">{t.form.reorderHelp}</p>

          <label className="pub-file">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setNewFiles((prev) => [...prev, ...files]);
                e.target.value = "";
              }}
            />
            <span>{t.form.addPhotos}</span>
          </label>

          {newFiles.length > 0 && (
            <span className="pub-count">
              +{newFiles.length} {t.form.photosSelected}
            </span>
          )}
        </fieldset>

        <fieldset className="pub-step">
          <legend>{t.steps.contact}</legend>

          <div className="pub-row">
            <label className="pub-field">
              <span className="pub-label">{t.fields.name}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label className="pub-field">
              <span className="pub-label">{t.fields.phone}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>

          <label className="pub-field">
            <span className="pub-label">{t.fields.email}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </fieldset>

        {error && (
          <div className="pub-error" role="alert">
            <strong>{t.form.sendErrorTitle}</strong>
            <span className="pub-error-detail">{error}</span>
          </div>
        )}

        {status === "saved" && (
          <div className="edit-saved" role="status">
            {t.form.edit.saved}
          </div>
        )}

        <button
          type="button"
          className="hdm-btn hdm-btn--primary pub-submit"
          disabled={status === "saving" || listing.status === "sold"}
          onClick={handleSave}
        >
          {status === "saving" ? t.form.edit.saving : t.form.edit.save}
        </button>

        {listing.status !== "sold" && (
          <div className="edit-sold-box">
            <button
              type="button"
              className="hdm-btn hdm-btn--ghost edit-sold-btn"
              disabled={status === "saving"}
              onClick={handleMarkSold}
            >
              {t.form.edit.markSold}
            </button>
            <p>{t.form.edit.markSoldHelp}</p>
          </div>
        )}

        <button
          type="button"
          className="edit-withdraw"
          disabled={status === "saving"}
          onClick={handleWithdraw}
        >
          {t.form.edit.withdraw}
        </button>
      </div>
    </main>
  );
}
