"use client";

import { useState } from "react";
import type { LegalDictionary } from "@/i18n/legal";

const REASONS = [
  "fraud",
  "false_info",
  "stolen",
  "dealer",
  "sold",
  "offensive",
  "other",
] as const;

/**
 * Reportar un anuncio.
 *
 * Discreto a propósito: es un enlace de texto al pie de la ficha, no
 * un botón llamativo. Quien lo necesita lo busca; el resto no debería
 * verse invitado a usarlo.
 *
 * No pide identificación. Exigir datos para reportar un auto robado
 * es una forma de que nadie lo reporte.
 */
export default function ReportButton({
  listingId,
  t,
}: {
  listingId: string;
  t: LegalDictionary;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!reason) return setError(t.report.errorReason);
    if (detail.trim().length < 5) return setError(t.report.errorDetail);

    setStatus("sending");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason, detail, contact }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError(t.report.errorSend);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="report-open"
        onClick={() => setOpen(true)}
      >
        {t.report.button}
      </button>
    );
  }

  if (status === "sent") {
    return (
      <div className="report-box report-box--done" role="status">
        <strong>{t.report.sentTitle}</strong>
        <p>{t.report.sentBody}</p>
      </div>
    );
  }

  return (
    <form className="report-box" onSubmit={handleSubmit}>
      <div className="report-head">
        <strong>{t.report.title}</strong>
        <button type="button" onClick={() => setOpen(false)}>
          {t.report.cancel}
        </button>
      </div>

      <p className="report-lead">{t.report.lead}</p>

      <label className="pub-field">
        <span className="pub-label">{t.report.reasonLabel}</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">—</option>
          {REASONS.map((key) => (
            <option key={key} value={key}>
              {t.report.reasons[key]}
            </option>
          ))}
        </select>
      </label>

      <label className="pub-field">
        <span className="pub-label">{t.report.detailLabel}</span>
        <textarea
          rows={4}
          maxLength={1000}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <span className="pub-help">{t.report.detailHelp}</span>
      </label>

      <label className="pub-field">
        <span className="pub-label">{t.report.contactLabel}</span>
        <input value={contact} onChange={(e) => setContact(e.target.value)} />
        <span className="pub-help">{t.report.contactHelp}</span>
      </label>

      {error && (
        <div className="pub-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="hdm-btn hdm-btn--ghost report-send"
        disabled={status === "sending"}
      >
        {status === "sending" ? t.report.sending : t.report.submit}
      </button>
    </form>
  );
}
