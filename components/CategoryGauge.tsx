"use client";

import { useEffect, useRef } from "react";

/**
 * Medidor tipo velocímetro para una categoría.
 *
 * Semicírculo en vez de anillo completo, a propósito: el anillo es la
 * calificación general y debe seguir siendo la figura dominante. Los
 * medidores son su desglose, y se leen distinto de un vistazo.
 *
 * El arco va de 0 a 100 sobre 180 grados, con la aguja apuntando al
 * valor. Se anima al entrar en pantalla.
 */

const R = 42;
const CX = 50;
const CY = 52;
/** Media circunferencia: πr */
const ARC = Math.PI * R;

function polar(value: number) {
  // 0 → 180° (izquierda), 100 → 0° (derecha)
  const angle = Math.PI * (1 - value / 100);
  return {
    x: CX + R * Math.cos(angle),
    y: CY - R * Math.sin(angle),
  };
}

export default function CategoryGauge({
  value,
  label,
  icon,
  caption,
}: {
  value: number;
  label: string;
  /** Emoji o carácter corto. Se muestra dentro del arco. */
  icon: string;
  caption?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const needle = polar(value);

  /**
   * El color del arco cambia con el valor. No es decoración: es el
   * dato que se lee primero, antes que el número.
   */
  const tone =
    value >= 85 ? "good" : value >= 70 ? "ok" : value >= 55 ? "warn" : "bad";

  return (
    <figure className={`gauge gauge--${tone}`}>
      <svg
        ref={ref}
        viewBox="0 0 100 64"
        role="img"
        aria-label={`${label}: ${value} de 100`}
        className="gauge-svg"
        style={{ "--value": value } as React.CSSProperties}
      >
        {/* Fondo del arco */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          className="gauge-track"
        />

        {/* Arco relleno hasta el valor */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          className="gauge-fill"
          strokeDasharray={ARC}
        />

        {/* Aguja */}
        <line
          x1={CX}
          y1={CY}
          x2={needle.x}
          y2={needle.y}
          className="gauge-needle"
        />
        <circle cx={CX} cy={CY} r="4" className="gauge-pin" />

        <text x={CX} y="30" textAnchor="middle" className="gauge-icon">
          {icon}
        </text>
      </svg>

      <figcaption>
        <span className="gauge-value">{value}</span>
        <span className="gauge-label">{label}</span>
        {caption && <span className="gauge-caption">{caption}</span>}
      </figcaption>
    </figure>
  );
}
