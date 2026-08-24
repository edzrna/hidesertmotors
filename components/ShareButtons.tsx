"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  WhatsAppGlyph,
  FacebookGlyph,
  XGlyph,
  TelegramGlyph,
  MessengerGlyph,
  LinkGlyph,
} from "./Icons";

/**
 * `variant="full"`  → botones con texto (panel destacado y ficha)
 * `variant="mini"`  → solo iconos (tarjetas del inventario)
 *
 * El aviso de "link copiado" lo maneja el padre a través de `onNotify`,
 * porque en la home se muestra como toast global y en la ficha va inline.
 */
export default function ShareButtons({
  url,
  text,
  dict,
  variant = "full",
  extended = false,
  onNotify,
}: {
  url: string;
  text: string;
  dict: Dictionary;
  variant?: "full" | "mini";
  /** Agrega Telegram y Messenger (solo en la ficha, donde hay espacio) */
  extended?: boolean;
  onNotify?: (message: string) => void;
}) {
  const [inlineMessage, setInlineMessage] = useState("");
  const isMini = variant === "mini";

  function notify(message: string) {
    if (onNotify) {
      onNotify(message);
      return;
    }
    setInlineMessage(message);
    window.setTimeout(() => setInlineMessage(""), 2200);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      notify(dict.share.copyShort);
    } catch {
      notify(dict.share.copyError);
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <>
      {!isMini && <div className="hdm-share-title">{dict.share.title}</div>}

      <div className={isMini ? "hdm-share-mini" : "hdm-share-grid"}>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noreferrer"
          className="hdm-share-btn"
          aria-label={isMini ? dict.share.viaWhatsapp : undefined}
        >
          <WhatsAppGlyph />
          {!isMini && <span>WhatsApp</span>}
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className="hdm-share-btn"
          aria-label={isMini ? dict.share.viaFacebook : undefined}
        >
          <FacebookGlyph />
          {!isMini && <span>Facebook</span>}
        </a>

        {!isMini && (
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="hdm-share-btn"
          >
            <XGlyph />
            <span>X</span>
          </a>
        )}

        {!isMini && extended && (
          <>
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
              target="_blank"
              rel="noreferrer"
              className="hdm-share-btn"
            >
              <TelegramGlyph />
              <span>Telegram</span>
            </a>

            <a
              href={`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=140586622674265&redirect_uri=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="hdm-share-btn"
            >
              <MessengerGlyph />
              <span>Messenger</span>
            </a>
          </>
        )}

        <button
          onClick={copyLink}
          className="hdm-share-btn"
          aria-label={isMini ? dict.share.viaLink : undefined}
        >
          <LinkGlyph />
          {!isMini && <span>{dict.share.copy}</span>}
        </button>
      </div>

      {inlineMessage && (
        <p className="hdm-share-note" role="status">
          {inlineMessage}
        </p>
      )}
    </>
  );
}
