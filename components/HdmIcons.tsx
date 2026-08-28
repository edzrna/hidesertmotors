/**
 * Iconos propios del sitio.
 *
 * Antes eran emojis. Un emoji se dibuja distinto en cada sistema —
 * ⚙️ es plano en Android y con volumen en iOS — así que la marca
 * cambiaba de aspecto según el teléfono. Estos son SVG, y usan
 * `currentColor` para heredar el color de su contenedor.
 *
 * Trazo de 1.6 y esquinas redondeadas: el mismo lenguaje de las
 * placas de Axel.
 */

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Mecánica: pistón y biela, no un engrane genérico. */
export function IconMechanical({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="7.5" y="3" width="9" height="6" rx="1.6" />
      <path d="M9.5 9v1.5M14.5 9v1.5" />
      <path d="M12 10.5v4" />
      <circle cx="12" cy="17" r="3.2" />
      <path d="M12 14.5v-.2" />
      <path d="M9.6 5.2h4.8M9.6 7h4.8" />
    </svg>
  );
}

/** Legal: documento con sello, que es lo que de verdad importa. */
export function IconLegal({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 3.5h7.5L18 8v9.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z" />
      <path d="M13.5 3.5V8H18" />
      <circle cx="12" cy="14" r="2.6" />
      <path d="M10.6 16.2l-.6 2.3 2-1 2 1-.6-2.3" />
    </svg>
  );
}

/** Eléctrica: rayo dentro de un circuito. */
export function IconElectrical({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M13 3 7 13h4l-1 8 7-11h-4l1-7Z" />
      <path d="M3.5 8h2M3.5 12h1.5M18.5 12h2M19 16h1.5" />
    </svg>
  );
}

/** Estética: carrocería con brillo. */
export function IconCosmetic({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3.5 15v-2.2l2-4.6A2 2 0 0 1 7.3 7h7.4a2 2 0 0 1 1.8 1.2l2 4.6V15" />
      <path d="M3.5 15h17M6 15v2M18 15v2" />
      <path d="M5.5 12h13" />
      <path d="M20 4.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3Z" />
    </svg>
  );
}

/** Escudo con paloma: lo verificado. */
export function IconVerified({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 3l7 2.6v5.6c0 4-2.9 7.6-7 8.8-4.1-1.2-7-4.8-7-8.8V5.6L12 3Z" />
      <path d="M9 11.8l2.1 2.1 4-4.2" />
    </svg>
  );
}

/** Bandera de advertencia. */
export function IconFlag({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 21V4" />
      <path d="M6 4.5h9.5l-1.6 3.2 1.6 3.3H6" />
    </svg>
  );
}

/** Odómetro: el medidor del sitio, en pequeño. */
export function IconGauge({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="M12 16l4.2-4.6" />
      <circle cx="12" cy="16" r="1.4" />
      <path d="M4 16h1.6M18.4 16H20M6.3 9.6l1.1 1.1M17.7 9.6l-1.1 1.1M12 6v1.6" />
    </svg>
  );
}

/** Marcador de ubicación. */
export function IconPin({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

/** Reloj: vigencia del anuncio. */
export function IconClock({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3 1.8" />
    </svg>
  );
}
