import type { BodyType } from "@/lib/listing-score";

/**
 * Familias de vehículo.
 *
 * El formulario de autos no sirve para todo. A una moto de agua le
 * pregunta si el aire acondicionado enfría; a una moto, si las
 * ventanas suben. Peor: le resta puntos por no tener smog cuando en
 * California las motocicletas y las embarcaciones están exentas.
 *
 * Una calificación que castiga por no cumplir un trámite que la ley
 * no exige no es estricta, es falsa.
 *
 * En el Alto Desierto esto no es un caso raro: aquí se mueven tantas
 * cuatrimotos, jetskis y motos como sedanes.
 */
export type VehicleClass =
  | "car"
  | "motorcycle"
  | "powersports"
  | "marine"
  | "rv"
  | "trailer";

export function getVehicleClass(bodyType: BodyType): VehicleClass {
  switch (bodyType) {
    case "motorcycle":
      return "motorcycle";
    case "atv":
      return "powersports";
    case "boat":
    case "jetski":
      return "marine";
    case "motorhome":
    case "travel_trailer":
    case "camper":
      return "rv";
    case "trailer":
      return "trailer";
    default:
      return "car";
  }
}

/* ============================================================
   QUÉ APLICA A CADA FAMILIA
   ============================================================ */

/**
 * Cómo se mide el uso.
 *
 * Millas en lo que rueda por carretera; horas de motor en lo que no.
 * Un comprador de lancha pregunta las horas antes que nada, y ponerle
 * "millas" a una jetski delata que el sitio no entiende de eso.
 */
export function getUsageUnit(vehicleClass: VehicleClass): "miles" | "hours" | "none" {
  if (vehicleClass === "marine" || vehicleClass === "powersports") return "hours";
  if (vehicleClass === "trailer") return "none";
  return "miles";
}

/**
 * Smog: en California lo exigen los autos y las casas rodantes de
 * gasolina. Motocicletas, embarcaciones, cuatrimotos y remolques
 * están exentos.
 */
export function needsSmog(vehicleClass: VehicleClass) {
  return vehicleClass === "car" || vehicleClass === "rv";
}

/** Un remolque no tiene motor: la categoría mecánica no aplica. */
export function hasEngine(vehicleClass: VehicleClass) {
  return vehicleClass !== "trailer";
}

/**
 * Qué casillas de estado se muestran.
 *
 * Preguntar por el aire acondicionado de una moto no sólo sobra:
 * hace que quien la publica desconfíe de que el sitio sepa de motos.
 */
export const DEFECTS_BY_CLASS: Record<VehicleClass, string[]> = {
  car: [
    "startsEveryTime",
    "brakesFeelNormal",
    "acWorks",
    "heatWorks",
    "allWindowsWork",
    "checkEngineOn",
    "otherWarningLights",
    "transmissionSlips",
    "overheats",
    "leaksFluid",
    "unusualNoises",
    "hasRust",
    "hasDents",
    "glassCracked",
    "interiorTorn",
    "smokedIn",
  ],

  motorcycle: [
    "startsEveryTime",
    "brakesFeelNormal",
    "checkEngineOn",
    "overheats",
    "leaksFluid",
    "unusualNoises",
    "hasRust",
    "hasDents",
  ],

  powersports: [
    "startsEveryTime",
    "brakesFeelNormal",
    "overheats",
    "leaksFluid",
    "unusualNoises",
    "hasRust",
    "hasDents",
  ],

  marine: [
    "startsEveryTime",
    "overheats",
    "leaksFluid",
    "unusualNoises",
    "hasRust",
    "hasDents",
    "interiorTorn",
  ],

  rv: [
    "startsEveryTime",
    "brakesFeelNormal",
    "acWorks",
    "heatWorks",
    "checkEngineOn",
    "overheats",
    "leaksFluid",
    "unusualNoises",
    "hasRust",
    "hasDents",
    "interiorTorn",
    "smokedIn",
  ],

  trailer: ["brakesFeelNormal", "hasRust", "hasDents"],
};

/** Las llantas no aplican a una embarcación sin remolque. */
export function hasTires(vehicleClass: VehicleClass) {
  return vehicleClass !== "marine";
}

/** El interior sólo existe donde uno se sienta dentro. */
export function hasInterior(vehicleClass: VehicleClass) {
  return vehicleClass === "car" || vehicleClass === "rv";
}

/** La transmisión, igual: una jetski no la declara. */
export function hasTransmission(vehicleClass: VehicleClass) {
  return vehicleClass === "car" || vehicleClass === "rv";
}
