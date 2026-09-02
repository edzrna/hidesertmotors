"use client";

import { useEffect, useRef } from "react";

/**
 * Medidor de categoría, estilo tablero de auto.
 *
 * Geometría: arco de 220° con extremos redondeados, del que se revela
 * la porción correspondiente al valor. Lo que falta queda en azul
 * oscuro.
 *
 * El gradiente está fijo A LO LARGO DEL ARCO, no depende del valor.
 * Eso significa que un 40 sólo alcanza a mostrar el rojo del arranque,
 * mientras que un 95 llega hasta el ámbar del final. El color sale del
 * recorrido, no de una regla aparte — y así nunca contradice al
 * número.
 */

const CX = 130;
const CY = 132;
const R = 96;
const INICIO = 200;
const BARRIDO = 220;
const LARGO = (BARRIDO * Math.PI * R) / 180;

function punto(grados: number, radio = R) {
  const a = (grados * Math.PI) / 180;
  return { x: CX + radio * Math.cos(a), y: CY - radio * Math.sin(a) };
}

const A = punto(INICIO);
const B = punto(INICIO - BARRIDO);
const ARCO = `M ${A.x.toFixed(1)} ${A.y.toFixed(1)} A ${R} ${R} 0 1 1 ${B.x.toFixed(1)} ${B.y.toFixed(1)}`;

export default function CategoryGauge({
  value,
  label,
  Icon,
  caption,
}: {
  value: number;
  label: string;
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

  const acotado = Math.max(0, Math.min(100, value));
  const anguloAguja = INICIO - (acotado / 100) * BARRIDO;
  const punta = punto(anguloAguja, R * 0.6);

  /** Cada medidor necesita su gradiente propio o se pisan entre sí. */
  const id = `g-${label.replace(/\W+/g, "")}`;

  return (
    <figure className="gauge">
      <svg
        ref={ref}
        viewBox="0 0 260 200"
        role="img"
        aria-label={`${label}: ${value} de 100`}
        className="gauge-svg"
        style={
          {
            "--largo": LARGO.toFixed(1),
            "--relleno": ((LARGO * acotado) / 100).toFixed(1),
            "--giro": `${INICIO - anguloAguja}deg`,
          } as React.CSSProperties
        }
      >
        <defs>
          <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8392a" />
            <stop offset="42%" stopColor="#f58a1e" />
            <stop offset="100%" stopColor="#f7c948" />
          </linearGradient>
        </defs>

        {/* Lo que falta para 100 */}
        <path d={ARCO} className="gauge-track" />

        {/* Lo alcanzado */}
        <path d={ARCO} className="gauge-fill" stroke={`url(#${id})`} />

        {/* Aguja: gira desde el pivote, como en un tablero */}
        <g className="gauge-needle-group">
          <line
            x1={CX}
            y1={CY}
            x2={punta.x.toFixed(1)}
            y2={punta.y.toFixed(1)}
            className="gauge-needle"
          />
        </g>
        <circle cx={CX} cy={CY} r="11" className="gauge-pin" />

        {/* El icono va al final del arco, fuera de él: identifica la
            categoría sin competir con la aguja ni con el número. */}
        <g className="gauge-icon" transform="translate(208 18) scale(1.9)">
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
