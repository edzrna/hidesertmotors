"use client";

import { useEffect, useRef } from "react";

/**
 * Colócalo UNA vez por página. El anillo referencia este degradado por id.
 */
export function RingGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="hdmRingGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#d88a00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HDMRing({
  score,
  label,
  small = false,
  dark = false,
}: {
  score: number;
  /** Texto accesible ya traducido, p. ej. "HDM rating: 87 out of 100" */
  label: string;
  small?: boolean;
  dark?: boolean;
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

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      className={`hdm-ring${small ? " hdm-ring--sm" : ""}${
        dark ? " hdm-ring--dark" : ""
      }`}
      style={{ "--score": score } as React.CSSProperties}
    >
      {/* El giro va en el grupo para que el número quede derecho */}
      <g className="hdm-ring-rot">
        <circle cx="50" cy="50" r="44" className="hdm-ring-track" />
        <circle cx="50" cy="50" r="44" className="hdm-ring-fill" />
      </g>
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="hdm-ring-value"
      >
        {score}
      </text>
    </svg>
  );
}
