/**
 * Datos botánicos, multimedia, testimonios anónimos y viveros verificados
 * para la guía interactiva `/tu-jardin-de-mariposas` de CEUTA Uruguay.
 *
 * Fuentes verificadas:
 * - Charla gratuita de Candelaria Domínguez (18/11/2026) — Lic. en Diseño de Paisaje (UdelaR)
 * - Ficha oficial del curso "Jardines biodiversos: tu jardín de mariposas" (CEUTA)
 * - Respaldo científico citado en la charla: Dra. Gabriela Bentancur-Viglione (Facultad de Ciencias, UdelaR)
 * - Directorio verificado de 21 viveros reales de Uruguay (viveros_uruguay.json, verificado: true)
 */

export type ZonaId =
  | "montevideo"
  | "canelones-costa"
  | "maldonado-este"
  | "interior";

export type EspacioId =
  | "balcon"
  | "patio-chico"
  | "jardin-grande"
  | "chacra-escuela";

export type EstadoActualId =
  | "pasto-baldosa"
  | "flores-vivero"
  | "muchas-plantas";

export type DepartamentoFiltro =
  | "Todos"
  | "Maldonado"
  | "Canelones"
  | "Montevideo"
  | "Rocha y Colonia";

export type VideoKey =
  | "comedorDePaso"
  | "balconYMacetas"
  | "plantaDeLaMonarca"
  | "invitacionCurso";

export interface ZonaOption {
  id: ZonaId;
  label: string;
  shortLabel: string;
  sublabel: string;
  contextoEcologico: string;
  notaClima: string;
  departamentoSugerido: DepartamentoFiltro;
  recomiendaSoloVirtual: boolean;
}

export interface EspacioOption {
  id: EspacioId;
  label: string;
  shortLabel: string;
  sublabel: string;
  fraseCandelaria: string;
  videoRecomendado: VideoKey;
  fotoAmbiente: string;
  fotoAmbienteAlt: string;
}

export interface EstadoActualOption {
  id: EstadoActualId;
  label: string;
  sublabel: string;
  tituloDiagnostico: string;
  subtituloDiagnostico: string;
  explicacion: string;
  primerPaso: string;
}

export interface MariposaEspecie {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  tagline: string;
  descripcion: string;
  hospederaPrincipal: string;
  hospederaCientifico: string;
  hospederaAlternativa?: string;
  nectariferas: string[];
  datoCandelaria: string;
  /** Foto real verificada únicamente cuando coincide con la especie o su ciclo exacto */
  fotoRealUrl?: string;
  fotoRealAlt?: string;
  /** Paleta de colores naturales de las alas para la ficha editorial y la tarjeta Canvas */
  paletaAlas: [string, string, string];
}

export interface PlantaRecomendada {
  nombreComun: string;
  nombreCientifico: string;
  rol: "hospedera" | "nectarifera" | "doble";
  paraQueMariposa: string;
  tipCultivo: string;
}

export interface VideoCandelaria {
  key: VideoKey;
  titulo: string;
  etiquetaCorta: string;
  duracion: string;
  descripcion: string;
  url: string;
  posterUrl: string;
  mb: number;
}

export interface TestimonioAnonimo {
  id: string;
  texto: string;
  etiqueta: string;
}

export interface ViveroUruguay {
  nombre: string;
  zona: string;
  departamento: "Maldonado" | "Canelones" | "Montevideo" | "Rocha" | "Colonia";
  grupoFiltro: Exclude<DepartamentoFiltro, "Todos">;
  especialidad: string;
  instagram: string | null;
  web: string | null;
  telefono: string | null;
  verificado: true;
}

export interface ResultadoGuia {
  zona: ZonaOption;
  espacio: EspacioOption;
  estado: EstadoActualOption;
  mariposas: [MariposaEspecie, MariposaEspecie, MariposaEspecie];
  plantasClave: PlantaRecomendada[];
  consejosEspacio: string[];
  videoPrincipal: VideoCandelaria;
  whatsappUrl: string;
  whatsappMensaje: string;
  cursoHref: string;
  cursoBotonLabel: string;
}

export const WHATSAPP_CEUTA_NUMERO = "59898910715";
export const SITE_GUIDE_URL = "ceuta-cursos.vercel.app/tu-jardin-de-mariposas";

export const FOTOS_REALES = {
  ogMariposasVuelo:
    "https://res.cloudinary.com/dgey83xqy/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/v1795267196/ceuta/tu-jardin-mariposas/og-mariposas-vuelo.jpg",
  mariposasVuelo:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1795267196/ceuta/tu-jardin-mariposas/og-mariposas-vuelo.jpg",
  balconMacetas:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1795267198/ceuta/tu-jardin-mariposas/balcon-macetas.jpg",
  mariposaFlorRoja:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1795267199/ceuta/tu-jardin-mariposas/mariposa-flor-roja.jpg",
  candelaria:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794927971/ceuta/cursos/galeria/jardin-de-mariposas-g01-candelaria.jpg",
  monarcaVerbena:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928308/ceuta/cursos/galeria/jardin-de-mariposas-g10-monarca-verbena.jpg",
  orugaMonarca:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928307/ceuta/cursos/galeria/jardin-de-mariposas-g09-oruga-monarca.jpg",
  poneHuevos:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928302/ceuta/cursos/galeria/jardin-de-mariposas-g07-pone-huevos.jpg",
  jardinNativas:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928293/ceuta/cursos/galeria/jardin-de-mariposas-g03-jardin-nativas.jpg",
  jardinCobertura:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928291/ceuta/cursos/galeria/jardin-de-mariposas-g02-jardin-cobertura.jpg",
  canteroPractica:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928300/ceuta/cursos/galeria/jardin-de-mariposas-g05-cantero-practica.jpg",
  papilionidaFlores:
    "https://res.cloudinary.com/dgey83xqy/image/upload/v1794928301/ceuta/cursos/galeria/jardin-de-mariposas-g06-jardin-con-mariposa.jpg",
} as const;

export const VIDEOS_CANDELARIA: Record<VideoKey, VideoCandelaria> = {
  comedorDePaso: {
    key: "comedorDePaso",
    titulo: "Comedor de paso vs. casa de mariposas",
    etiquetaCorta: "Comedor de paso",
    duracion: "40 seg",
    descripcion:
      "Por qué con flores solas las mariposas vienen, comen y se van — y cómo las plantas hospederas transforman tu espacio en su hogar.",
    url: "https://res.cloudinary.com/dgey83xqy/video/upload/v1795267174/ceuta/tu-jardin-mariposas/comedor-de-paso.mp4",
    posterUrl:
      "https://res.cloudinary.com/dgey83xqy/video/upload/so_1,f_jpg,q_auto,w_540/v1795267174/ceuta/tu-jardin-mariposas/comedor-de-paso.jpg",
    mb: 3.03,
  },
  balconYMacetas: {
    key: "balconYMacetas",
    titulo: "¿Balcón chico o macetas? Sí, claro que se puede",
    etiquetaCorta: "Balcón y macetas",
    duracion: "36 seg",
    descripcion:
      "Cómo armar un ecosistema completo en miniatura con dos o tres plantitas nativas en tu balcón o terraza.",
    url: "https://res.cloudinary.com/dgey83xqy/video/upload/v1795267180/ceuta/tu-jardin-mariposas/balcon-y-macetas.mp4",
    posterUrl:
      "https://res.cloudinary.com/dgey83xqy/video/upload/so_1,f_jpg,q_auto,w_540/v1795267180/ceuta/tu-jardin-mariposas/balcon-y-macetas.jpg",
    mb: 3.04,
  },
  plantaDeLaMonarca: {
    key: "plantaDeLaMonarca",
    titulo: "La planta «de la monarca» que la puede enfermar",
    etiquetaCorta: "Alerta monarca",
    duracion: "57 seg",
    descripcion:
      "Por qué la Asclepias curassavica roja y naranja de vivero es una trampa ecológica y qué nativas elegir en Uruguay.",
    url: "https://res.cloudinary.com/dgey83xqy/video/upload/v1795267189/ceuta/tu-jardin-mariposas/planta-de-la-monarca.mp4",
    posterUrl:
      "https://res.cloudinary.com/dgey83xqy/video/upload/so_1,f_jpg,q_auto,w_540/v1795267189/ceuta/tu-jardin-mariposas/planta-de-la-monarca.jpg",
    mb: 4.86,
  },
  invitacionCurso: {
    key: "invitacionCurso",
    titulo: "Cómo es el curso con Candelaria Domínguez",
    etiquetaCorta: "Sobre el curso",
    duracion: "53 seg",
    descripcion:
      "Tres clases en vivo por Zoom que quedan grabadas y práctica opcional en Granja Mandala, Maldonado.",
    url: "https://res.cloudinary.com/dgey83xqy/video/upload/v1795267195/ceuta/tu-jardin-mariposas/invitacion-curso.mp4",
    posterUrl:
      "https://res.cloudinary.com/dgey83xqy/video/upload/so_1,f_jpg,q_auto,w_540/v1795267195/ceuta/tu-jardin-mariposas/invitacion-curso.jpg",
    mb: 2.88,
  },
};

export const ZONAS: ZonaOption[] = [
  {
    id: "montevideo",
    label: "Montevideo",
    shortLabel: "Montevideo",
    sublabel: "Ciudad, barrios costeros y periferia urbana",
    contextoEcologico:
      "En ciudad cada balcón, vereda o patio funciona como un «peldaño ecológico» que achica la distancia entre parques, arroyos y la rambla.",
    notaClima:
      "Buscá orientación norte–noreste (mínimo 6 horas de sol) y protegé tus plantas de las ráfagas entre edificios o del viento sur.",
    departamentoSugerido: "Montevideo",
    recomiendaSoloVirtual: false,
  },
  {
    id: "canelones-costa",
    label: "Canelones y Costa",
    shortLabel: "Canelones y Costa",
    sublabel: "Ciudad de la Costa, Costa de Oro y Canelones rural",
    contextoEcologico:
      "Tenés arroyos, médanos y bañados cerca: tus plantas nativas se conectan rapidísimo con corredores biológicos costeros.",
    notaClima:
      "En suelos arenosos y con brisa salina lucen rústicas como marcela, margarita punzó, verbena alta, carqueja y coronilla.",
    departamentoSugerido: "Canelones",
    recomiendaSoloVirtual: false,
  },
  {
    id: "maldonado-este",
    label: "Maldonado y Este",
    shortLabel: "Maldonado y Este",
    sublabel: "Maldonado, Piriápolis, Punta del Este, San Carlos y Rocha",
    contextoEcologico:
      "Entre sierras, costa atlántica y montes ribereños convivís con una de las faunas de mariposas más ricas del país.",
    notaClima:
      "Usá cercos vivos con gramíneas nativas y arbustos rústicos (chircas, coronilla, carqueja) para frenar la sudestada y el pampero.",
    departamentoSugerido: "Maldonado",
    recomiendaSoloVirtual: false,
  },
  {
    id: "interior",
    label: "Interior de Uruguay",
    shortLabel: "Interior de Uruguay",
    sublabel: "Litoral, centro, sierras, norte y Colonia",
    contextoEcologico:
      "Uruguay está en pleno ecotono pampeano, espinal y paranaense: en el interior podés recibir desde especies de pradera hasta mariposas de monte serrano y ribereño.",
    notaClima:
      "Dejar franjas sin cortar al ras y conservar chircas, talas, espinillos o algarrobos multiplica mariposas y picaflores casi sin riego.",
    departamentoSugerido: "Rocha y Colonia",
    recomiendaSoloVirtual: true,
  },
];

export const ESPACIOS: EspacioOption[] = [
  {
    id: "balcon",
    label: "Balcón o macetas",
    shortLabel: "balcón o macetas",
    sublabel: "Terraza, ventana soleada o patio de baldosas",
    fraseCandelaria:
      "«Con dos o tres plantitas nativas bien elegidas en macetas ya armás un ecosistema en miniatura y un peldaño ecológico en tu cuadra.»",
    videoRecomendado: "balconYMacetas",
    fotoAmbiente: FOTOS_REALES.balconMacetas,
    fotoAmbienteAlt: "Macetas soleadas con flores en un balcón",
  },
  {
    id: "patio-chico",
    label: "Patio chico",
    shortLabel: "patio chico",
    sublabel: "Cantero, frente, vereda o fondo urbano",
    fraseCandelaria:
      "«En un patio doméstico podés aprovechar el cerco con una trepadora hospedera y agrupar manchas de flores nativas que funcionen como faro visual.»",
    videoRecomendado: "comedorDePaso",
    fotoAmbiente: FOTOS_REALES.jardinCobertura,
    fotoAmbienteAlt: "Cantero con plantas y cobertura vegetal en patio doméstico",
  },
  {
    id: "jardin-grande",
    label: "Jardín grande",
    shortLabel: "jardín grande",
    sublabel: "Terreno amplio, casa de balneario o fondo verde",
    fraseCandelaria:
      "«Reducí el césped cortado al ras a donde realmente caminás o jugás, y armá capas con árboles, arbustos, herbáceas y gramíneas nativas.»",
    videoRecomendado: "comedorDePaso",
    fotoAmbiente: FOTOS_REALES.jardinNativas,
    fotoAmbienteAlt: "Jardín con gramíneas y arbustos nativos en capas",
  },
  {
    id: "chacra-escuela",
    label: "Chacra, parque o escuela",
    shortLabel: "chacra, parque o escuela",
    sublabel: "Predio rural, huerta comunitaria o espacio educativo",
    fraseCandelaria:
      "«Un predio amplio o una escuela se vuelve un aula viva: con árboles nativos como coronilla y tala las mariposas completan todo su ciclo en libertad.»",
    videoRecomendado: "plantaDeLaMonarca",
    fotoAmbiente: FOTOS_REALES.canteroPractica,
    fotoAmbienteAlt: "Espacio amplio con flora nativa y agua para biodiversidad",
  },
];

export const ESTADOS_ACTUALES: EstadoActualOption[] = [
  {
    id: "pasto-baldosa",
    label: "Solo pasto o baldosa",
    sublabel: "Césped cortito, cemento o tierra pelada",
    tituloDiagnostico: "Hoy tu espacio funciona como un desierto ecológico",
    subtituloDiagnostico: "Y cambiarlo lleva mucho menos de lo que parece",
    explicacion:
      "Como explicó Candelaria en la charla, el cemento y el césped exótico cortado al ras no ofrecen néctar, ni refugio, ni hojas donde poner huevos. La buena noticia: con apenas 2 o 3 nativas en manchas juntas ya rompés la barrera y empezás a ver visitas en la primera temporada.",
    primerPaso:
      "Sumá una hospedera clave + una nectarífera comodín (como la mariposera blanca o la verbena alta) en el rincón que reciba más sol de la mañana.",
  },
  {
    id: "flores-vivero",
    label: "Algunas flores de vivero",
    sublabel: "Plantas lindas, pero pasan pocas mariposas o no se quedan",
    tituloDiagnostico: "Tenés un «comedor de paso», todavía no una casa",
    subtituloDiagnostico: "Vienen, liban un ratito y siguen de largo",
    explicacion:
      "Muchas flores ornamentales exóticas dan algo de néctar, pero nuestras orugas co-evolucionaron miles de años solo con plantas nativas rioplatenses: una oruga de espejito en un rosal se muere de hambre. Sin plantas hospederas, la mariposa no puede poner huevos ni nacer en tu casa.",
    primerPaso:
      "Mantené lo que te gusta (siempre que no sea invasor) e incorporá al menos 2 especies hospederas nativas + flores nativas agrupadas en manchas.",
  },
  {
    id: "muchas-plantas",
    label: "Muchas plantas pero pocas mariposas",
    sublabel: "Hay verde abundante, pero falta movimiento de vida",
    tituloDiagnostico: "Hay verde, pero falta conectividad nativa o sobran podas",
    subtituloDiagnostico: "Tres ajustes concretos destraban todo el ciclo",
    explicacion:
      "Cuando un jardín lleno de plantas casi no tiene mariposas suelen pasar tres cosas: predominan especies exóticas que las orugas no reconocen, las plantas están muy dispersas en vez de agrupadas en manchas, o se poda/limpia en otoño–invierno retirando las crisálidas que pasan el frío en tallos secos y hojarasca.",
    primerPaso:
      "Cero insecticidas ni herbicidas, dejá la hojarasca como cobertura, no podes hasta primavera y sumá hospederas nativas agrupadas.",
  },
];

export const MARIPOSAS: Record<string, MariposaEspecie> = {
  monarca: {
    id: "monarca",
    nombreComun: "Monarca del Sur",
    nombreCientifico: "Danaus erippus",
    tagline: "La viajera emblemática de naranja y negro",
    descripcion:
      "Sus orugas rayadas en negro, amarillo y blanco acumulan defensas naturales de su planta hospedera para ahuyentar predadores.",
    hospederaPrincipal: "Yerba de la víbora",
    hospederaCientifico: "Asclepias mellodora",
    hospederaAlternativa:
      "Plumerillo negro (Oxypetalum solanoides) o Tasi (Araujia)",
    nectariferas: [
      "Mariposera blanca (Austroeupatorium inulifolium)",
      "Verbena alta (Verbena bonariensis)",
      "Lantana nativa (Lantana montevidensis)",
    ],
    datoCandelaria:
      "Evitá la Asclepias curassavica roja/naranja de vivero: elegí siempre la yerba de la víbora nativa de flor blanca, que pierde hojas en invierno y respeta su ciclo.",
    fotoRealUrl: FOTOS_REALES.monarcaVerbena,
    fotoRealAlt: "Mariposa Monarca posada sobre flores violetas de verbena",
    paletaAlas: ["#d96b1f", "#1e1b18", "#f7e3c6"],
  },
  espejito: {
    id: "espejito",
    nombreComun: "Espejito",
    nombreCientifico: "Agraulis vanillae",
    tagline: "Naranja vibrante con gotas plateadas al cerrar las alas",
    descripcion:
      "Una de las mariposas más fieles a los jardines urbanos de Uruguay. Sus orugas tienen espinas llamativas pero son 100% inofensivas.",
    hospederaPrincipal: "Mburucuyá nativo",
    hospederaCientifico: "Passiflora caerulea",
    hospederaAlternativa:
      "Mburucuyá mini (Passiflora misera) — ideal para macetas y espacios chicos",
    nectariferas: [
      "Mariposera blanca (Austroeupatorium inulifolium)",
      "Lantana nativa (Lantana montevidensis)",
      "Margarita punzó (Glandularia peruviana)",
    ],
    datoCandelaria:
      "Su oruga solo puede comer mburucuyá: en un rosal se muere de hambre. Cuando veas hojas comidas, celebralo: la planta rebrota con fuerza.",
    paletaAlas: ["#e06d1b", "#3a2112", "#e8eef2"],
  },
  perezosa: {
    id: "perezosa",
    nombreComun: "Perezosa común",
    nombreCientifico: "Actinote pellenea",
    tagline: "Vuelo sereno y tonos ocre sobre flores blancas perfumadas",
    descripcion:
      "Completa su ciclo sobre la planta comodín de Candelaria: la mariposera blanca, que además funciona como imán de decenas de especies en verano y otoño.",
    hospederaPrincipal: "Mariposera blanca",
    hospederaCientifico: "Austroeupatorium inulifolium",
    hospederaAlternativa:
      "Complemento aéreo para balcón: Clavel del aire (Tillandsia aeranthos) para la Frotadora gris",
    nectariferas: [
      "Mariposera blanca (doble función: hospedera y néctar)",
      "Verbena alta (Verbena bonariensis)",
      "Lantana megapotamica",
    ],
    datoCandelaria:
      "«Si tenés poco espacio y podés poner pocas plantas, arrancá por la mariposera: atrae decenas de mariposas entre febrero y mayo y hospeda a la perezosa.»",
    paletaAlas: ["#c97a2b", "#2d241d", "#f1dc9b"],
  },
  bordeDeOro: {
    id: "bordeDeOro",
    nombreComun: "Borde de oro",
    nombreCientifico: "Battus polydamas",
    tagline: "Gran papiliónida negra con collar de lunas doradas",
    descripcion:
      "De vuelo ágil y porte grande, es una sorpresa inolvidable incluso en patios urbanos chicos si sumás su trepadora cubresuelos.",
    hospederaPrincipal: "Mil hombres",
    hospederaCientifico: "Aristolochia fimbriata",
    nectariferas: [
      "Lantana nativa (Lantana montevidensis)",
      "Verbena alta (Verbena bonariensis)",
      "Mariposera blanca (Austroeupatorium inulifolium)",
    ],
    datoCandelaria:
      "La Aristolochia fimbriata funciona maravillosamente como cubresuelos nativo en espacios reducidos y patios soleados.",
    paletaAlas: ["#1f2421", "#e4b626", "#4b5a47"],
  },
  cuatroOjos: {
    id: "cuatroOjos",
    nombreComun: "Cuatro ojos (Pavo real)",
    nombreCientifico: "Junonia genoveva",
    tagline: "Ocelos azules y tierra sobre flores bajas al sol",
    descripcion:
      "Amante del sol pleno y los suelos bien drenados, deslumbra con los círculos azulados en sus alas que confunden a las aves.",
    hospederaPrincipal: "Marcela nativa",
    hospederaCientifico: "Achyrocline satureioides",
    hospederaAlternativa:
      "Yerba del mosquito (Phyla canescens) y Peludilla (Gamochaeta)",
    nectariferas: [
      "Margarita punzó (Glandularia peruviana)",
      "Verbena alta (Verbena bonariensis)",
      "Lantana nativa (Lantana montevidensis)",
    ],
    datoCandelaria:
      "La misma marcela con la que hacemos té es hospedera de la cuatro ojos y de la dama pintada, y tolera de maravilla la brisa y los suelos arenosos.",
    paletaAlas: ["#8f613b", "#2b6cb0", "#e6b85c"],
  },
  limoncito: {
    id: "limoncito",
    nombreComun: "Limoncito y Azufrada",
    nombreCientifico: "Eurema deva / Phoebis",
    tagline: "Destellos amarillo limón que iluminan todo el verano y otoño",
    descripcion:
      "Mariposas diurnas inquietas y luminosas que llenan de movimiento canteros y jardines cuando florecen las leguminosas nativas.",
    hospederaPrincipal: "Sen del campo (Rama negra)",
    hospederaCientifico: "Senna corymbosa",
    hospederaAlternativa:
      "Plumerillo rosado (Calliandra parvifolia) para la Azufrada coluda",
    nectariferas: [
      "Mariposera blanca (Austroeupatorium inulifolium)",
      "Lantana nativa (Lantana montevidensis)",
      "Margarita punzó (Glandularia peruviana)",
    ],
    datoCandelaria:
      "El sen del campo tiene una floración amarillo oro espectacular en verano y otoño; sus hojas comidas por orugas son señal de que el jardín está vivo.",
    paletaAlas: ["#f2d024", "#4a6b3b", "#fff5b8"],
  },
  banderaArgentina: {
    id: "banderaArgentina",
    nombreComun: "Bandera Argentina",
    nombreCientifico: "Morpho epistrophus argentinus",
    tagline: "Vuelo celeste perlado, suspendido como de cuento de hadas",
    descripcion:
      "Una de las joyas de nuestros montes y jardines amplios. Sus orugas rojas viven en racimos gregarios y NO pican: son completamente inofensivas.",
    hospederaPrincipal: "Coronilla",
    hospederaCientifico: "Scutia buxifolia",
    hospederaAlternativa:
      "Ingá (Inga vera, en suelos húmedos) o Yerba de bugre (Lonchocarpus nitidus)",
    nectariferas: [
      "Fruta madura dulce y savia de monte",
      "Ingá (flores blancas perfumadas)",
      "Chircas y mariposera en el entorno",
    ],
    datoCandelaria:
      "«Ver ese racimo rojo de orugas en una coronilla no da miedo: es el mayor premio que podés recibir en un jardín. La coronilla además resiste vientos costeros y suelos pedregosos.»",
    paletaAlas: ["#cbe7f5", "#6ca6c1", "#2c3e50"],
  },
  ochenta: {
    id: "ochenta",
    nombreComun: "Mariposa Ochenta",
    nombreCientifico: "Diaethria candrena",
    tagline: "Azul metalizado arriba y un «80» dibujado en blanco y rojo abajo",
    descripcion:
      "Comparte el tala con el Zafiro del talar y la Picuda: plantar un solo árbol multi-hospedero abre las puertas a varias especies a la vez.",
    hospederaPrincipal: "Tala",
    hospederaCientifico: "Celtis tala",
    nectariferas: [
      "Mariposera blanca (Austroeupatorium inulifolium)",
      "Chircas (Baccharis punctulata / B. salicifolia)",
      "Estaciones de barro mineral al sol (puddling)",
    ],
    datoCandelaria:
      "El tala es un árbol emblemático y hospedero múltiple: si tenés lugar para un solo árbol nativo, te trae Ochenta, Zafiro del talar, Picuda y Frotadora oscura.",
    paletaAlas: ["#1d4e89", "#c73e3a", "#f5f5f0"],
  },
};

export const ALERTA_MONARCA = {
  titulo: "Cuidado con la «planta de la monarca» que venden en muchos viveros",
  plantaEvitar: "Asclepias curassavica (flor roja y naranja — exótica tropical)",
  porqueEvitar:
    "En jardines urbanos protegidos no pierde las hojas en invierno. Eso confunde a la monarca del sur (Danaus erippus), impide su diapausa invernal y acumula un parásito protozoo (Ophryocystis elektroscirrha, OE) que provoca alas deformadas y muerte.",
  alternativasNativas: [
    {
      nombre: "Yerba de la víbora",
      cientifico: "Asclepias mellodora",
      detalle: "Nativa de flor blanca; pierde follaje en invierno de forma natural.",
    },
    {
      nombre: "Plumerillo negro",
      cientifico: "Oxypetalum solanoides",
      detalle: "Nativa rioplatense hospedera de la monarca del sur y la reina.",
    },
    {
      nombre: "Tasi",
      cientifico: "Araujia",
      detalle: "Trepadora nativa hospedera (además de fruto tradicional para dulce).",
    },
  ],
  bonusLantana:
    "También evitá la Lantana camara (exótica, tóxica y potencialmente invasora): elegí siempre nuestras nativas Lantana montevidensis (violeta, blanca o amarilla) y Lantana megapotamica.",
};

export const REGLAS_DE_ORO = [
  {
    numero: "01",
    titulo: "Cero agrotóxicos",
    detalle:
      "Ni insecticidas, ni herbicidas (como glifosato), ni Bacillus thuringiensis (mata a todas las orugas). Si aparecen pulgones, dejá actuar a las vaquitas de San Antonio o usá agua con jabón blanco.",
  },
  {
    numero: "02",
    titulo: "Celebrá las hojas comidas",
    detalle:
      "Ver el mburucuyá, la yerba de la víbora o el sen del campo comidos por orugas es la prueba física del éxito: tus plantas nativas están adaptadas y rebrotan con fuerza.",
  },
  {
    numero: "03",
    titulo: "No podes en otoño ni invierno",
    detalle:
      "En tallos secos, gramíneas y hojarasca descansan huevos y crisálidas en diapausa. Esperá a septiembre–noviembre para limpiezas suaves y dejá el suelo cubierto.",
  },
  {
    numero: "04",
    titulo: "Sol, manchas y barro mineral",
    detalle:
      "Agrupá plantas de la misma especie como un faro visual al sol (orientación norte–noreste, 6 hs). Sumá lajas oscuras para calentar alas y un plato playo con arena y compost húmedo (nunca agua honda donde se ahogan).",
  },
] as const;

export const TESTIMONIOS_REALES: TestimonioAnonimo[] = [
  {
    id: "t1",
    texto:
      "Me gustó el «encare», convencimiento y decisión de Candelaria, además de todo lo que demuestra saber.",
    etiqueta: "Asistente a la charla gratuita · Noviembre",
  },
  {
    id: "t2",
    texto:
      "Quedé muy agradecida y motivada, entendí por qué no es lo mismo una planta que otra. Me puse a buscar y ya encontré que ofrecían la planta equivocada para las mariposas.",
    etiqueta: "Asistente a la charla gratuita · Noviembre",
  },
  {
    id: "t3",
    texto:
      "La charla fue muy buena, me encantó. Fue de mucha información muy interesante y útil.",
    etiqueta: "Asistente a la charla gratuita · Noviembre",
  },
  {
    id: "t4",
    texto:
      "Me encantó la charla, sirvió para despejar muchas dudas y confirmar otras.",
    etiqueta: "Asistente a la charla gratuita · Noviembre",
  },
];

export const CURSO_INFO = {
  nombre: "Jardines biodiversos: tu jardín de mariposas",
  docente: {
    nombre: "Candelaria Domínguez",
    credenciales:
      "Licenciada en Diseño de Paisaje (UdelaR), con dos maestrías (proyectos ambientales y manejo costero) y más de 10 años de experiencia docente. Invitada en La Mesa Verde de En Perspectiva.",
    fotoUrl: FOTOS_REALES.candelaria,
  },
  fechas: {
    inicio: "Miércoles 25 de noviembre",
    clasesZoom: "Miércoles 25/11, 2/12 y 9/12 · 19:00 a 21:00 hs por Zoom (quedan grabadas)",
    reenganche: "Si no llegás el 25/11, podés reengancharte el miércoles 2/12 mirando la clase 1 grabada.",
    practica: "Práctica opcional: sábado 12/12 de 9:30 a 13:30 hs en Granja Mandala, Maldonado (hasta 30 lugares).",
  },
  precios: {
    completo: 4000,
    soloVirtual: 3500,
    grupalDescuentoPct: 10,
    grupalCompleto: 3600,
    grupalSoloVirtual: 3150,
    grupalTexto:
      "Si venís con una amiga, pareja o vecina, las dos tienen 10% de descuento ($3.600 c/u completo o $3.150 c/u solo virtual).",
  },
  certificacion:
    "Certificado de CEUTA (entidad capacitadora registrada en el MEC y en INEFOP). No hace falta experiencia previa.",
  modulos: [
    "Clase 1 (25/11): Leer tu lugar (sol, viento, agua) y regenerar el suelo con cobertura.",
    "Clase 2 (2/12): Elegir tus nativas hospederas y nectaríferas, y ordenarlas en capas con flores casi todo el año.",
    "Clase 3 (9/12): El jardín como aula viva: ciclo oruga–mariposa y diseño para disfrutar y compartir.",
    "Práctica opcional (12/12): Armamos juntos un cantero biodiverso desde cero en Granja Mandala, Maldonado.",
  ],
} as const;

export const DEPARTAMENTOS_FILTRO: DepartamentoFiltro[] = [
  "Todos",
  "Maldonado",
  "Canelones",
  "Montevideo",
  "Rocha y Colonia",
];

/**
 * Los 21 viveros reales verificados de Uruguay (verificado: true en viveros_uruguay.json).
 */
export const VIVEROS_URUGUAY: ViveroUruguay[] = [
  {
    nombre: "Psamófila",
    zona: "Pan de Azúcar",
    departamento: "Maldonado",
    grupoFiltro: "Maldonado",
    especialidad:
      "Semillas y plantines de flora nativa y silvestre, herbáceas florales, gramíneas y vegetación de dunas costeras; diseño biodiverso",
    instagram: "@psamofila",
    web: "https://psamofila.com",
    telefono: "+598 99 652 559",
    verificado: true,
  },
  {
    nombre: "Vivero Salvaje",
    zona: "La Barra (Las Estrellas y Los Silencios)",
    departamento: "Maldonado",
    grupoFiltro: "Maldonado",
    especialidad: "Plantas nativas, paisajismo y jardín abierto (Estación Salvaje)",
    instagram: "@vivero.salvaje",
    web: null,
    telefono: null,
    verificado: true,
  },
  {
    nombre: "Niñarupa Parque y Vivero Nativo",
    zona: "Sierra de las Ánimas / Nueva Carrara (Ruta 60 km 19,5)",
    departamento: "Maldonado",
    grupoFiltro: "Maldonado",
    especialidad:
      "Árboles, arbustos, chircas y herbáceas nativas; refugio de flora y fauna con visitas guiadas",
    instagram: "@ninarupa.uy",
    web: "https://www.ninarupa.uy",
    telefono: "+598 94 665 748",
    verificado: true,
  },
  {
    nombre: "Vivero Guaviyú",
    zona: "San Carlos (Lili Curbelo y Martín Pescador)",
    departamento: "Maldonado",
    grupoFiltro: "Maldonado",
    especialidad:
      "Árboles, arbustos y herbáceas nativas de Uruguay; asesoramiento técnico en jardinería sustentable",
    instagram: "@juliaaranguren",
    web: null,
    telefono: "+598 99 651 011",
    verificado: true,
  },
  {
    nombre: "Vivero Laguna del Chajá",
    zona: "Punta Negra (Ruta Interbalnearia km 106,5)",
    departamento: "Maldonado",
    grupoFiltro: "Maldonado",
    especialidad:
      "Catálogo amplio de árboles, arbustos, herbáceas y acuáticas nativas de Uruguay; asesoramiento según sol y suelo",
    instagram: "@viverodelchaja",
    web: "https://www.viverodelchaja.com.uy",
    telefono: "+598 98 102 128",
    verificado: true,
  },
  {
    nombre: "Vivero Los Cerezos",
    zona: "Playa Grande, Piriápolis (Av. Misiones)",
    departamento: "Maldonado",
    grupoFiltro: "Maldonado",
    especialidad:
      "Gran vivero de plaza en la zona costera de Maldonado con árboles, arbustos, frutales y florales adaptados a la costa",
    instagram: "@viveroloscerezos_piriapolis",
    web: "https://www.viveroloscerezos.uy",
    telefono: "+598 99 330 849",
    verificado: true,
  },
  {
    nombre: "Jardín de la Costa",
    zona: "San José de Carrasco, Ciudad de la Costa (Av. Giannattasio km 20)",
    departamento: "Canelones",
    grupoFiltro: "Canelones",
    especialidad:
      "Gran vivero y paisajismo de Ciudad de la Costa con plantas ornamentales, florales y especies adaptadas a la faja costera",
    instagram: "@jardindelacostaok",
    web: "https://www.jardindelacosta.com.uy",
    telefono: "+598 95 869 495",
    verificado: true,
  },
  {
    nombre: "Vivero del Parque Roosevelt",
    zona: "Parque Roosevelt Fracción 3, Ciudad de la Costa (Av. a la Playa)",
    departamento: "Canelones",
    grupoFiltro: "Canelones",
    especialidad:
      "Vivero público educativo de especies nativas y psamófilas costeras (Intendencia de Canelones y Ministerio de Ambiente)",
    instagram: "@parqueroosevelt.uy",
    web: "https://parqueroosevelt.uy",
    telefono: "+598 92 192 055",
    verificado: true,
  },
  {
    nombre: "Vivero Pachamama",
    zona: "El Pinar, Ciudad de la Costa (Av. Giannattasio km 30,3)",
    departamento: "Canelones",
    grupoFiltro: "Canelones",
    especialidad:
      "Plantas nativas, ornamentales y escuela de jardinería (Plantas y Jardines de Uruguay)",
    instagram: null,
    web: "https://www.plantasyjardinesdeuruguay.com",
    telefono: "+598 99 847 683",
    verificado: true,
  },
  {
    nombre: "VN Plantas",
    zona: "Canelón Chico / Las Piedras (Ent. Espiga 1)",
    departamento: "Canelones",
    grupoFiltro: "Canelones",
    especialidad:
      "Vivero productor de gran escala con variedad de plantas de jardín y envíos a todo el país",
    instagram: "@vn_plantas",
    web: null,
    telefono: "+598 98 570 919",
    verificado: true,
  },
  {
    nombre: "Vivero Parati",
    zona: "Toledo Chico (Camino La Espiga 5020)",
    departamento: "Canelones",
    grupoFiltro: "Canelones",
    especialidad:
      "Herbáceas perennes, gramíneas y plantas autóctonas ornamentales para jardines naturalistas",
    instagram: "@viveroparati",
    web: "https://www.viveroparati.com",
    telefono: "+598 94 722 000",
    verificado: true,
  },
  {
    nombre: "Vivero Montes",
    zona: "La Floresta (Av. Sarandí Solís esq. Parque Tabaré)",
    departamento: "Canelones",
    grupoFiltro: "Canelones",
    especialidad:
      "Plantas ornamentales, florales, de huerta e insumos en Costa de Oro",
    instagram: null,
    web: null,
    telefono: "4373 6518",
    verificado: true,
  },
  {
    nombre: "Vivero del Jardín Botánico de Montevideo",
    zona: "Prado (Av. 19 de Abril 1181)",
    departamento: "Montevideo",
    grupoFiltro: "Montevideo",
    especialidad:
      "Referente institucional en flora nativa uruguaya, conservación y sede de las Ferias de Plantas",
    instagram: null,
    web: "https://jardinbotanico.montevideo.gub.uy",
    telefono: "1950 7840",
    verificado: true,
  },
  {
    nombre: "Monte Nativo",
    zona: "La Blanqueada (Jaime Cibils 2862) y distribución en Maldonado",
    departamento: "Montevideo",
    grupoFiltro: "Montevideo",
    especialidad:
      "Árboles, arbustos, ornamentales y frutales nativos de Uruguay (habilitado por INIA para guayabo del país)",
    instagram: null,
    web: "http://www.montenativo.com",
    telefono: "+598 99 263 039",
    verificado: true,
  },
  {
    nombre: "Vivero Palán Palán",
    zona: "Ciudad Vieja (Reconquista 590 esq. Juan Carlos Gómez)",
    departamento: "Montevideo",
    grupoFiltro: "Montevideo",
    especialidad:
      "Vivero urbano de cercanía especializado en plantas nativas y adaptadas para balcones, azoteas y patios",
    instagram: "@vivero_palanpalan",
    web: "https://palanpalan.com",
    telefono: "+598 92 127 763",
    verificado: true,
  },
  {
    nombre: "Vivero Las Cina Cinas",
    zona: "Zona Ruta 8 / Perimetral (Román de Acha 3298 esq. Cno. Mangangá)",
    departamento: "Montevideo",
    grupoFiltro: "Montevideo",
    especialidad:
      "Árboles y arbustos nativos de Uruguay (arazá, cina-cina, arrayán y más) junto a ornamentales",
    instagram: "@viverolascinacinas",
    web: "https://viverolascinacinas.com.uy",
    telefono: "+598 95 836 121",
    verificado: true,
  },
  {
    nombre: "Vivero El Ceibo",
    zona: "Punta Gorda (Av. Dr. Juan B. Alberdi 6157)",
    departamento: "Montevideo",
    grupoFiltro: "Montevideo",
    especialidad:
      "Gran vivero urbano de Montevideo con amplio catálogo de plantas de jardín, arbustos y florales",
    instagram: "@elceibo_vivero",
    web: "https://viveroelceibo.com",
    telefono: "2600 2202",
    verificado: true,
  },
  {
    nombre: "Agresta Paisajismo",
    zona: "Montevideo / Área Metropolitana (visitas coordinadas)",
    departamento: "Montevideo",
    grupoFiltro: "Montevideo",
    especialidad:
      "Estudio de paisajismo con vivero propio orientado a jardines sustentables, xerófitos y flora adaptada",
    instagram: "@agrestapaisajismo",
    web: "https://agrestapaisajismo.com.uy",
    telefono: "+598 94 755 881",
    verificado: true,
  },
  {
    nombre: "Vivero de Sotobosque",
    zona: "La Serena, La Paloma",
    departamento: "Rocha",
    grupoFiltro: "Rocha y Colonia",
    especialidad:
      "Especies nativas de sotobosque para regeneración de monte indígena y jardines ecológicos costeros",
    instagram: null,
    web: null,
    telefono: "+598 92 333 656",
    verificado: true,
  },
  {
    nombre: "Vivero La Pedrera",
    zona: "La Pedrera",
    departamento: "Rocha",
    grupoFiltro: "Rocha y Colonia",
    especialidad: "Arbustivas y flora nativa adaptada a la costa rochense",
    instagram: null,
    web: null,
    telefono: "+598 97 464 691",
    verificado: true,
  },
  {
    nombre: "Vivero Jardines del Sacramento",
    zona: "Colonia del Sacramento (Atanasio Sierra 545)",
    departamento: "Colonia",
    grupoFiltro: "Rocha y Colonia",
    especialidad:
      "Vivero de referencia en Colonia del Sacramento con árboles, arbustos y plantas de jardín",
    instagram: null,
    web: null,
    telefono: "+598 99 525 505",
    verificado: true,
  },
];

function seleccionarMariposas(
  zonaId: ZonaId,
  espacioId: EspacioId
): [MariposaEspecie, MariposaEspecie, MariposaEspecie] {
  if (espacioId === "balcon") {
    if (zonaId === "canelones-costa" || zonaId === "maldonado-este") {
      return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.cuatroOjos];
    }
    return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.perezosa];
  }

  if (espacioId === "patio-chico") {
    if (zonaId === "canelones-costa" || zonaId === "maldonado-este") {
      return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.cuatroOjos];
    }
    if (zonaId === "interior") {
      return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.limoncito];
    }
    return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.bordeDeOro];
  }

  if (espacioId === "jardin-grande") {
    if (zonaId === "canelones-costa" || zonaId === "maldonado-este") {
      return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.banderaArgentina];
    }
    if (zonaId === "interior") {
      return [MARIPOSAS.monarca, MARIPOSAS.ochenta, MARIPOSAS.limoncito];
    }
    return [MARIPOSAS.monarca, MARIPOSAS.espejito, MARIPOSAS.limoncito];
  }

  // chacra-escuela
  return [MARIPOSAS.banderaArgentina, MARIPOSAS.ochenta, MARIPOSAS.monarca];
}

function armarPlantasClave(
  zonaId: ZonaId,
  espacioId: EspacioId,
  mariposas: [MariposaEspecie, MariposaEspecie, MariposaEspecie]
): PlantaRecomendada[] {
  const lista: PlantaRecomendada[] = [];

  for (const m of mariposas) {
    const esBalconMburucuya = espacioId === "balcon" && m.id === "espejito";
    lista.push({
      nombreComun: esBalconMburucuya ? "Mburucuyá mini" : m.hospederaPrincipal,
      nombreCientifico: esBalconMburucuya
        ? "Passiflora misera"
        : m.hospederaCientifico,
      rol: m.id === "perezosa" ? "doble" : "hospedera",
      paraQueMariposa: m.nombreComun,
      tipCultivo: esBalconMburucuya
        ? "Versión más compacta del mburucuyá: perfecta para maceta profunda con tutor o baranda soleada."
        : m.id === "banderaArgentina"
          ? "Árbol nativo de crecimiento lento, rústico y tolerante a suelos pedregosos y vientos costeros."
          : m.id === "ochenta"
            ? "Árbol multi-hospedero de monte nativo: también atrae Zafiro del talar, Picuda y Frotadora oscura."
            : m.id === "bordeDeOro"
              ? "Trepadora o cubresuelos nativo ideal para espacios chicos con buen drenaje."
              : m.id === "monarca"
                ? "Sol pleno y suelo bien drenado (compost + arena gruesa). Pierde hojas en invierno."
                : "Ubicala al sol pleno en grupo de 2 o 3 ejemplares para que las hembras la encuentren rápido.",
    });
  }

  // Siempre sumar la comodín nectarífera si no está ya en la lista
  if (!lista.some((p) => p.nombreCientifico === "Austroeupatorium inulifolium")) {
    lista.push({
      nombreComun: "Mariposera blanca",
      nombreCientifico: "Austroeupatorium inulifolium",
      rol: "doble",
      paraQueMariposa: "Imán de néctar + hospedera de Perezosa común",
      tipCultivo:
        "La planta comodín de Candelaria: panículas blancas perfumadas entre febrero y mayo que convocan decenas de especies.",
    });
  }

  // Nectarífera complementaria según espacio/zona
  if (espacioId === "balcon") {
    lista.push({
      nombreComun: "Verbena alta + Clavel del aire",
      nombreCientifico: "Verbena bonariensis · Tillandsia aeranthos",
      rol: "doble",
      paraQueMariposa: "Néctar prolongado + Claudina y Frotadora gris",
      tipCultivo:
        "La verbena florece meses en maceta y el clavel del aire crece colgado sin ocupar espacio en el piso.",
    });
  } else if (zonaId === "canelones-costa" || zonaId === "maldonado-este") {
    lista.push({
      nombreComun: "Margarita punzó y Lantana nativa",
      nombreCientifico: "Glandularia peruviana · Lantana montevidensis",
      rol: "nectarifera",
      paraQueMariposa: "Néctar casi todo el año (sol y brisa costera)",
      tipCultivo:
        "Tapizantes resistentes al sol fuerte y la sequía; ofrecen plataformas planas de aterrizaje para las mariposas.",
    });
  } else {
    lista.push({
      nombreComun: "Lantana nativa y Verbena alta",
      nombreCientifico: "Lantana montevidensis · Verbena bonariensis",
      rol: "nectarifera",
      paraQueMariposa: "Néctar continuo primavera–otoño + hospedera de Claudina",
      tipCultivo:
        "Elegí siempre lantanas nativas (montevidensis o megapotamica), evitando Lantana camara que es exótica.",
    });
  }

  if (espacioId === "chacra-escuela") {
    lista.push({
      nombreComun:
        zonaId === "interior"
          ? "Chircas y Espinillo"
          : "Chircas, Carqueja y Gramíneas nativas",
      nombreCientifico:
        zonaId === "interior"
          ? "Baccharis spp. · Vachellia caven"
          : "Baccharis spp. · Paspalum · Nassella",
      rol: "doble",
      paraQueMariposa:
        zonaId === "interior"
          ? "Néctar masivo, Danzarina y polinizadores nativos"
          : "Refugio invernal, cortaviento y polilla de las chircas",
      tipCultivo:
        "Si ya crecen solas en tu predio, no las cortes: son aliadas rápidas que sostienen todo el corredor biológico.",
    });
  }

  return lista;
}

function armarConsejosEspacio(zona: ZonaOption, espacio: EspacioOption): string[] {
  const base: Record<EspacioId, string[]> = {
    balcon: [
      "Usá macetas profundas (mínimo 25–30 cm) con muy buen drenaje, compost maduro y arena gruesa para que no se encharquen.",
      "Agrupá las macetas juntas en la zona más soleada (orientación norte–noreste, buscando al menos 6 hs de sol directo).",
      "Poné un platito playo de terracota con arena y tierra húmeda al sol (barro mineral) y una piedra plana oscura para que calienten las alas.",
    ],
    "patio-chico": [
      "Aprovechá muros, cercos o rejas para el mburucuyá y reservá un cantero soleado con manchas de 2–3 plantas de la misma especie.",
      "Cubrí el suelo del cantero con hojarasca o mulch orgánico en vez de barrerlo: retiene humedad, nutre la tierra y da refugio a crisálidas.",
      "Escaloná floraciones (por ejemplo cedrón de monte o cambará para salida del invierno + verbena y mariposera en verano–otoño).",
    ],
    "jardin-grande": [
      "Dejá el césped corto solo donde caminás o jugás; convertí bordes y rincones soleados en manchas irregulares (ideal ~1 m² por especie).",
      "Diseñá en capas: árboles nativos (coronilla o tala), arbustos (sen del campo, mariposera), herbáceas (yerba de la víbora, verbena) y gramíneas.",
      "Sumá un rincón sin podar en otoño–invierno y un plato de barro mineral al sol para machos de mariposas.",
    ],
    "chacra-escuela": [
      "Conservá chircales y dejá franjas de pastizal sin cortar al ras: el banco natural de semillas despierta biodiversidad en pocos meses.",
      "Armá cercos vivos con nativas y gramíneas para crear microclimas protegidos del viento, y plantá árboles multi-hospederos como tala y coronilla.",
      "En escuelas o huertas comunitarias, identificá las hospederas con cartelitos para que niños y vecinos observen el ciclo completo sin miedo a las orugas.",
    ],
  };

  return [...base[espacio.id], zona.notaClima];
}

export function buildWhatsAppLink(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_CEUTA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

export function buildResultadoPersonalizado(
  zonaId: ZonaId,
  espacioId: EspacioId,
  estadoId: EstadoActualId
): ResultadoGuia {
  const zona = ZONAS.find((z) => z.id === zonaId) ?? ZONAS[0];
  const espacio = ESPACIOS.find((e) => e.id === espacioId) ?? ESPACIOS[0];
  const estado =
    ESTADOS_ACTUALES.find((s) => s.id === estadoId) ?? ESTADOS_ACTUALES[0];

  const mariposas = seleccionarMariposas(zona.id, espacio.id);
  const plantasClave = armarPlantasClave(zona.id, espacio.id, mariposas);
  const consejosEspacio = armarConsejosEspacio(zona, espacio);
  const videoPrincipal = VIDEOS_CANDELARIA[espacio.videoRecomendado];

  const whatsappMensaje = `Hola, hice la guía de mariposas en la web. Tengo ${espacio.shortLabel} en ${zona.shortLabel} y quiero mi lista de plantas nativas y saber cómo es el curso con Candelaria.`;
  const whatsappUrl = buildWhatsAppLink(whatsappMensaje);

  const cursoHref = zona.recomiendaSoloVirtual
    ? "/cursos/jardin-de-mariposas?origen=mapa-mariposas&opcion=online"
    : "/cursos/jardin-de-mariposas?origen=mapa-mariposas";

  const cursoBotonLabel = zona.recomiendaSoloVirtual
    ? "Ver el curso 100% online ($3.500)"
    : "Ver el curso completo y fechas";

  return {
    zona,
    espacio,
    estado,
    mariposas,
    plantasClave,
    consejosEspacio,
    videoPrincipal,
    whatsappUrl,
    whatsappMensaje,
    cursoHref,
    cursoBotonLabel,
  };
}
