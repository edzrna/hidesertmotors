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
  Icon,
  caption,
}: {
  value: number;
  label: string;
  /** Icono propio del sitio. Se dibuja dentro del arco. */
  Icon: (props: { className?: string }) => React.JSX.Element;
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
   * El arco va en la gama de la marca: naranja profundo abajo, ámbar
   * claro arriba. El verde desentonaba con todo lo demás.
   *
   * El tono sigue diciendo algo: un 95 se ve dorado y un 60 se ve
   * naranja quemado, así que el valor se lee sin leer el número. Y el
   * rojo se conserva sólo para lo grave —debajo de 50— porque un auto
   * con la transmisión patinando debe alarmar, no combinar.
   */
  const tone = value < 50 ? "bad" : "brand";

  /** Cada medidor necesita su propio id o comparten el gradiente. */
  const gradientId = `gauge-${label.replace(/\W+/g, "")}-${value}`;

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

        <defs>
          {/* El gradiente se inclina con el valor: mientras más alto,
              más peso tiene el ámbar claro. */}
          <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gauge-from)" />
            <stop
              offset={`${Math.max(30, Math.min(95, value))}%`}
              stopColor="var(--gauge-to)"
            />
          </linearGradient>
        </defs>

        {/* Arco relleno hasta el valor */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          className="gauge-fill"
          stroke={`url(#${gradientId})`}
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

        {/* El icono va dentro del arco, escalado al viewBox del medidor. */}
        <g transform="translate(38 14) scale(1)" className="gauge-icon">
          <Icon />
        </g>
      </svg>

      <figcaption>
        <span className="gauge-value">{value}</span>
        <span className="gauge-label">{label}</span>
        {caption && <span className="gauge-caption">{caption}</span>}
      </figcaption>
    </figure>
  );
}
