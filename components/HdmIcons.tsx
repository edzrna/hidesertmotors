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

/**
 * Publicar: una llave de auto con un signo de más.
 *
 * No es un "+" genérico ni una cámara: la acción es entregar tu auto
 * al tablero, y la llave es el objeto que lo representa.
 */
export function IconPublish({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="8" cy="8.5" r="4" />
      <circle cx="8" cy="8.5" r="1.2" />
      <path d="M11 11.4 17.5 18" />
      <path d="m15.2 15.7 1.8 1.8" />
      <path d="M17.5 18v2.2h2.2" />
      <path d="M18.5 4.5v4M16.5 6.5h4" />
    </svg>
  );
}

/** Candado: lo que ya no se puede cambiar. */
export function IconLock({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15" r="1.3" />
      <path d="M12 16.3v1.4" />
    </svg>
  );
}

/** Cámara: la sección de fotos. */
export function IconCamera({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3.5 8.5h3l1.4-2.2h7.2L16.5 8.5h4a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.6" r="3.4" />
    </svg>
  );
}

/** Persona: los datos del vendedor. */
export function IconSeller({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
    </svg>
  );
}

/** Volante: la ficha del vehículo. */
export function IconVehicle({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 3.5v5.9M4.2 14.2l5.4-1.5M19.8 14.2l-5.4-1.5" />
    </svg>
  );
}

/** Historial: reloj con documento. */
export function IconHistory({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5v3.6h3.6" />
      <path d="M12 7.6V12l3 1.8" />
    </svg>
  );
}

/** Escritura: la descripción del anuncio. */
export function IconWrite({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0-3-3L5.2 17v3" />
      <path d="M14.6 7.4l3 3" />
    </svg>
  );
}
