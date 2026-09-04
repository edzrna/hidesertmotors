"use client";

import { useMemo, useRef, useState } from "react";
import HDMRing, { RingGradientDefs } from "@/components/HDMRing";
import { MailGlyph } from "@/components/Icons";
import {
  IconCamera,
  IconCosmetic,
  IconElectrical,
  IconHistory,
  IconMechanical,
  IconSeller,
  IconVehicle,
  IconWrite,
} from "@/components/HdmIcons";
import { downscaleForUpload } from "@/lib/downscale";
import CategoryGrid from "@/components/CategoryGrid";
import type { ListingDictionary } from "@/i18n/listing";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/lib/hdm";
import {
  CITIES,
  OTHER_CITY,
  isValidEmail,
  normalizePhone,
} from "@/lib/locations";
import {
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  EMPTY_DEFECTS,
  TIRE_OPTIONS,
  TITLE_OPTIONS,
  ACCIDENT_OPTIONS,
  DESCRIPTION_MAX,
  MAKES,
  MILE_HINTS,
  MAX_MILES,
  COLORS,
  OTHER_MAKE,
  OWNER_OPTIONS,
  QUICK_EMOJI,
  getYears,
} from "@/lib/vehicle-data";
import {
  scoreListing,
  validateListing,
  type DefectReport,
  type Listing,
  type TitleStatus,
  type TireCondition,
  type BodyType,
  type FuelType,
  type Transmission,
  isClassicEligible,
} from "@/lib/listing-score";
import { getRequiredFields } from "@/lib/required-fields";
import {
  DEFECTS_BY_CLASS,
  getUsageUnit,
  getVehicleClass,
  hasInterior,
  hasTires,
  needsSmog,
} from "@/lib/vehicle-class";

/**
 * Las casillas agrupadas por la misma categoría que muestran los
 * medidores. Así el vendedor ve qué medidor mueve cada respuesta.
 *
 * `positive` marca las que se preguntan al revés: marcarlas es bueno.
 */
const GROUPS = [
  {
    key: "mechanical" as const,
    Icon: IconMechanical,
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
    Icon: IconElectrical,
    positive: ["acWorks", "heatWorks", "allWindowsWork"] as const,
    negative: ["otherWarningLights"] as const,
  },
  {
    key: "cosmetic" as const,
    Icon: IconCosmetic,
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




const MIN_PHOTOS = 3;

/** Reintenta sólo los fallos de red, no los rechazos del servidor. */
async function fetchWithRetry(url: string, init: RequestInit, tries = 3) {
  let lastError: unknown;

  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }

  throw lastError;
}

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
    otherMake: "",
    model: "",
    bodyType: "sedan",
    color: "white",
    interiorColor: "black",
    engineHours: "",
    isClassic: false,
    fuelType: "gasoline",
    transmission: "automatic",
    city: "",
    otherCity: "",
    miles: "",
    price: "",
    titleStatus: "clean" as TitleStatus,
    owners: "1",
    reportedAccidents: "0",
    knownIssues: "",
    description: "",
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
  /**
   * Un fallo al enviar NO es lo mismo que un campo vacío. Antes los dos
   * mostraban "Faltan datos" y no había forma de saber cuál era.
   */
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [editLink, setEditLink] = useState("");
  const [sentTo, setSentTo] = useState("");
  /**
   * En móvil el panel arranca colapsado: ver el número moverse es lo
   * que importa, el detalle es opcional. Expandido ocupaba media
   * pantalla y dejaba el formulario sin aire.
   */
  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const years = useMemo(() => getYears(), []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDefect<K extends keyof DefectReport>(
    key: K,
    value: DefectReport[K]
  ) {
    setDefects((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Las fotos se ACUMULAN, no se reemplazan.
   *
   * En el celular la gente suele elegirlas de una en una. Con la
   * versión anterior cada selección borraba la anterior y nunca se
   * llegaba al mínimo de tres, sin que quedara claro por qué.
   */
  function addPhotos(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);

    setPhotos((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const nuevas = incoming.filter((f) => !seen.has(`${f.name}:${f.size}`));
      return [...prev, ...nuevas].slice(0, 24);
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  /** Inserta el emoji donde está el cursor, no al final. */
  function insertEmoji(emoji: string) {
    const el = descriptionRef.current;
    if (!el) {
      set("description", form.description + emoji);
      return;
    }

    const start = el.selectionStart ?? form.description.length;
    const end = el.selectionEnd ?? start;
    const next =
      form.description.slice(0, start) + emoji + form.description.slice(end);

    set("description", next.slice(0, DESCRIPTION_MAX));

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  const resolvedMake =
    form.make === OTHER_MAKE ? form.otherMake.trim() : form.make;

  const resolvedCity =
    form.city === OTHER_CITY ? form.otherCity.trim() : form.city;

  /**
   * La familia decide qué se pregunta.
   *
   * Preguntarle a una moto si el aire acondicionado enfría no sólo
   * sobra: hace que quien la publica dude de que el sitio sepa de
   * motos, y eso pesa más que el campo de más.
   */
  const clase = getVehicleClass(form.bodyType as BodyType);
  const unidadUso = getUsageUnit(clase);
  const casillasVisibles = DEFECTS_BY_CLASS[clase];

  /**
   * La misma lista que usa la validación. Si un campo no está aquí,
   * ni se muestra ni se exige — y no puede pasar que uno sí y otro no.
   */
  const obligatorios = getRequiredFields(clase);
  const exige = (campo: string) => obligatorios.includes(campo as never);

  const draft: Listing = useMemo(
    () => ({
      id: "draft",
      year: Number(form.year) || new Date().getFullYear(),
      make: resolvedMake,
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
      description: form.description,
      city: resolvedCity,
      color: form.color,
      engineHours: form.engineHours ? Number(form.engineHours) : null,
      interiorColor: form.interiorColor,
      isClassic: Boolean(form.isClassic),
      bodyType: form.bodyType as BodyType,
      fuelType: form.fuelType as FuelType,
      transmission: form.transmission as Transmission,
    }),
    [form, resolvedMake, resolvedCity, defects, photos.length]
  );

  const result = useMemo(() => scoreListing(draft), [draft]);

  /** Nombres legibles de lo que falta, para el aviso de error. */
  function collectErrors() {
    const found: Record<string, string> = {};

    if (!form.year) found.year = t.fields.year;
    if (!resolvedMake) found.make = t.fields.make;
    if (!form.model.trim()) found.model = t.fields.model;
    /**
     * Las millas sólo se exigen donde existen.
     *
     * Antes eran obligatorias siempre: una lancha no podía publicarse
     * porque el formulario pedía un dato que esa lancha no tiene, y
     * el error señalaba un campo que ni siquiera estaba en pantalla.
     */
    if (exige("miles") && !form.miles) found.miles = t.fields.miles;

    if (exige("engineHours") && !form.engineHours) {
      found.engineHours = t.fields.engineHours;
    }
    if (exige("knownIssues") && !form.knownIssues.trim()) {
      found.knownIssues = t.fields.knownIssues;
    }
    if (!form.description.trim()) found.description = t.fields.description;
    if (photos.length < MIN_PHOTOS) found.photos = t.fields.photos;
    if (!resolvedCity) found.city = t.fields.city;
    if (!form.name.trim()) found.name = t.fields.name;

    // Un teléfono mal tecleado produce un botón de WhatsApp que no
    // lleva a ningún lado, y el vendedor nunca sabe por qué no le llaman.
    if (!normalizePhone(form.phone)) found.phone = t.fields.phone;

    /**
     * El correo pasó de opcional a obligatorio.
     *
     * Es el único respaldo del enlace de edición: sin él, quien no
     * copie el enlace de la pantalla lo pierde para siempre y su
     * única salida es escribirte para que le retires el anuncio a
     * mano. Sigue sin publicarse.
     */
    if (!form.email.trim() || !isValidEmail(form.email))
      found.email = t.fields.email;
    if (form.vin && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(form.vin))
      found.vin = t.fields.vin;
    if (!form.declaration) found.declaration = t.form.declaration.slice(0, 40);

    return found;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const found = collectErrors();
    setErrors(found);
    setSubmitError(null);

    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => {
        document
          .querySelector(".pub-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setStatus("sending");

    try {
      const photoUrls: string[] = [];

      for (const [index, file] of photos.entries()) {
        setProgress(`${index + 1} / ${photos.length}`);

        /**
         * Se reduce antes de subir.
         *
         * Una foto de celular pesa 3-5 MB. Once de esas por red móvil
         * es una subida de minutos, y cualquier microcorte la tumba
         * entera con "Failed to fetch". Reducida a 1600px pesa unos
         * 300 KB y sube en segundos, sin que se note en pantalla.
         */
        const blob = await downscaleForUpload(file);

        const body = new FormData();
        body.append("file", blob, file.name.replace(/\.\w+$/, ".jpg"));

        /**
         * Dos reintentos. En red móvil un fallo aislado es normal, y
         * volver a intentar cuesta menos que hacer que la persona
         * llene el formulario de nuevo.
         */
        let url = "";
        let lastError = "";

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              body,
            });

            if (!res.ok) {
              const detail = await res.text().catch(() => "");
              lastError = `${res.status} ${detail.slice(0, 120)}`;
              continue;
            }

            const data = await res.json();
            url = data.url;
            break;
          } catch (networkError) {
            // "Failed to fetch": no llegó al servidor. Se reintenta
            // tras una pausa que crece.
            lastError =
              networkError instanceof Error
                ? networkError.message
                : String(networkError);
            await new Promise((resolve) =>
              setTimeout(resolve, 800 * (attempt + 1))
            );
          }
        }

        if (!url) {
          throw new Error(`${t.form.uploadFailed} ${file.name} — ${lastError}`);
        }

        photoUrls.push(url);
      }

      setProgress("");

      // El guardado también se reintenta: el formulario entero se
      // pierde si falla justo aquí, después de subir las fotos.
      const res = await fetchWithRetry("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          price: Number(form.price) || null,
          photos: photoUrls,
          seller: {
            name: form.name,
            phone: normalizePhone(form.phone) ?? form.phone,
            email: form.email || null,
          },
          locale,
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(
          `${t.form.saveFailed} (${res.status}) ${detail.slice(0, 200)}`
        );
      }

      const data = await res.json();
      setSentTo(form.email.trim());
      if (data.editToken) {
        setEditLink(
          `${window.location.origin}${
            locale === "es" ? "" : "/en"
          }/editar/${data.id}?t=${data.editToken}`
        );
      }

      setStatus("sent");
    } catch (error) {
      setStatus("idle");
      setProgress("");
      /**
       * "Failed to fetch" es el mensaje del navegador cuando la
       * petición no sale. A quien está publicando su auto no le dice
       * nada; lo que necesita saber es que fue la conexión y que
       * puede reintentar sin perder lo escrito.
       */
      const raw = error instanceof Error ? error.message : "";
      const esFalloDeRed =
        raw.includes("Failed to fetch") ||
        raw.includes("NetworkError") ||
        raw.includes("Load failed");

      setSubmitError(esFalloDeRed ? t.form.networkError : raw || t.form.saveFailed);
      requestAnimationFrame(() => {
        document
          .querySelector(".pub-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  if (status === "sent") {
    return (
      <div className="pub-done">
        <h2>{t.form.successTitle}</h2>
        <p>{t.form.successBody}</p>

        {/* Que el enlace también fue por correo se dice ANTES del
            enlace mismo: quita la presión de copiarlo bien a la
            primera, que es justo cuando la gente se equivoca. */}
        {sentTo && (
          <p className="pub-sent">
            <span className="pub-sent-icon" aria-hidden>
              <MailGlyph />
            </span>
            <span>
              {t.form.editLinkSent} <strong>{sentTo}</strong>
            </span>
          </p>
        )}

        {editLink && (
          <div className="pub-link">
            <div className="pub-link-title">{t.form.editLinkTitle}</div>
            <p className="pub-link-warn">{t.form.editLinkWarn}</p>

            {/* readOnly y no disabled: así se puede seleccionar y
                copiar a mano si el botón falla. */}
            <input
              className="pub-link-input"
              value={editLink}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
            />

            <button
              type="button"
              className="hdm-btn hdm-btn--primary pub-link-copy"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(editLink);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2200);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? t.form.copied : t.form.copyLink}
            </button>
          </div>
        )}
      </div>
    );
  }

  const errorList = Object.values(errors);
  const charsLeft = DESCRIPTION_MAX - form.description.length;

  return (
    <form className="pub-form" onSubmit={handleSubmit} noValidate>
      <RingGradientDefs />

      <aside className={`pub-live${panelOpen ? " is-open" : ""}`}>
        {/* Resumen que se ve siempre en móvil. En escritorio se oculta. */}
        <button
          type="button"
          className="pub-live-toggle"
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-expanded={panelOpen}
        >
          <span className="pub-live-mini">
            <strong>{result.score}</strong>
            <span>{dict.levels[result.levelKey]}</span>
          </span>

          <span className="pub-live-dots">
            {(
              ["mechanical", "legal", "electrical", "cosmetic"] as const
            ).map((key) => (
              <span
                key={key}
                className="pub-live-dot"
                style={{ "--v": result.categories[key] } as React.CSSProperties}
                aria-hidden
              />
            ))}
          </span>

          <span className="pub-live-chevron" aria-hidden>
            ▾
          </span>
        </button>

        <div className="pub-live-body">
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

        <CategoryGrid dict={dict} categories={result.categories} compact />

        <div className="pub-live-conf">
          <div className="pub-live-conf-head">
            <span>{t.score.confidence}</span>
            <strong>
              {t.score[result.confidenceLevel]} · {result.confidence}
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
        </div>
      </aside>

      <div className="pub-fields">
        {/* ---------- El vehículo ---------- */}
        <fieldset className="pub-step">
          <legend>
            <IconVehicle className="pub-group-icon" />
            {t.steps.vehicle}
          </legend>

          {/*
            Lo primero que se pregunta, y solo en su renglón.

            Estaba al final y comprimido en una fila de tres, así que
            en el celular pasaba desapercibido. Pero además el orden
            estaba al revés: uno decide que vende una lancha ANTES de
            saber su marca, y de esta respuesta depende qué preguntas
            aparecen después.
          */}
          <Field label={t.fields.bodyType} help={t.fields.bodyTypeHelp}>
            <select
              className="pub-select-lead"
              value={form.bodyType}
              onChange={(e) => set("bodyType", e.target.value)}
            >
              {BODY_TYPES.map((option) => (
                <option key={option} value={option}>
                  {t.bodyTypes[option]}
                </option>
              ))}
            </select>
          </Field>

          <div className="pub-row">
            <Field label={t.fields.year} error={errors.year && t.form.required}>
              <select
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              >
                <option value="">{t.fields.selectPlaceholder}</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t.fields.make}
              help={t.fields.makeHelp}
              error={errors.make && t.form.required}
            >
              <select
                value={form.make}
                onChange={(e) => set("make", e.target.value)}
              >
                <option value="">{t.fields.selectPlaceholder}</option>
                {MAKES.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
                <option value={OTHER_MAKE}>{t.fields.otherMake}</option>
              </select>
            </Field>
          </div>

          {form.make === OTHER_MAKE && (
            <Field label={t.fields.otherMakeLabel}>
              <input
                value={form.otherMake}
                onChange={(e) => set("otherMake", e.target.value)}
              />
            </Field>
          )}

          <Field label={t.fields.model} error={errors.model && t.form.required}>
            <input
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Silverado 1500, Civic EX, F-150…"
            />
          </Field>

          <div className="pub-row">
            <Field label={t.fields.color}>
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
            </Field>

            {hasInterior(clase) && (
              <Field label={t.fields.interiorColor}>
                <select
                  value={form.interiorColor}
                  onChange={(e) => set("interiorColor", e.target.value)}
                >
                  {COLORS.map((option) => (
                    <option key={option} value={option}>
                      {t.colors[option]}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label={t.fields.fuelType}>
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
            </Field>
          </div>

          <Field label={t.fields.transmission}>
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
          </Field>

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

          <Field
            label={t.fields.city}
            help={t.fields.cityHelp}
            error={errors.city && t.form.required}
          >
            <select
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            >
              <option value="">{t.fields.selectPlaceholder}</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
              <option value={OTHER_CITY}>{t.fields.otherCity}</option>
            </select>
          </Field>

          {form.city === OTHER_CITY && (
            <Field label={t.fields.otherCityLabel}>
              <input
                value={form.otherCity}
                onChange={(e) => set("otherCity", e.target.value)}
              />
            </Field>
          )}

          <div className="pub-row">
            {/* Millas u horas: lo que corresponda a la familia. Un
                comprador de lancha pregunta las horas antes que nada,
                y ponerle "millas" delata que el sitio no sabe de eso. */}
            {exige("miles") && (
              <Field
                label={t.fields.miles}
                help={t.fields.milesHelp}
                error={errors.miles && t.form.required}
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_MILES}
                  value={form.miles}
                  placeholder="87,430"
                  onChange={(e) => set("miles", e.target.value)}
                />
              </Field>
            )}

            {(exige("engineHours") || unidadUso === "both") && (
              <Field
                label={t.fields.engineHours}
                help={t.fields.engineHoursHelp}
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={9999}
                  value={form.engineHours}
                  placeholder="240"
                  onChange={(e) => set("engineHours", e.target.value)}
                />
              </Field>
            )}

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
          <legend>
            <IconHistory className="pub-group-icon" />
            {t.steps.history}
          </legend>

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
              <select
                value={form.owners}
                onChange={(e) => set("owners", e.target.value)}
              >
                {OWNER_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n === 5 ? `${n}+` : n}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t.fields.accidents}>
              <select
                value={form.reportedAccidents}
                onChange={(e) => set("reportedAccidents", e.target.value)}
              >
                {ACCIDENT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n === 3 ? `${n}+` : n}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        {/* ---------- Estado real, por categoría ---------- */}
        {GROUPS.map((group) => (
          <fieldset className="pub-step pub-group" key={group.key}>
            <legend>
              <group.Icon className="pub-group-icon" />
              {dict.categories[group.key]}
            </legend>

            {group.positive.length > 0 && (
              <div className="pub-checks">
                {group.positive
              .filter((key) => casillasVisibles.includes(key))
              .map((key) => (
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

            <div className="pub-checks pub-checks--negative">
              {group.negative
                .filter((key) => casillasVisibles.includes(key))
                .map((key) => (
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
              <>
                {/*
                  Las llantas dependen de la familia: una lancha no
                  tiene.
                */}
                {exige("tires") && (
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
                )}

                {/*
                  Los problemas conocidos NO dependen de la familia:
                  toda cosa con motor puede tener algo que declarar.

                  Estaban dentro de la condición de las llantas, así
                  que en una moto de agua desaparecían — pero la
                  validación los seguía exigiendo. El formulario pedía
                  un campo que no estaba en pantalla.
                */}
                {exige("knownIssues") && (
                <Field
                  label={t.fields.knownIssues}
                  help={t.fields.knownIssuesHelp}
                  error={errors.knownIssues && t.form.required}
                >
                  <textarea
                    rows={3}
                    value={form.knownIssues}
                    onChange={(e) => set("knownIssues", e.target.value)}
                  />
                </Field>
                )}
              </>
            )}
          </fieldset>
        ))}

        {/* ---------- Tu anuncio ---------- */}
        <fieldset className="pub-step">
          <legend>
            <IconWrite className="pub-group-icon" />
            {t.fields.description}
          </legend>

          <Field
            label={t.fields.description}
            help={t.fields.descriptionHelp}
            error={errors.description && t.form.required}
          >
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
              rows={9}
              maxLength={DESCRIPTION_MAX}
              value={form.description}
              placeholder={t.fields.descriptionPlaceholder}
              onChange={(e) => set("description", e.target.value)}
            />

            <span
              className={`pub-chars${charsLeft < 80 ? " is-low" : ""}`}
            >
              {charsLeft} {t.form.charsLeft}
            </span>
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
            <label className="pub-file">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  addPhotos(e.target.files);
                  // Permite volver a elegir el mismo archivo si se quitó.
                  e.target.value = "";
                }}
              />
              <span>{t.form.addPhotos}</span>
            </label>

            {photos.length > 0 && (
              <>
                <span
                  className={`pub-count${
                    photos.length < MIN_PHOTOS ? " is-low" : ""
                  }`}
                >
                  {photos.length} {t.form.photosSelected}
                </span>

                <ul className="pub-photos">
                  {photos.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removePhoto(index)}>
                        {t.form.removePhoto}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Field>
        </fieldset>

        {/* ---------- Contacto ---------- */}
        <fieldset className="pub-step">
          <legend>
            <IconSeller className="pub-group-icon" />
            {t.steps.contact}
          </legend>

          <div className="pub-row">
            <Field label={t.fields.name} error={errors.name && t.form.required}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>

            <Field
              label={t.fields.phone}
              error={errors.phone && t.form.invalidPhone}
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
          </div>

          <Field
            label={t.fields.email}
            help={t.fields.emailHelp}
            error={errors.email && t.form.invalidEmail}
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
        </fieldset>

        <label
          className={`pub-declaration${errors.declaration ? " has-error" : ""}`}
        >
          <input
            type="checkbox"
            checked={form.declaration}
            onChange={(e) => set("declaration", e.target.checked)}
          />
          <span>{t.form.declaration}</span>
        </label>

        {/* El aviso nombra lo que falta. "Revisa los campos marcados"
            obliga a recorrer el formulario entero adivinando. */}
        {errorList.length > 0 && (
          <div className="pub-error" role="alert">
            <strong>{t.form.errorTitle}</strong>
            <span>{t.form.errorBody}</span>
            <ul>
              {errorList.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="pub-error" role="alert">
            <strong>{t.form.sendErrorTitle}</strong>
            <span className="pub-error-detail">{submitError}</span>
          </div>
        )}

        <button
          type="submit"
          className="hdm-btn hdm-btn--primary pub-submit"
          disabled={status === "sending"}
        >
          {status === "sending"
            ? progress
              ? `${t.form.uploading} ${progress}`
              : t.form.submitting
            : t.form.submit}
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
