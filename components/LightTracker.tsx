"use client";

import { useEffect } from "react";

/**
 * Mueve la fuente de luz con el cursor.
 *
 * Sólo escribe dos variables CSS en :root; toda la pintura la hacen
 * los gradientes. Así el efecto es una sola escritura por cuadro en
 * vez de recalcular estilos de varios elementos.
 *
 * En táctil no hace nada: no hay cursor que seguir, y ahí el efecto
 * ya lo da el scroll pasando por delante de la luz fija.
 *
 * La posición se interpola hacia el cursor en lugar de saltar. Una
 * luz que persigue con retraso se lee como iluminación; una que se
 * pega al puntero se lee como una linterna.
 */
export default function LightTracker() {
  useEffect(() => {
    // Un puntero grueso es dedo, no ratón.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;

    let targetX = 76;
    let targetY = 14;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    function onMove(event: PointerEvent) {
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
    }

    function tick() {
      // 0.06 da un rezago perceptible pero no perezoso.
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      root.style.setProperty("--light-x", `${currentX.toFixed(2)}%`);
      root.style.setProperty("--light-y", `${currentY.toFixed(2)}%`);

      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--light-x");
      root.style.removeProperty("--light-y");
    };
  }, []);

  return null;
}
