import type { LevelKey } from "@/lib/hdm";

/**
 * La cara de Axel según el nivel de la calificación.
 *
 * Es el corazón de la marca: el número lo entiende quien lo lee con
 * calma, la cara la entiende cualquiera de reojo. Axel se emociona
 * con un buen auto y se desanima con uno malo, y eso comunica más
 * rápido que "Muy buena compra".
 */

const SIZES = { sm: 44, md: 72, lg: 112 } as const;

export default function AxelFace({
  level,
  size = "md",
  label,
  className = "",
}: {
  level: LevelKey;
  size?: keyof typeof SIZES;
  /** Texto accesible. Si se omite, la imagen es decorativa. */
  label?: string;
  className?: string;
}) {
  const px = SIZES[size];

  return (
    <img
      src={`/axel/${level}.webp`}
      width={px}
      height={px}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={`axel-face axel-face--${size} ${className}`.trim()}
      loading="lazy"
    />
  );
}
