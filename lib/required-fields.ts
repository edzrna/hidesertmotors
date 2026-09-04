import type { VehicleClass } from "@/lib/vehicle-class";
import { getUsageUnit, hasTires } from "@/lib/vehicle-class";

/**
 * QUÉ SE EXIGE EN CADA FAMILIA — una sola lista.
 *
 * Este archivo existe por un error concreto: los "problemas
 * conocidos" quedaron dentro de la condición que ocultaba las
 * llantas, así que en una moto de agua desaparecían de la pantalla
 * mientras la validación los seguía exigiendo. El formulario pedía un
 * campo que no existía, y el aviso señalaba algo que no se podía
 * llenar.
 *
 * La causa de fondo no era ese descuido: era que "qué se muestra" y
 * "qué se exige" vivían en dos lugares distintos y nada obligaba a
 * que coincidieran.
 *
 * Aquí se declara una vez. El formulario pregunta a esta lista qué
 * mostrar, la validación pregunta a la misma lista qué exigir, y
 * desalinearlas deja de ser posible.
 */

export type CampoObligatorio =
  | "year"
  | "make"
  | "model"
  | "miles"
  | "engineHours"
  | "tires"
  | "knownIssues"
  | "description"
  | "photos"
  | "city"
  | "name"
  | "phone"
  | "email"
  | "declaration";

/** Los que se piden siempre, sea un sedán o un remolque. */
const SIEMPRE: CampoObligatorio[] = [
  "year",
  "make",
  "model",
  "description",
  "photos",
  "city",
  "name",
  "phone",
  "email",
  "declaration",
];

export function getRequiredFields(
  vehicleClass: VehicleClass
): CampoObligatorio[] {
  const campos = [...SIEMPRE];

  const unidad = getUsageUnit(vehicleClass);

  // "both" (cuatrimotos) pide millas; las horas quedan opcionales
  // porque no toda trae horómetro.
  if (unidad === "miles" || unidad === "both") campos.push("miles");
  if (unidad === "hours") campos.push("engineHours");

  if (hasTires(vehicleClass)) campos.push("tires");

  /**
   * Los problemas conocidos aplican a todo lo que tiene motor. Un
   * remolque no declara fallas mecánicas, pero cualquier otra cosa
   * sí — y ese fue justo el campo que se perdió.
   */
  if (vehicleClass !== "trailer") campos.push("knownIssues");

  return campos;
}

export function isRequired(
  campo: CampoObligatorio,
  vehicleClass: VehicleClass
) {
  return getRequiredFields(vehicleClass).includes(campo);
}
