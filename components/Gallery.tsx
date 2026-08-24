"use client";

import { useEffect, useRef, useState } from "react";
import { fill, type Dictionary } from "@/i18n/dictionaries";

/**
 * Carrusel + miniaturas + lightbox.
 * Antes estaba duplicado entre la home y la ficha; ahora es uno solo.
 * `size` cambia la altura del escenario, no el comportamiento.
 */
export default function Gallery({
  images,
  alt,
  dict,
  sold = false,
  size = "panel",
}: {
  images: string[];
  alt: string;
  dict: Dictionary;
  sold?: boolean;
  size?: "panel" | "detail";
}) {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const hasMultiple = images.length > 1;
  const canZoom = !sold;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  /* Mantiene la miniatura activa a la vista */
  useEffect(() => {
    const active = thumbsRef.current?.querySelector<HTMLElement>(
      `[data-thumb="${index}"]`
    );
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  /* Escape cierra y se bloquea el scroll de fondo */
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (!hasMultiple) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, hasMultiple, images.length]);

  function slideTo(next: number) {
    setIsFading(true);
    window.setTimeout(() => {
      setIndex(next);
      setIsFading(false);
    }, 140);
  }

  function goPrev() {
    slideTo(index === 0 ? images.length - 1 : index - 1);
  }

  function goNext() {
    slideTo(index === images.length - 1 ? 0 : index + 1);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) goNext();
    else if (delta < -40) goPrev();
    touchStartX.current = null;
  }

  return (
    <>
      <div
        className={`hdm-stage hdm-stage--${size}${isFading ? " is-fading" : ""}${
          sold ? " is-sold" : ""
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[index]}
          alt={alt}
          onClick={() => canZoom && setIsLightboxOpen(true)}
        />

        {sold && <span className="hdm-badge-sold">{dict.vehicle.soldBadge}</span>}

        {hasMultiple && !sold && (
          <>
            <button
              onClick={goPrev}
              aria-label={dict.gallery.prev}
              className="hdm-arrow hdm-arrow--prev"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              aria-label={dict.gallery.next}
              className="hdm-arrow hdm-arrow--next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && !sold && (
        <div className="hdm-thumbs" ref={thumbsRef}>
          {images.map((img, i) => (
            <button
              key={i}
              data-thumb={i}
              onClick={() => i !== index && slideTo(i)}
              aria-label={fill(dict.gallery.go, { n: i + 1 })}
              aria-current={i === index || undefined}
              className={`hdm-thumb${i === index ? " is-active" : ""}`}
            >
              <img src={img} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <div
          className="hdm-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label={dict.gallery.close}
            className="hdm-lightbox-close"
          >
            ×
          </button>

          {hasMultiple && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label={dict.gallery.prev}
                className="hdm-arrow hdm-arrow--prev hdm-arrow--light"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label={dict.gallery.next}
                className="hdm-arrow hdm-arrow--next hdm-arrow--light"
              >
                ›
              </button>
            </>
          )}

          <img src={images[index]} alt={alt} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
