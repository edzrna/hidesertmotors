"use client";

import { useMemo, useState } from "react";
import HDMRing, { RingGradientDefs } from "@/components/HDMRing";
import type { ListingDictionary } from "@/i18n/listing";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/lib/hdm";
import {
  scoreListing,
  validateListing,
  type DefectReport,
  type Listing,
  type TitleStatus,
  type TireCondition,
} from "@/lib/listing-score";

/**
 * Formulario de publicación.
 *
 * La pieza importante es que la calificación se recalcula en cada
 * cambio y está siempre a la vista. El vendedor ve exactamente qué le
 * cuesta cada defecto y qué le suma cada documento — que es la forma
 * de que declarar la verdad sea la opción atractiva y no un castigo.
 */

const DEFECT_KEYS = [
  "checkEngineOn",
  "otherWarningLights",
  "transmissionSlips",
  "overheats",
  "leaksFluid",
  "unusualNoises",
  "hasRust",
  "hasDents",
  "glassCracked",
  "interiorTorn",
  "smokedIn",
] as const;

/** Estas se preguntan en positivo: marcar es lo bueno. */
const WORKS_KEYS = [
  "startsEveryTime",
  "acWorks",
  "heatWorks",
  "allWindowsWork",
  "brakesFeelNormal",
] as const;

const TITLE_OPTIONS: TitleStatus[] = [
  "clean",
  "clean_lien",
  "rebuilt",
  "salvage",
  "no_title",
];

const TIRE_OPTIONS: TireCondition[] = [
  "new",
  "good",
  "worn",
  "needs_replacing",
];

const EMPTY_DEFECTS: DefectReport = {
  checkEngineOn: false,
  otherWarningLights: false,
  startsEveryTime: true,
  transmissionSlips: false,
  overheats: false,
  leaksFluid: false,
  unusualNoises: false,
  acWorks: true,
  heatWorks: true,
  allWindowsWork: true,
  brakesFeelNormal: true,
  hasRust: false,
  hasDents: false,
  glassCracked: false,
  interiorTorn: false,
  smokedIn: false,
  tires: "good",
};

export default function ListingForm({
  locale,
  dict,
  t,
}: {
  locale: Locale;
  dict: Dictionary;
  t: ListingDictionary;
}) {
  const [form, setForm] = useState({
    year: "",
    make: "",
    model: "",
    miles: "",
    price: "",
    titleStatus: "clean" as TitleStatus,
    owners: "1",
    reportedAccidents: "0",
    knownIssues: "",
    vin: "",
    hasServiceRecords: false,
    smogCurrent: false,
    registrationCurrent: false,
    hasVehicleHistoryReport: false,
    name: "",
    phone: "",
    email: "",
    declaration: false,
  });

  const [defects, setDefects] = useState<DefectReport>(EMPTY_DEFECTS);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDefect<K extends keyof DefectReport>(
    key: K,
    value: DefectReport[K]
  ) {
    setDefects((prev) => ({ ...prev, [key]: value }));
  }

  /** El anuncio tal como lo evaluaría el servidor, con lo que hay ahora. */
  const draft: Listing = useMemo(
    () => ({
      id: "draft",
      year: Number(form.year) || new Date().getFullYear(),
      make: form.make,
      model: form.model,
      miles: Number(form.miles) || 0,
      titleStatus: form.titleStatus,
      owners: Number(form.owners) || 1,
      reportedAccidents: Number(form.reportedAccidents) || 0,
      defects,
      documentation: {
        vin: form.vin || null,
        hasServiceRecords: form.hasServiceRecords,
        smogCurrent: form.smogCurrent,
        registrationCurrent: form.registrationCurrent,
        hasVehicleHistoryReport: form.hasVehicleHistoryReport,
        photoCount: photos.length,
      },
      knownIssues: form.knownIssues,
    }),
    [form, defects, photos.length]
  );

  const result = useMemo(() => scoreListing(draft), [draft]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const check = validateListing(draft);
    const nextErrors = { ...check.errors };
    if (!form.declaration) nextErrors.declaration = "required";
    if (!form.name.trim()) nextErrors.name = "required";
    if (!form.phone.trim()) nextErrors.phone = "required";
    if (form.vin && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(form.vin))
      nextErrors.vin = "invalid";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document
        .querySelector(".pub-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setStatus("sending");

    try {
      // Las fotos van primero: el anuncio guarda sus URLs, no los archivos.
      const photoUrls: string[] = [];
      for (const file of photos) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        if (!res.ok) throw new Error("upload failed");
        const { url } = await res.json();
        photoUrls.push(url);
      }

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          price: Number(form.price) || null,
          photos: photoUrls,
          seller: {
            name: form.name,
            phone: form.phone,
            email: form.email || null,
          },
          locale,
        }),
      });

      if (!res.ok) throw new Error("submit failed");
      setStatus("sent");
    } catch {
      setStatus("idle");
      setErrors({ submit: "failed" });
    }
  }

  if (status === "sent") {
    return (
      <div className="pub-done">
        <h2>{t.form.successTitle}</h2>
        <p>{t.form.successBody}</p>
      </div>
    );
  }

  const confidenceLabel = t.score[result.confidenceLevel];

  return (
    <form className="pub-form" onSubmit={handleSubmit} noValidate>
      <RingGradientDefs />

      {/* La calificación viaja con el usuario mientras baja por el formulario. */}
      <aside className="pub-live">
        <div className="pub-live-ring">
          <HDMRing
            score={result.score}
            label={`${t.score.title}: ${result.score}/100`}
          />
          <div>
            <div className="pub-live-level">{dict.levels[result.levelKey]}</div>
            <div className="pub-live-caption">{t.score.liveHint}</div>
          </div>
        </div>

        <div className="pub-live-conf">
          <div className="pub-live-conf-head">
            <span>{t.score.confidence}</span>
            <strong>
              {confidenceLabel} · {result.confidence}
            </strong>
          </div>
          <div className="pub-bar">
            <span style={{ width: `${result.confidence}%` }} />
          </div>
          <p className="pub-live-caption">{t.score.confidenceHelp}</p>
        </div>

        {result.flags.length > 0 && (
          <div className="pub-live-flags">
            <span className="pub-live-flags-title">{t.flags.title}</span>
            <ul>
              {result.flags.map((flag) => (
                <li key={flag}>{t.flags[flag as keyof typeof t.flags]}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="pub-fields">
        {/* ---------- El vehículo ---------- */}
        <fieldset className="pub-step">
          <legend>{t.steps.vehicle}</legend>

          <div className="pub-row">
            <Field label={t.fields.year} error={errors.year && t.form.required}>
              <input
                type="number"
                inputMode="numeric"
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              />
            </Field>

            <Field label={t.fields.make} error={errors.make && t.form.required}>
              <input
                value={form.make}
                onChange={(e) => set("make", e.target.value)}
              />
            </Field>

            <Field
              label={t.fields.model}
              error={errors.model && t.form.required}
            >
              <input
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
              />
            </Field>
          </div>

          <div className="pub-row">
            <Field
              label={t.fields.miles}
              error={errors.miles && t.form.required}
            >
              <input
                type="number"
                inputMode="numeric"
                value={form.miles}
                onChange={(e) => set("miles", e.target.value)}
              />
            </Field>

            <Field label={t.fields.price}>
              <input
                type="number"
                inputMode="numeric"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        {/* ---------- Historial y título ---------- */}
        <fieldset className="pub-step">
          <legend>{t.steps.history}</legend>

          <Field label={t.fields.titleStatus}>
            <select
              value={form.titleStatus}
              onChange={(e) => set("titleStatus", e.target.value as TitleStatus)}
            >
              {TITLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t.titleStatus[option]}
                </option>
              ))}
            </select>
          </Field>

          <div className="pub-row">
            <Field label={t.fields.owners}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={form.owners}
                onChange={(e) => set("owners", e.target.value)}
              />
            </Field>

            <Field label={t.fields.accidents}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.reportedAccidents}
                onChange={(e) => set("reportedAccidents", e.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        {/* ---------- Estado real ---------- */}
        <fieldset className="pub-step">
          <legend>{t.steps.condition}</legend>

          <div className="pub-checks">
            {WORKS_KEYS.map((key) => (
              <label className="pub-check" key={key}>
                <input
                  type="checkbox"
                  checked={defects[key]}
                  onChange={(e) => setDefect(key, e.target.checked)}
                />
                <span>{t.defects[key]}</span>
              </label>
            ))}
          </div>

          <div className="pub-checks pub-checks--negative">
            {DEFECT_KEYS.map((key) => (
              <label className="pub-check" key={key}>
                <input
                  type="checkbox"
                  checked={defects[key]}
                  onChange={(e) => setDefect(key, e.target.checked)}
                />
                <span>{t.defects[key]}</span>
              </label>
            ))}
          </div>

          <Field label={t.fields.tires}>
            <select
              value={defects.tires}
              onChange={(e) =>
                setDefect("tires", e.target.value as TireCondition)
              }
            >
              {TIRE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t.tires[option]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t.fields.knownIssues}
            help={t.fields.knownIssuesHelp}
            error={errors.knownIssues && t.form.required}
          >
            <textarea
              rows={4}
              value={form.knownIssues}
              onChange={(e) => set("knownIssues", e.target.value)}
            />
          </Field>
        </fieldset>

        {/* ---------- Respaldo ---------- */}
        <fieldset className="pub-step">
          <legend>{t.steps.docs}</legend>

          <Field
            label={t.fields.vin}
            help={t.fields.vinHelp}
            error={errors.vin && t.form.invalidVin}
          >
            <input
              value={form.vin}
              maxLength={17}
              onChange={(e) => set("vin", e.target.value.toUpperCase())}
            />
          </Field>

          <div className="pub-checks">
            {(
              [
                "hasServiceRecords",
                "smogCurrent",
                "registrationCurrent",
                "hasVehicleHistoryReport",
              ] as const
            ).map((key) => (
              <label className="pub-check" key={key}>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                />
                <span>{t.docs[key]}</span>
              </label>
            ))}
          </div>

          <Field
            label={t.fields.photos}
            help={t.fields.photosHelp}
            error={errors.photos && t.form.minPhotos}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            />
            {photos.length > 0 && (
              <span className="pub-count">{photos.length}</span>
            )}
          </Field>
        </fieldset>

        {/* ---------- Contacto ---------- */}
        <fieldset className="pub-step">
          <legend>{t.steps.contact}</legend>

          <div className="pub-row">
            <Field label={t.fields.name} error={errors.name && t.form.required}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>

            <Field
              label={t.fields.phone}
              error={errors.phone && t.form.required}
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
          </div>

          <Field label={t.fields.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
        </fieldset>

        <label
          className={`pub-declaration${
            errors.declaration ? " has-error" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={form.declaration}
            onChange={(e) => set("declaration", e.target.checked)}
          />
          <span>{t.form.declaration}</span>
        </label>

        {Object.keys(errors).length > 0 && (
          <div className="pub-error" role="alert">
            <strong>{t.form.errorTitle}</strong>
            <span>{t.form.errorBody}</span>
          </div>
        )}

        <button
          type="submit"
          className="hdm-btn hdm-btn--primary pub-submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? t.form.submitting : t.form.submit}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <label className={`pub-field${error ? " has-error" : ""}`}>
      <span className="pub-label">{label}</span>
      {children}
      {help && <span className="pub-help">{help}</span>}
      {error && <span className="pub-field-error">{error}</span>}
    </label>
  );
}
