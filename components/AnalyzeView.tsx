"use client";

import { useMemo, useState } from "react";
import AnalyzeResult, { type AnalyzeResponse } from "@/components/AnalyzeResult";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ListingDictionary } from "@/i18n/listing";
import type { Locale } from "@/lib/hdm";
import type {
  BodyType,
  FuelType,
  Transmission,
  DefectReport,
  Listing,
  TireCondition,
  TitleStatus,
} from "@/lib/listing-score";
import {
  PAYLOAD_LIMIT,
  dataUrlBytes,
  downscaleToDataUrl,
} from "@/lib/downscale";
import { hagertyUrl, kbbUrl } from "@/lib/price-guide";
import { isClassicEligible } from "@/lib/listing-score";
import {
  ACCIDENT_OPTIONS,
  BODY_TYPES,
  EMPTY_DEFECTS,
  FUEL_TYPES,
  TRANSMISSIONS,
  MAKES,
  MILE_HINTS,
  MAX_MILES,
  COLORS,
  OTHER_MAKE,
  OWNER_OPTIONS,
  TIRE_OPTIONS,
  TITLE_OPTIONS,
  getYears,
} from "@/lib/vehicle-data";

/**
 * Diagnóstico gratuito.
 *
 * Pide menos que el formulario de publicar: sin contacto, sin
 * descripción, sin declaración de propiedad. Quien sólo quiere saber
 * qué tiene no debería dejar su teléfono para averiguarlo.
 *
 * Las fotos son opcionales y no se suben al almacenamiento: se leen
 * en el navegador y se mandan al análisis. Si alguien sólo quiere
 * saber, no tiene por qué dejar sus fotos guardadas en el servidor.
 */
const GROUPS = [
  {
    key: "mechanical" as const,
    positive: ["startsEveryTime", "brakesFeelNormal"] as const,
    negative: [
      "checkEngineOn",
      "transmissionSlips",
      "overheats",
      "leaksFluid",
      "unusualNoises",
    ] as const,
  },
  {
    key: "electrical" as const,
    positive: ["acWorks", "heatWorks", "allWindowsWork"] as const,
    negative: ["otherWarningLights"] as const,
  },
  {
    key: "cosmetic" as const,
    positive: [] as const,
    negative: [
      "hasRust",
      "hasDents",
      "glassCracked",
      "interiorTorn",
      "smokedIn",
    ] as const,
  },
];

export default function AnalyzeView({
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
    otherMake: "",
    model: "",
    miles: "",
    bodyType: "sedan",
    color: "white",
    isClassic: false,
    fuelType: "gasoline",
    transmission: "automatic",
    titleStatus: "clean" as TitleStatus,
    owners: "1",
    accidents: "0",
  });

  const [defects, setDefects] = useState<DefectReport>(EMPTY_DEFECTS);
  const [photos, setPhotos] = useState<{ name: string; data: string }[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);

  const years = useMemo(() => getYears(), []);
  const resolvedMake =
    form.make === OTHER_MAKE ? form.otherMake.trim() : form.make;

  const listing: Listing = useMemo(
    () => ({
      id: "preview",
      year: Number(form.year) || new Date().getFullYear(),
      make: resolvedMake || "—",
      model: form.model.trim() || "—",
      miles: Number(form.miles) || 0,
      titleStatus: form.titleStatus,
      owners: Number(form.owners) || 1,
      reportedAccidents: Number(form.accidents) || 0,
      defects,
      documentation: {
        vin: null,
        hasServiceRecords: false,
        smogCurrent: false,
        registrationCurrent: false,
        hasVehicleHistoryReport: false,
        photoCount: photos.length,
      },
      knownIssues: "",
      description: "",
      city: "",
      color: form.color,
      isClassic: Boolean(form.isClassic),
      bodyType: form.bodyType as BodyType,
      fuelType: form.fuelType as FuelType,
      transmission: form.transmission as Transmission,
    }),
    [form, resolvedMake, defects, photos.length]
  );

  const ready = Boolean(form.year && resolvedMake && form.model && form.miles);

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDefect<K extends keyof DefectReport>(
    key: K,
    value: DefectReport[K]
  ) {
    setDefects((prev) => ({ ...prev, [key]: value }));
  }

  async function readFiles(files: File[]) {
    setError("");
    setPreparing(true);

    try {
      const out: { name: string; data: string }[] = [];

      for (const file of files.slice(0, 6)) {
        if (!file.type.startsWith("image/")) continue;

        // Se encoge aquí, no al enviar: así el peso acumulado ya es
        // el real cuando se decide si cabe.
        const data = await downscaleToDataUrl(file);
        out.push({ name: file.name, data });
      }

      setPhotos((prev) => {
        const merged = [...prev, ...out].slice(0, 6);

        // Aunque estén reducidas, seis fotos pueden acercarse al
        // límite. Se cortan por peso, no por número.
        const kept: typeof merged = [];
        let total = 0;

        for (const photo of merged) {
          const bytes = dataUrlBytes(photo.data);
          if (total + bytes > PAYLOAD_LIMIT) break;
          total += bytes;
          kept.push(photo);
        }

        if (kept.length < merged.length) {
          setError(dict.analyze.photosTrimmed);
        }

        return kept;
      });
    } catch {
      setError(dict.analyze.photoReadFailed);
    } finally {
      setPreparing(false);
    }
  }

  async function handleAnalyze() {
    setError("");
    setStatus("running");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing,
          locale,
          photos: photos.map((photo) => photo.data),
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail.slice(0, 160));
      }

      setResult(await res.json());
      setStatus("done");
      requestAnimationFrame(() => {
        document
          .querySelector(".diag")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "error");
    }
  }

  if (status === "done" && result) {
    return (
      <AnalyzeResult
        locale={locale}
        dict={dict}
        t={t}
        result={result}
        kbbHref={listing.isClassic ? hagertyUrl() : kbbUrl(listing)}
        isClassic={listing.isClassic}
        onReset={() => {
          setResult(null);
          setStatus("idle");
          setPhotos([]);
        }}
      />
    );
  }

  return (
    <div className="pub-fields">
      <fieldset className="pub-step">
        <legend>{t.steps.vehicle}</legend>

        <div className="pub-row">
          <label className="pub-field">
            <span className="pub-label">{t.fields.year}</span>
            <select value={form.year} onChange={(e) => set("year", e.target.value)}>
              <option value="">{t.fields.selectPlaceholder}</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="pub-field">
            <span className="pub-label">{t.fields.make}</span>
            <select value={form.make} onChange={(e) => set("make", e.target.value)}>
              <option value="">{t.fields.selectPlaceholder}</option>
              {MAKES.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
              <option value={OTHER_MAKE}>{t.fields.otherMake}</option>
            </select>
          </label>
        </div>

        {form.make === OTHER_MAKE && (
          <label className="pub-field">
            <span className="pub-label">{t.fields.otherMake}</span>
            <input
              value={form.otherMake}
              onChange={(e) => set("otherMake", e.target.value)}
            />
          </label>
        )}

        <label className="pub-field">
          <span className="pub-label">{t.fields.model}</span>
          <input value={form.model} onChange={(e) => set("model", e.target.value)} />
        </label>

        <div className="pub-row">
          <label className="pub-field">
            <span className="pub-label">{t.fields.bodyType}</span>
            <select
              value={form.bodyType}
              onChange={(e) => set("bodyType", e.target.value)}
            >
              {BODY_TYPES.map((option) => (
                <option key={option} value={option}>
                  {t.bodyTypes[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="pub-field">
            <span className="pub-label">{t.fields.color}</span>
            <select
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
            >
              {COLORS.map((option) => (
                <option key={option} value={option}>
                  {t.colors[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="pub-field">
            <span className="pub-label">{t.fields.fuelType}</span>
            <select
              value={form.fuelType}
              onChange={(e) => set("fuelType", e.target.value)}
            >
              {FUEL_TYPES.map((option) => (
                <option key={option} value={option}>
                  {t.fuelTypes[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="pub-field">
          <span className="pub-label">{t.fields.transmission}</span>
          <select
            value={form.transmission}
            onChange={(e) => set("transmission", e.target.value)}
          >
            {TRANSMISSIONS.map((option) => (
              <option key={option} value={option}>
                {t.transmissions[option]}
              </option>
            ))}
          </select>
        </label>

          {/* Sólo aparece si el año lo permite: ofrecerlo en un auto
              de 2020 invitaría a marcarlo por marcarlo. */}
          {isClassicEligible(Number(form.year) || new Date().getFullYear()) && (
            <label className="pub-check pub-check--wide">
              <input
                type="checkbox"
                checked={form.isClassic}
                onChange={(e) => set("isClassic", e.target.checked)}
              />
              <span>
                <strong>{t.fields.isClassic}</strong>
                <small>{t.fields.isClassicHelp}</small>
              </span>
            </label>
          )}

        <label className="pub-field">
          <span className="pub-label">{t.fields.miles}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_MILES}
            value={form.miles}
            placeholder="87,430"
            list="mile-hints-analyze"
            onChange={(e) => set("miles", e.target.value)}
          />
          <datalist id="mile-hints-analyze">
            {MILE_HINTS.map((hint) => (
              <option key={hint} value={hint} />
            ))}
          </datalist>
          <span className="pub-help">{t.fields.milesHelp}</span>
        </label>
      </fieldset>

      <fieldset className="pub-step">
        <legend>{t.steps.history}</legend>

        <label className="pub-field">
          <span className="pub-label">{t.fields.titleStatus}</span>
          <select
            value={form.titleStatus}
            onChange={(e) => set("titleStatus", e.target.value)}
          >
            {TITLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t.titleStatus[option]}
              </option>
            ))}
          </select>
        </label>

        <div className="pub-row">
          <label className="pub-field">
            <span className="pub-label">{t.fields.owners}</span>
            <select
              value={form.owners}
              onChange={(e) => set("owners", e.target.value)}
            >
              {OWNER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="pub-field">
            <span className="pub-label">{t.fields.accidents}</span>
            <select
              value={form.accidents}
              onChange={(e) => set("accidents", e.target.value)}
            >
              {ACCIDENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      {GROUPS.map((group) => (
        <fieldset className="pub-step" key={group.key}>
          <legend>{dict.categories[group.key]}</legend>

          {group.positive.length > 0 && (
            <div className="pub-checks">
              {group.positive.map((key) => (
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
          )}

          <div className="pub-checks">
            {group.negative.map((key) => (
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

          {group.key === "mechanical" && (
            <label className="pub-field">
              <span className="pub-label">{t.fields.tires}</span>
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
            </label>
          )}
        </fieldset>
      ))}

      <fieldset className="pub-step">
        <legend>{dict.analyze.photosTitle}</legend>

        <label className="pub-file">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              readFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <span>{t.form.addPhotos}</span>
        </label>

        <span className="pub-help">{dict.analyze.photosOptional}</span>

        {/* Rejilla de miniaturas, la misma que en editar. Antes se
            mostraban a tamaño completo y seis fotos empujaban el
            formulario media pantalla hacia abajo. */}
        {photos.length > 0 && (
          <ul className="photo-grid">
            {photos.map((photo, index) => (
              <li key={index}>
                <img src={photo.data} alt="" />
                <div className="photo-actions photo-actions--single">
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {error && (
        <div className="pub-error" role="alert">
          <span className="pub-error-detail">{error}</span>
        </div>
      )}

      <button
        type="button"
        className="hdm-btn hdm-btn--primary pub-submit"
        disabled={!ready || status === "running" || preparing}
        onClick={handleAnalyze}
      >
        {status === "running" ? dict.analyze.running : dict.analyze.cta}
      </button>

      <p className="pub-disclaimer">{dict.analyze.disclaimer}</p>
    </div>
  );
}
