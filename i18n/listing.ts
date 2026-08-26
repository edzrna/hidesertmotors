import type { Locale } from "@/lib/hdm";

/**
 * Textos del formulario de publicación y de las banderas.
 *
 * Igual que dictionaries.ts: sólo cadenas, nada de funciones. El
 * diccionario cruza del servidor al cliente y ahí todo tiene que ser
 * serializable.
 */

const es = {
  page: {
    kicker: "Publica tu auto",
    title: "Publica tu auto y recibe su calificación HDM",
    lede: "Llena los datos con honestidad. La calificación se calcula sola con lo que declares, y la ves cambiar mientras escribes.",
    disclaimer:
      "Hi Desert Motors es un tablero de anuncios. No compramos, vendemos ni intermediamos: el comprador trata directamente contigo. No inspeccionamos los vehículos, y la calificación se basa únicamente en lo que tú declaras aquí.",
  },

  steps: {
    vehicle: "El vehículo",
    history: "Historial y título",
    condition: "Estado real",
    docs: "Respaldo",
    contact: "Tus datos",
  },

  fields: {
    year: "Año",
    make: "Marca",
    makeHelp: "Si no está en la lista, elige \"Otra marca\".",
    model: "Modelo",
    miles: "Millas del odómetro",
    price: "Precio que pides",
    titleStatus: "Estado del título",
    owners: "¿Cuántos dueños ha tenido?",
    accidents: "Accidentes reportados",
    knownIssues: "Problemas conocidos",
    knownIssuesHelp:
      "Obligatorio. Si no tiene ninguno, escribe \"ninguno\". Un anuncio honesto vende más rápido que uno perfecto.",
    description: "Tu anuncio",
    descriptionHelp:
      "Cuéntale al comprador por qué lo vendes, qué le has hecho y cómo lo has cuidado. Puedes usar emojis y varios párrafos.",
    descriptionPlaceholder:
      "Ejemplo:\n\n🚗 Lo compré hace tres años y siempre me respondió.\n🔧 Servicio cada 5,000 millas, tengo los recibos.\n❄️ Aire acondicionado recién cargado.\n\nLo vendo porque me llegó una troca más grande para el trabajo.",
    city: "¿Dónde está el auto?",
    cityHelp:
      "Sólo la ciudad, no tu dirección. El comprador necesita saber si le queda cerca.",
    otherCity: "Otra ciudad",
    otherCityLabel: "¿Cuál ciudad?",
    otherMake: "Otra marca",
    otherMakeLabel: "¿Cuál marca?",
    selectPlaceholder: "Selecciona…",
    milesOver: "o más",
    tires: "Estado de las llantas",
    vin: "VIN (17 caracteres)",
    vinHelp:
      "Lo más valioso que puedes dar. Permite al comprador verificar todo lo demás y sube tu nivel de respaldo 30 puntos.",
    photos: "Fotos",
    photosHelp: "Mínimo 3. Con 12 o más subes tu nivel de respaldo.",
    name: "Tu nombre",
    phone: "Teléfono o WhatsApp",
    email: "Correo (no se publica)",
  },

  titleStatus: {
    clean: "Limpio",
    clean_lien: "Limpio, con gravamen por liquidar",
    rebuilt: "Reconstruido",
    salvage: "Salvage",
    no_title: "Sin título en mano",
  },

  tires: {
    new: "Nuevas",
    good: "Buenas",
    worn: "Gastadas",
    needs_replacing: "Necesitan cambio",
  },

  defects: {
    checkEngineOn: "La luz de check engine está encendida",
    otherWarningLights: "Hay otras luces de advertencia encendidas",
    startsEveryTime: "Arranca siempre, a la primera",
    transmissionSlips: "La transmisión patina o cambia raro",
    overheats: "Se sobrecalienta",
    leaksFluid: "Tira aceite u otro líquido",
    unusualNoises: "Hace ruidos raros",
    acWorks: "El aire acondicionado enfría",
    heatWorks: "La calefacción calienta",
    allWindowsWork: "Todas las ventanas suben y bajan",
    brakesFeelNormal: "Los frenos se sienten normales",
    hasRust: "Tiene óxido",
    hasDents: "Tiene golpes o rayones visibles",
    glassCracked: "Algún cristal está estrellado",
    interiorTorn: "El interior está roto o muy manchado",
    smokedIn: "Se fumaba dentro del auto",
  },

  docs: {
    hasServiceRecords: "Tengo registros de servicio",
    smogCurrent: "El smog está vigente",
    registrationCurrent: "El registro está vigente",
    hasVehicleHistoryReport: "Tengo reporte de historial (Carfax o similar)",
  },

  score: {
    title: "Calificación HDM",
    outOf: "sobre 100",
    confidence: "Nivel de respaldo",
    confidenceHelp:
      "Mide cuánto de lo que declaras se puede comprobar. No cambia la calificación del auto, pero sí la confianza del comprador.",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    liveHint: "La calificación se actualiza mientras llenas el formulario.",
    declaredBy:
      "Calificación calculada con los datos declarados por el vendedor. Hi Desert Motors no ha inspeccionado este vehículo.",
  },

  flags: {
    title: "A revisar antes de pagar",
    title_salvage: "Título Salvage",
    title_rebuilt: "Título reconstruido",
    title_lien: "Tiene gravamen por liquidar",
    title_missing: "El vendedor no tiene el título en mano",
    transmission: "La transmisión patina",
    overheating: "Se sobrecalienta",
    starting: "No siempre arranca",
    check_engine: "Check engine encendido",
    brakes: "Los frenos no se sienten normales",
    rust: "Tiene óxido",
    multiple_accidents: "Dos o más accidentes reportados",
    high_miles: "Millaje muy alto",
    no_smog: "Sin smog vigente",
  },

  form: {
    submit: "Publicar anuncio",
    submitting: "Enviando…",
    required: "Este campo es obligatorio",
    minPhotos: "Sube al menos 3 fotos",
    invalidVin: "El VIN debe tener 17 caracteres",
    invalidPhone: "Escribe 10 dígitos, por ejemplo 7606206390",
    invalidEmail: "Ese correo no parece válido",
    errorTitle: "Faltan datos",
    errorBody: "Falta llenar:",
    sendErrorTitle: "No se pudo enviar el anuncio",
    uploadFailed: "Falló la subida de una foto",
    saveFailed: "Falló el guardado del anuncio",
    uploading: "Subiendo fotos",
    charsLeft: "caracteres restantes",
    addPhotos: "Agregar fotos",
    removePhoto: "Quitar",
    photosSelected: "fotos seleccionadas",
    successTitle: "Anuncio recibido",
    successBody:
      "Lo revisamos y lo publicamos en cuanto esté listo. Te avisamos al teléfono que dejaste.",
    editLinkTitle: "Guarda este enlace",
    editLinkWarn:
      "Es la única forma de editar o retirar tu anuncio. No lo compartas con nadie y no lo pierdas: por seguridad no podemos volver a generarlo.",
    copyLink: "Copiar enlace",
    copied: "Copiado",

    edit: {
      title: "Edita tu anuncio",
      lead: "Puedes corregir el precio, las fotos, la descripción, la ubicación y tus datos de contacto.",
      lockedTitle: "Esto ya no se puede cambiar",
      lockedBody:
        "Los datos del vehículo quedaron fijos al publicar: año, marca, modelo, millas, título, dueños, accidentes y el estado que declaraste. Es lo que sostiene tu calificación HDM — si se pudieran cambiar después, no significaría nada para el comprador.",
      lockedFix:
        "¿Declaraste algo por error? Retira este anuncio y publica uno nuevo con los datos correctos.",
      save: "Guardar cambios",
      saving: "Guardando…",
      saved: "Cambios guardados",
      markSold: "Ya lo vendí",
      markSoldHelp:
        "Tu anuncio se queda visible, marcado como vendido, y deja de recibir contactos.",
      markSoldConfirm: "¿Ya vendiste este auto?",
      soldTitle: "Marcado como vendido",
      soldBody: "Felicidades por la venta. Tu anuncio ya aparece como vendido.",
      alreadySold: "Este anuncio ya está marcado como vendido.",
      withdraw: "Retirar anuncio",
      withdrawConfirm:
        "¿Seguro? Tu anuncio dejará de aparecer en el sitio. Esto no se puede deshacer.",
      withdrawn: "Anuncio retirado",
      withdrawnBody: "Ya no aparece en el sitio. Gracias por avisarnos.",
      notFound: "Enlace no válido",
      notFoundBody:
        "Este enlace no corresponde a ningún anuncio activo. Revisa que lo hayas copiado completo.",
      pendingNotice:
        "Tu anuncio todavía está en revisión. Los cambios que hagas aquí se verán cuando lo publiquemos.",
    },

    declaration:
      "Declaro que el vehículo es de mi propiedad, que la información anterior es verdadera, y que soy responsable de ella. Entiendo que Hi Desert Motors sólo publica el anuncio y no participa en la venta.",
    declarationRequired: "Tienes que aceptar la declaración para publicar",
  },
};

type Dict = typeof es;

const en: Dict = {
  page: {
    kicker: "List your car",
    title: "List your car and get its HDM rating",
    lede: "Fill this in honestly. The rating is calculated from what you declare, and you'll watch it move as you type.",
    disclaimer:
      "Hi Desert Motors is a listings board. We do not buy, sell, or broker: the buyer deals directly with you. We do not inspect vehicles, and the rating is based solely on what you declare here.",
  },

  steps: {
    vehicle: "The vehicle",
    history: "History and title",
    condition: "Actual condition",
    docs: "Backing",
    contact: "Your details",
  },

  fields: {
    year: "Year",
    make: "Make",
    makeHelp: 'If it is not listed, choose "Other make".',
    model: "Model",
    miles: "Odometer miles",
    price: "Asking price",
    titleStatus: "Title status",
    owners: "How many owners has it had?",
    accidents: "Reported accidents",
    knownIssues: "Known issues",
    knownIssuesHelp:
      'Required. If there are none, write "none". An honest listing sells faster than a perfect one.',
    description: "Your listing",
    descriptionHelp:
      "Tell the buyer why you're selling, what you've done to it, and how you've looked after it. Emojis and multiple paragraphs are fine.",
    descriptionPlaceholder:
      "Example:\n\n🚗 Bought it three years ago and it never let me down.\n🔧 Serviced every 5,000 miles, I have the receipts.\n❄️ A/C just recharged.\n\nSelling because I got a bigger truck for work.",
    city: "Where is the car?",
    cityHelp:
      "City only, not your address. Buyers need to know if it is close to them.",
    otherCity: "Other city",
    otherCityLabel: "Which city?",
    otherMake: "Other make",
    otherMakeLabel: "Which make?",
    selectPlaceholder: "Select…",
    milesOver: "or more",
    tires: "Tire condition",
    vin: "VIN (17 characters)",
    vinHelp:
      "The most valuable thing you can provide. It lets the buyer verify everything else and adds 30 points to your backing level.",
    photos: "Photos",
    photosHelp: "Minimum 3. Twelve or more raises your backing level.",
    name: "Your name",
    phone: "Phone or WhatsApp",
    email: "Email (not published)",
  },

  titleStatus: {
    clean: "Clean",
    clean_lien: "Clean, with a lien to pay off",
    rebuilt: "Rebuilt",
    salvage: "Salvage",
    no_title: "Title not in hand",
  },

  tires: {
    new: "New",
    good: "Good",
    worn: "Worn",
    needs_replacing: "Need replacing",
  },

  defects: {
    checkEngineOn: "The check engine light is on",
    otherWarningLights: "Other warning lights are on",
    startsEveryTime: "It starts every time, first try",
    transmissionSlips: "The transmission slips or shifts oddly",
    overheats: "It overheats",
    leaksFluid: "It leaks oil or other fluid",
    unusualNoises: "It makes unusual noises",
    acWorks: "The air conditioning blows cold",
    heatWorks: "The heater works",
    allWindowsWork: "All windows go up and down",
    brakesFeelNormal: "The brakes feel normal",
    hasRust: "It has rust",
    hasDents: "It has visible dents or scratches",
    glassCracked: "Some glass is cracked",
    interiorTorn: "The interior is torn or heavily stained",
    smokedIn: "It was smoked in",
  },

  docs: {
    hasServiceRecords: "I have service records",
    smogCurrent: "Smog certification is current",
    registrationCurrent: "Registration is current",
    hasVehicleHistoryReport: "I have a history report (Carfax or similar)",
  },

  score: {
    title: "HDM Rating",
    outOf: "out of 100",
    confidence: "Backing level",
    confidenceHelp:
      "Measures how much of what you declare can be verified. It doesn't change the car's rating, but it changes buyer confidence.",
    low: "Low",
    medium: "Medium",
    high: "High",
    liveHint: "The rating updates as you fill in the form.",
    declaredBy:
      "Rating calculated from data declared by the seller. Hi Desert Motors has not inspected this vehicle.",
  },

  flags: {
    title: "Check before you pay",
    title_salvage: "Salvage title",
    title_rebuilt: "Rebuilt title",
    title_lien: "Has a lien to pay off",
    title_missing: "Seller does not have the title in hand",
    transmission: "Transmission slips",
    overheating: "It overheats",
    starting: "Does not always start",
    check_engine: "Check engine light on",
    brakes: "Brakes do not feel normal",
    rust: "Has rust",
    multiple_accidents: "Two or more reported accidents",
    high_miles: "Very high mileage",
    no_smog: "No current smog certification",
  },

  form: {
    submit: "Publish listing",
    submitting: "Sending…",
    required: "This field is required",
    minPhotos: "Upload at least 3 photos",
    invalidVin: "The VIN must be 17 characters",
    invalidPhone: "Enter 10 digits, for example 7606206390",
    invalidEmail: "That email does not look valid",
    errorTitle: "Missing information",
    errorBody: "Still missing:",
    sendErrorTitle: "The listing could not be sent",
    uploadFailed: "A photo failed to upload",
    saveFailed: "Saving the listing failed",
    uploading: "Uploading photos",
    charsLeft: "characters left",
    addPhotos: "Add photos",
    removePhoto: "Remove",
    photosSelected: "photos selected",
    successTitle: "Listing received",
    successBody:
      "We'll review it and publish it shortly. We'll let you know at the number you left.",
    editLinkTitle: "Save this link",
    editLinkWarn:
      "It is the only way to edit or withdraw your listing. Do not share it, and do not lose it: for security reasons we cannot generate it again.",
    copyLink: "Copy link",
    copied: "Copied",

    edit: {
      title: "Edit your listing",
      lead: "You can correct the price, photos, description, location and your contact details.",
      lockedTitle: "This can no longer be changed",
      lockedBody:
        "The vehicle details were locked when you published: year, make, model, mileage, title, owners, accidents and the condition you declared. That is what holds up your HDM rating — if it could be changed afterwards, it would mean nothing to a buyer.",
      lockedFix:
        "Declared something by mistake? Withdraw this listing and publish a new one with the correct details.",
      save: "Save changes",
      saving: "Saving…",
      saved: "Changes saved",
      markSold: "I sold it",
      markSoldHelp:
        "Your listing stays visible, marked as sold, and stops receiving contacts.",
      markSoldConfirm: "Did you sell this car?",
      soldTitle: "Marked as sold",
      soldBody: "Congratulations on the sale. Your listing now shows as sold.",
      alreadySold: "This listing is already marked as sold.",
      withdraw: "Withdraw listing",
      withdrawConfirm:
        "Are you sure? Your listing will stop appearing on the site. This cannot be undone.",
      withdrawn: "Listing withdrawn",
      withdrawnBody: "It no longer appears on the site. Thanks for letting us know.",
      notFound: "Invalid link",
      notFoundBody:
        "This link does not match any active listing. Check that you copied it in full.",
      pendingNotice:
        "Your listing is still under review. Changes you make here will show once we publish it.",
    },

    declaration:
      "I declare that I own this vehicle, that the information above is true, and that I am responsible for it. I understand that Hi Desert Motors only publishes the listing and takes no part in the sale.",
    declarationRequired: "You must accept the declaration to publish",
  },
};

const dictionaries: Record<Locale, Dict> = { es, en };

export function getListingDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.es;
}

export type { Dict as ListingDictionary };
