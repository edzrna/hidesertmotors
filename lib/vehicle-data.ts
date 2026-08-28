import type {
  BodyType,
  FuelType,
  Transmission,
  DefectReport,
  TireCondition,
  TitleStatus,
} from "@/lib/listing-score";

/**
 * Catálogo para los desplegables del formulario.
 *
 * Escribir la marca a mano produce "Chevy", "chevrolet", "Chevrolét" y
 * "Chevorlet" para el mismo auto, y entonces el filtro por marca del
 * inventario deja de servir. Con lista cerrada eso no pasa.
 *
 * Queda "Otra" como salida para lo que no esté aquí, porque una lista
 * cerrada sin escape bloquea al vendedor de un auto legítimo.
 */

export const MAKES = [
  "Acura",
  "Alfa Romeo",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Fiat",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mercury",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Pontiac",
  "Porsche",
  "Ram",
  "Rivian",
  "Saturn",
  "Scion",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

export const OTHER_MAKE = "__other__";

/** Del año próximo hacia atrás. 1980 cubre de sobra lo que se vende aquí. */
export function getYears(currentYear = new Date().getFullYear()) {
  const years: number[] = [];
  for (let year = currentYear + 1; year >= 1980; year--) years.push(year);
  return years;
}

/** Rangos de millaje: elegir de una lista es más rápido que teclear. */
export const MILE_STEPS = [
  0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
  120000, 140000, 160000, 180000, 200000,
];

export const OWNER_OPTIONS = [1, 2, 3, 4, 5];
export const ACCIDENT_OPTIONS = [0, 1, 2, 3];

/** Atajos de emoji para la descripción. */
export const QUICK_EMOJI = [
  "🚗",
  "🔥",
  "✅",
  "⚠️",
  "🔧",
  "❄️",
  "🛞",
  "⛽",
  "📄",
  "💰",
  "📍",
  "📞",
];

export const DESCRIPTION_MAX = 1200;


/* ============================================================
   OPCIONES COMPARTIDAS

   Vivían dentro de ListingForm. Ahora las usan también el
   diagnóstico y la edición: duplicarlas garantizaba que un día
   se desincronizaran.
   ============================================================ */

export const TITLE_OPTIONS: TitleStatus[] = [
  "clean",
  "clean_lien",
  "rebuilt",
  "salvage",
  "no_title",
];

export const TIRE_OPTIONS: TireCondition[] = [
  "new",
  "good",
  "worn",
  "needs_replacing",
];

export const EMPTY_DEFECTS: DefectReport = {
  checkEngineOn: false,
  otherWarningLights: false,
  startsEveryTime: true,
  transmissionSlips: false,
  overheats: false,
  leaksFluid: false,
  unusualNoises: false,
  acWorks: true,
  heatWorks: true,
  allWindowsWork: true,
  brakesFeelNormal: true,
  hasRust: false,
  hasDents: false,
  glassCracked: false,
  interiorTorn: false,
  smokedIn: false,
  tires: "good",
};


/** Carrocerías, en el orden en que la gente las busca por aquí. */
export const BODY_TYPES: BodyType[] = [
  "suv",
  "truck",
  "sedan",
  "coupe",
  "hatchback",
  "van",
  "wagon",
  "convertible",
  "offroad",
];

export const FUEL_TYPES: FuelType[] = [
  "gasoline",
  "diesel",
  "hybrid",
  "plugin_hybrid",
  "electric",
];

export const TRANSMISSIONS: Transmission[] = ["automatic", "manual"];
