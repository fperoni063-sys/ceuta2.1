/**
 * Guía interactiva `/tu-jardin-de-mariposas` (versión 2, 21/11/2026).
 *
 * Todo lo botánico sale de la charla gratuita de Candelaria Domínguez (18/11/2026): la transcripción
 * (`post_charla_videos/transcripcion/charla.txt`) y sus láminas. Las frases entre comillas son textuales,
 * con el minuto de la grabación. No se agregan datos que ella no haya dicho.
 */
import { MOMENTOS, type MomentoCharla, type MomentoId, FOTO_JARDIN_CANDELARIA } from "./jardin-mariposas-momentos";

export type ZonaId = "montevideo" | "canelones-costa" | "maldonado-este" | "interior";
export type EspacioId = "balcon" | "patio-chico" | "jardin-grande" | "chacra-escuela";
export type EstadoActualId = "pasto-baldosa" | "flores-vivero" | "muchas-plantas";
export type MariposaId =
  | "monarca"
  | "espejito"
  | "perezosa"
  | "banderaArgentina"
  | "limoncito"
  | "cuatroOjos"
  | "ochenta"
  | "bordeDeOro";

export const WHATSAPP_CEUTA_NUMERO = "59898910715";
export const SITE_GUIDE_URL = "ceuta-cursos.vercel.app/tu-jardin-de-mariposas";
export const CURSO_PATH = "/cursos/jardin-de-mariposas";

const IMG = "https://res.cloudinary.com/dgey83xqy/image/upload";

/** Fotos reales (ninguna hecha con IA). */
export const FOTOS = {
  jardinCandelaria: FOTO_JARDIN_CANDELARIA,
  candelaria: `${IMG}/v1794927971/ceuta/cursos/galeria/jardin-de-mariposas-g01-candelaria.jpg`,
  monarcaVerbena: `${IMG}/v1794928308/ceuta/cursos/galeria/jardin-de-mariposas-g10-monarca-verbena.jpg`,
  orugaMonarca: `${IMG}/v1794928307/ceuta/cursos/galeria/jardin-de-mariposas-g09-oruga-monarca.jpg`,
  poneHuevos: `${IMG}/v1794928302/ceuta/cursos/galeria/jardin-de-mariposas-g07-pone-huevos.jpg`,
  jardinNativas: `${IMG}/v1794928293/ceuta/cursos/galeria/jardin-de-mariposas-g03-jardin-nativas.jpg`,
  canteroPractica: `${IMG}/v1794928300/ceuta/cursos/galeria/jardin-de-mariposas-g05-cantero-practica.jpg`,
  og: `${IMG}/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/v1795267196/ceuta/tu-jardin-mariposas/og-mariposas-vuelo.jpg`,
  // Especies: licencias libres para uso comercial, comprobadas en la fuente el 21/11/2026 (FOTOS_ESPECIES_PARA_CLAUDE.md).
  espejito: `${IMG}/v1795273684/ceuta/tu-jardin-mariposas/especies/espejito.jpg`,
  banderaArgentina: `${IMG}/v1795273688/ceuta/tu-jardin-mariposas/especies/bandera-argentina.jpg`,
  banderaArgentinaOrugas: `${IMG}/v1795273691/ceuta/tu-jardin-mariposas/especies/bandera-argentina-orugas.jpg`,
  bordeDeOro: `${IMG}/v1795273693/ceuta/tu-jardin-mariposas/especies/borde-de-oro.jpg`,
  limoncito: `${IMG}/v1795273696/ceuta/tu-jardin-mariposas/especies/limoncito.jpg`,
  ochenta: `${IMG}/v1795273698/ceuta/tu-jardin-mariposas/especies/ochenta.jpg`,
  perezosa: `${IMG}/v1795273701/ceuta/tu-jardin-mariposas/especies/perezosa.jpg`,
  asclepiaRoja: `${IMG}/v1795273704/ceuta/tu-jardin-mariposas/especies/asclepia-roja.jpg`,
  yerbaDeLaVibora: `${IMG}/v1795273707/ceuta/tu-jardin-mariposas/especies/yerba-de-la-vibora.jpg`,
} as const;

/** Foto con su crédito: las de licencia libre llevan autor, licencia y enlace a la fuente. */
export interface FotoConCredito {
  url: string;
  alt: string;
  credito?: string;
  fuente?: string;
}

/** «Esta no, esta sí»: la asclepia que se vende para la monarca y la nativa que hay que pedir. */
export const ASCLEPIAS: Record<"no" | "si", FotoConCredito & { nombre: string; cientifico: string; nota: string }> = {
  no: {
    url: FOTOS.asclepiaRoja,
    alt: "Asclepia roja y amarilla (Asclepias curassavica), la exótica que se vende para la monarca",
    credito: "Foto: James St. John · CC BY 2.0 (Wikimedia Commons)",
    fuente: "https://commons.wikimedia.org/wiki/File:Asclepias_curassavica_(bloodflower)_1_(26056089288).jpg",
    nombre: "Asclepia roja y naranja",
    cientifico: "Asclepias curassavica",
    nota: "Exótica. No pierde las hojas en invierno y confunde a la monarca.",
  },
  si: {
    url: FOTOS.yerbaDeLaVibora,
    alt: "Yerba de la víbora (Asclepias mellodora), la nativa de flor blanca",
    credito: "Foto: Candela Castro · CC BY 4.0 (iNaturalist)",
    fuente: "https://www.inaturalist.org/observations/140923292",
    nombre: "Yerba de la víbora",
    cientifico: "Asclepias mellodora",
    nota: "Nativa, de flor blanca. Pierde las hojas en invierno, como tiene que ser.",
  },
};

/** Achica una foto de Cloudinary (formato y calidad automáticos) para no gastar datos en el celular. */
export function cld(url: string, w: number, h?: number): string {
  const t = h ? `c_fill,g_auto,w_${w},h_${h},q_auto,f_auto` : `c_limit,w_${w},q_auto,f_auto`;
  return url.replace("/image/upload/", `/image/upload/${t}/`);
}

export interface ZonaOption {
  id: ZonaId;
  label: string;
  detalle: string;
  /** cómo se nombra en el mensaje de WhatsApp */
  enTexto: string;
  grupoViveros: "Montevideo" | "Canelones" | "Maldonado" | "Rocha y Colonia" | null;
  notaLugar: string;
  practicaCerca: boolean;
}

export const ZONAS: ZonaOption[] = [
  {
    id: "montevideo",
    label: "Montevideo",
    detalle: "Ciudad, barrios y periferia",
    enTexto: "Montevideo",
    grupoViveros: "Montevideo",
    notaLugar:
      "En la ciudad, una avenida o una manzana sin plantas nativas es una barrera para una mariposa chica. Cada balcón o patio con nativas es un escalón entre los parques y la costa.",
    practicaCerca: false,
  },
  {
    id: "canelones-costa",
    label: "Canelones",
    detalle: "Ciudad de la Costa, Costa de Oro y el resto",
    enTexto: "Canelones",
    grupoViveros: "Canelones",
    notaLugar:
      "Si estás cerca de la costa, Candelaria recomienda especies adaptadas a los suelos arenosos y a la brisa salina, como la coronilla y la carqueja.",
    practicaCerca: false,
  },
  {
    id: "maldonado-este",
    label: "Maldonado o Rocha",
    detalle: "Piriápolis, Punta, San Carlos, la costa este",
    enTexto: "Maldonado o Rocha",
    grupoViveros: "Maldonado",
    notaLugar:
      "Cerca de la costa, Candelaria recomienda especies adaptadas a los suelos arenosos y a la brisa salina, como la coronilla y la carqueja. Y la práctica del curso es en tu zona, en Granja Mandala.",
    practicaCerca: true,
  },
  {
    id: "interior",
    label: "Resto del país",
    detalle: "Litoral, centro, norte, Colonia, sierras",
    enTexto: "el interior",
    grupoViveros: null,
    notaLugar:
      "Si tenés campo, no cortes la chirca: Candelaria la llama «un tremendo imán de néctar». Y el curso se puede hacer entero por Zoom.",
    practicaCerca: false,
  },
];

export interface EspacioOption {
  id: EspacioId;
  label: string;
  detalle: string;
  enTexto: string;
  tituloPlan: string;
  momento: MomentoId;
}

export const ESPACIOS: EspacioOption[] = [
  {
    id: "balcon",
    label: "Balcón o macetas",
    detalle: "Terraza, ventana o patio de baldosas",
    enTexto: "un balcón con macetas",
    tituloPlan: "tu balcón",
    momento: "cualquier-escala",
  },
  {
    id: "patio-chico",
    label: "Patio chico",
    detalle: "Un cantero, el frente o el fondo",
    enTexto: "un patio chico",
    tituloPlan: "tu patio",
    momento: "manchas-faro",
  },
  {
    id: "jardin-grande",
    label: "Jardín grande",
    detalle: "Terreno con pasto, casa de balneario",
    enTexto: "un jardín grande",
    tituloPlan: "tu jardín",
    momento: "nadie-juega-al-golf",
  },
  {
    id: "chacra-escuela",
    label: "Campo, chacra o escuela",
    detalle: "Predio grande, huerta o espacio educativo",
    enTexto: "un campo, chacra o escuela",
    tituloPlan: "tu campo",
    momento: "el-mayor-premio",
  },
];

export interface EstadoActualOption {
  id: EstadoActualId;
  label: string;
  detalle: string;
  enTexto: string;
  diagnostico: string;
  explicacion: string;
  /** frase textual de Candelaria que sostiene el diagnóstico */
  cita: { texto: string; minuto: string };
  primerPaso: string;
  momento: MomentoId;
}

export const ESTADOS: EstadoActualOption[] = [
  {
    id: "pasto-baldosa",
    label: "Pasto o baldosa",
    detalle: "Césped cortito, cemento o tierra pelada",
    enTexto: "hoy es solo pasto o baldosa",
    diagnostico: "Hoy, para una mariposa, es un desierto",
    explicacion:
      "El pasto cortado al ras y el cemento no le dan nada: ni néctar, ni hojas donde poner huevos, ni refugio. La buena noticia es que con poco ya cambia.",
    cita: {
      texto: "Si cada uno de nosotros se va de esta clase con la idea de colocar dos, tres plantitas, ya estamos contribuyendo a generar un cambio positivo.",
      minuto: "14:50",
    },
    primerPaso:
      "Elegí el rincón con más sol y empezá ahí con dos plantas: la hospedera de una de tus mariposas y la mariposera.",
    momento: "dos-tres-plantitas",
  },
  {
    id: "flores-vivero",
    label: "Algunas flores",
    detalle: "Plantas lindas, pero las mariposas pasan y se van",
    enTexto: "hoy tiene algunas flores de vivero",
    diagnostico: "Tenés un comedor de paso",
    explicacion:
      "Las flores les dan de comer a las mariposas adultas, pero sus orugas solo pueden comer plantas puntuales: las hospederas. Sin ellas, la mariposa liba y sigue de largo.",
    cita: {
      texto: "Si nosotros solamente sembramos flores, vamos a tener un comedor de paso.",
      minuto: "44:54",
    },
    primerPaso:
      "Dejá lo que tenés y sumá al lado la hospedera de una de tus mariposas. Así el comedor pasa a ser su casa.",
    momento: "comedor-de-paso",
  },
  {
    id: "muchas-plantas",
    label: "Muchas plantas, pocas mariposas",
    detalle: "Hay verde, pero casi no hay movimiento",
    enTexto: "hoy tiene muchas plantas pero pocas mariposas",
    diagnostico: "Hay verde, pero falta su casa",
    explicacion:
      "Suele pasar por tres cosas: plantas que sus orugas no reconocen, plantas sueltas en vez de agrupadas, o podas y limpiezas en otoño e invierno que se llevan huevos y crisálidas.",
    cita: {
      texto: "Sobre esos tallos secos y ramas que parecen inactivos descansan huevos, orugas hibernantes y crisálidas camufladas.",
      minuto: "1:30:41",
    },
    primerPaso:
      "No apliques nada, sumá hospederas agrupadas en manchas de la misma especie y, cuando llegue el otoño, no podes ni barras todo.",
    momento: "hojas-comidas",
  },
];

export interface Planta {
  nombre: string;
  cientifico: string;
}

export interface MariposaEspecie {
  id: MariposaId;
  nombre: string;
  cientifico: string;
  /** dónde nace: las plantas que comen sus orugas */
  hospederas: Planta[];
  /** qué come de adulta */
  nectar: string[];
  /** lo que dijo Candelaria de ella, textual */
  cita: { texto: string; minuto: string };
  foto?: FotoConCredito;
  /** su oruga, en chiquito sobre la foto: el que la reconoce no la fumiga */
  oruga?: FotoConCredito;
  /** colores de las alas, para la ficha cuando no hay foto */
  colores: [string, string, string];
}

export const MARIPOSAS: Record<MariposaId, MariposaEspecie> = {
  monarca: {
    id: "monarca",
    nombre: "Monarca del sur",
    cientifico: "Danaus erippus",
    hospederas: [
      { nombre: "Yerba de la víbora", cientifico: "Asclepias mellodora" },
      { nombre: "Plumerillo negro", cientifico: "Oxypetalum solanoides" },
      { nombre: "Tasí", cientifico: "Araujia sericifera" },
    ],
    nectar: ["Mariposera", "Lantana nativa", "Verbena"],
    cita: {
      texto: "Sus orugas se alimentan exclusivamente de apocináceas nativas, como la yerba de la víbora, el plumerillo y el tasí.",
      minuto: "1:03:48",
    },
    foto: { url: FOTOS.monarcaVerbena, alt: "Mariposa monarca sobre flores violetas de verbena" },
    oruga: { url: FOTOS.orugaMonarca, alt: "Oruga de monarca, con rayas negras, amarillas y blancas" },
    colores: ["#d9661c", "#1d1a17", "#f4e2c4"],
  },
  espejito: {
    id: "espejito",
    nombre: "Espejito",
    cientifico: "Dione vanillae maculosa",
    hospederas: [
      { nombre: "Mburucuyá", cientifico: "Passiflora caerulea" },
      { nombre: "Mburucuyá mini", cientifico: "Passiflora misera" },
    ],
    nectar: ["Lantana nativa", "Verbena", "Mariposera"],
    cita: {
      texto: "Una oruga de mariposa espejito solamente puede comer pasiflora. Si la ponemos arriba de rosales, se va a morir de hambre.",
      minuto: "44:34",
    },
    foto: {
      url: FOTOS.espejito,
      alt: "Mariposa espejito con las alas abiertas sobre una flor",
      credito: "Foto: André Koehne · CC BY-SA 4.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Dione_vanillae_in_Caetit%C3%A9.jpg",
    },
    colores: ["#e2681a", "#2b1a10", "#e9eef0"],
  },
  perezosa: {
    id: "perezosa",
    nombre: "Perezosa común",
    cientifico: "Actinote pellenea",
    hospederas: [{ nombre: "Mariposera blanca", cientifico: "Austroeupatorium inulifolium" }],
    nectar: ["Mariposera", "Verbena", "Lantana nativa"],
    cita: {
      texto: "Si tengo poco espacio, poca posibilidad de poner otras cosas, es con esta: me sirve para traer todas las mariposas y a su vez es hospedera de una.",
      minuto: "54:50",
    },
    foto: {
      url: FOTOS.perezosa,
      alt: "Dos mariposas perezosas comunes sobre flores",
      credito: "Foto: Cláudio Dias Timm · CC BY-SA 2.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Actinote_pellenea.jpg",
    },
    colores: ["#c8762a", "#2b221b", "#f0d99a"],
  },
  banderaArgentina: {
    id: "banderaArgentina",
    nombre: "Bandera argentina",
    cientifico: "Morpho epistrophus argentinus",
    hospederas: [
      { nombre: "Coronilla", cientifico: "Scutia buxifolia" },
      { nombre: "Yerba de bugre", cientifico: "Lonchocarpus nitidus" },
      { nombre: "Ingá", cientifico: "Inga uraguensis" },
    ],
    nectar: ["Flores del ingá", "Chircas"],
    cita: {
      texto: "Ver este racimo rojo en una coronilla es el mayor premio que podemos recibir en un jardín.",
      minuto: "42:52",
    },
    foto: {
      url: FOTOS.banderaArgentina,
      alt: "Mariposa bandera argentina, celeste perlado, posada entre hojas",
      credito: "Foto: CHUCAO · CC BY-SA 3.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Morpho_epistrophus_argentinus.JPG",
    },
    oruga: {
      url: FOTOS.banderaArgentinaOrugas,
      alt: "Racimo rojo de orugas de bandera argentina sobre una coronilla, en Rocha",
      credito: "Oruga: Kristof Zyskowski y Yulia Bereshpolova · CC BY 2.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Morpho_epistrophus_argentinus_(day-roost_cluster_of_gregarious_larvae)_2.jpg",
    },
    colores: ["#cfe6f2", "#6aa3bf", "#2b3d4f"],
  },
  limoncito: {
    id: "limoncito",
    nombre: "Limoncito y azufrada",
    cientifico: "Eurema y Phoebis",
    hospederas: [{ nombre: "Sen del campo", cientifico: "Senna corymbosa" }],
    nectar: ["Mariposera", "Lantana nativa", "Margarita punzó"],
    cita: {
      texto: "El sen del campo tiene una floración amarilla, un amarillo oro bien estridente, en verano y en otoño, y es hospedera de la mariposa limoncito y azufrada.",
      minuto: "55:06",
    },
    foto: {
      url: FOTOS.limoncito,
      alt: "Mariposa azufrada amarilla libando en flores rojas",
      credito: "Foto: Charles J. Sharp · CC BY-SA 4.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Cloudless_sulphur_(Phoebis_sennae_sennae)_male_underside.JPG",
    },
    colores: ["#f0cf22", "#4b6a3a", "#fff3b0"],
  },
  cuatroOjos: {
    id: "cuatroOjos",
    nombre: "Cuatro ojos o pavo real",
    cientifico: "Junonia genoveva",
    hospederas: [
      { nombre: "Marcela", cientifico: "Achyrocline satureioides" },
      { nombre: "Peludilla", cientifico: "Gamochaeta" },
    ],
    nectar: ["Mariposera", "Margarita punzó", "Verbena"],
    cita: {
      texto: "La marcela, con la que hacemos el té, y la peludilla son herbáceas de pradera que son hospederas de la cuatro ojos y de la dama pintada.",
      minuto: "58:53",
    },
    foto: {
      url: FOTO_JARDIN_CANDELARIA,
      alt: "Mariposa cuatro ojos sobre las flores blancas de la mariposera, en el jardín de Candelaria",
      credito: "Foto de Candelaria en su jardín",
    },
    colores: ["#8d5f39", "#2c6aae", "#e4b65a"],
  },
  ochenta: {
    id: "ochenta",
    nombre: "Ochenta",
    cientifico: "Diaethria candrena",
    hospederas: [{ nombre: "Tala", cientifico: "Celtis tala" }],
    nectar: ["Mariposera", "Chircas"],
    cita: {
      texto: "El tala es un árbol emblemático, hospedero múltiple: del zafiro del talar, de la mariposa picuda, de la ochenta.",
      minuto: "50:44",
    },
    foto: {
      url: FOTOS.ochenta,
      alt: "Mariposa ochenta, con el número dibujado en el ala",
      credito: "Foto: Cecilia Fer Díaz · CC BY 4.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Diaethria_candrena_621612352.jpg",
    },
    colores: ["#1d4e89", "#c3403a", "#f4f3ee"],
  },
  bordeDeOro: {
    id: "bordeDeOro",
    nombre: "Borde de oro",
    cientifico: "Battus polydamas",
    hospederas: [{ nombre: "Mil hombres", cientifico: "Aristolochia fimbriata" }],
    nectar: ["Lantana nativa", "Verbena", "Mariposera"],
    cita: {
      texto: "La borde de oro y la viuda del monte están vinculadas estrictamente al género de las aristoloquias.",
      minuto: "1:05:27",
    },
    foto: {
      url: FOTOS.bordeDeOro,
      alt: "Mariposa borde de oro, negra con una banda dorada, con las alas abiertas",
      credito: "Foto: Charles J. Sharp · CC BY-SA 4.0 (Wikimedia Commons)",
      fuente: "https://commons.wikimedia.org/wiki/File:Gold_rim_swallowtail_(Battus_polydamas_polydamas).jpg",
    },
    colores: ["#1f2421", "#e2b528", "#4a5946"],
  },
};

/** Qué tres mariposas le tocan según el espacio (y la zona, para el interior). */
function elegirMariposas(zona: ZonaId, espacio: EspacioId): [MariposaId, MariposaId, MariposaId] {
  switch (espacio) {
    case "balcon":
      return ["espejito", "monarca", "perezosa"];
    case "patio-chico":
      return ["espejito", "monarca", "limoncito"];
    case "jardin-grande":
      return zona === "interior" ? ["ochenta", "limoncito", "cuatroOjos"] : ["banderaArgentina", "limoncito", "cuatroOjos"];
    case "chacra-escuela":
    default:
      return ["banderaArgentina", "ochenta", "bordeDeOro"];
  }
}

export interface PlantaPlan {
  nombre: string;
  cientifico: string;
  para: string;
  tipo: "hospedera" | "nectar" | "las-dos";
  nota?: string;
}

function armarPlantas(espacio: EspacioId, mariposas: MariposaEspecie[]): PlantaPlan[] {
  const lista: PlantaPlan[] = [];
  for (const m of mariposas) {
    const h = m.hospederas[0];
    lista.push({
      nombre: h.nombre,
      cientifico: h.cientifico,
      para: m.nombre,
      tipo: m.id === "perezosa" ? "las-dos" : "hospedera",
      nota:
        m.id === "espejito" && espacio === "balcon"
          ? "En maceta grande, con algo donde trepar: una baranda o un tutor."
          : m.id === "banderaArgentina"
            ? "Árbol de crecimiento lento: para donde haya lugar."
            : m.id === "perezosa"
              ? "La «planta estrella» de Candelaria: florece de febrero a mayo."
              : undefined,
    });
  }
  if (!lista.some((p) => p.cientifico === "Austroeupatorium inulifolium")) {
    lista.push({
      nombre: "Mariposera blanca",
      cientifico: "Austroeupatorium inulifolium",
      para: "decenas de mariposas",
      tipo: "las-dos",
      nota: "La «planta estrella» de Candelaria: florece de febrero a mayo.",
    });
  }
  lista.push({
    nombre: "Lantana nativa y verbena",
    cientifico: "Lantana montevidensis · Verbena bonariensis",
    para: "néctar casi todo el año",
    tipo: "nectar",
    nota: "Ojo: la Lantana camara es exótica. Pedí la montevidensis o la megapotamica.",
  });
  return lista;
}

export interface ResultadoGuia {
  zona: ZonaOption;
  espacio: EspacioOption;
  estado: EstadoActualOption;
  mariposas: MariposaEspecie[];
  plantas: PlantaPlan[];
  momentoPrincipal: MomentoCharla;
  momentoSegundo: MomentoCharla;
}

export function armarResultado(zonaId: ZonaId, espacioId: EspacioId, estadoId: EstadoActualId): ResultadoGuia {
  const zona = ZONAS.find((z) => z.id === zonaId) ?? ZONAS[0];
  const espacio = ESPACIOS.find((e) => e.id === espacioId) ?? ESPACIOS[0];
  const estado = ESTADOS.find((s) => s.id === estadoId) ?? ESTADOS[0];
  const mariposas = elegirMariposas(zona.id, espacio.id).map((id) => MARIPOSAS[id]);
  const plantas = armarPlantas(espacio.id, mariposas);
  const principal = MOMENTOS[estado.momento];
  let segundo = MOMENTOS[espacio.momento];
  if (segundo.id === principal.id) segundo = MOMENTOS["la-planta-estrella"];
  return { zona, espacio, estado, mariposas, plantas, momentoPrincipal: principal, momentoSegundo: segundo };
}

/** Limpia el ?origen= del enlace para poder reenviarlo sin romper nada. */
export function limpiarOrigen(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const o = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  return o || null;
}

function fraseOrigen(origen: string | null): string {
  if (!origen) return "";
  if (origen.startsWith("ig") || origen.includes("instagram")) return " Lo vi en Instagram.";
  if (origen.startsWith("fb") || origen.includes("facebook")) return " Lo vi en Facebook.";
  return "";
}

function unir(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export function buildWhatsAppLink(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_CEUTA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

/** El mensaje que queda escrito en el WhatsApp de la persona: también le sirve como lista guardada. */
export function mensajeResultado(r: ResultadoGuia, origen: string | null): string {
  const mariposas = unir(r.mariposas.map((m) => `la ${m.nombre.toLowerCase()}`));
  const plantas = unir(
    r.plantas
      .filter((p) => p.tipo !== "nectar")
      .slice(0, 4)
      .map((p) => p.nombre.toLowerCase())
  );
  return (
    `Hola, hice la guía de mariposas en la web. Tengo ${r.espacio.enTexto} en ${r.zona.enTexto} y ${r.estado.enTexto}. ` +
    `Me salieron ${mariposas}, con ${plantas}. Quiero saber cómo es el curso con Candelaria.` +
    fraseOrigen(origen)
  );
}

export function mensajeGeneral(origen: string | null): string {
  return `Hola, estoy viendo la guía de mariposas en la web y quiero saber cómo es el curso con Candelaria.${fraseOrigen(origen)}`;
}

export function mensajeDeADos(origen: string | null): string {
  return `Hola, queremos anotarnos de a dos al curso de jardín de mariposas con Candelaria. ¿Cómo hacemos para el 10% de los dos?${fraseOrigen(origen)}`;
}

export function enlaceCurso(origen: string | null, soloVirtual = false): string {
  const o = origen ? `guia-${origen}` : "guia";
  return `${CURSO_PATH}?origen=${encodeURIComponent(o)}${soloVirtual ? "&opcion=online" : ""}`;
}

export const CURSO = {
  nombre: "Jardines biodiversos: tu jardín de mariposas",
  docente: "Candelaria Domínguez",
  credencial:
    "Licenciada en Diseño de Paisaje (UdelaR), con maestrías en proyectos ambientales y en manejo costero.",
  clases: [
    { fecha: "Miércoles 25/11", tema: "Leer tu lugar: el suelo, el sol, el agua y lo que ya crece. Cómo preparar la tierra." },
    { fecha: "Miércoles 2/12", tema: "Hospederas y nectaríferas: qué plantar, en qué capas y cómo tener flores casi todo el año. También en macetas." },
    { fecha: "Miércoles 9/12", tema: "Que se queden: el ciclo de la oruga a la mariposa, y un jardín para disfrutar." },
  ],
  horario: "De 19:00 a 21:00 por Zoom. Si un miércoles no podés, la clase queda grabada.",
  practica:
    "Sábado 12/12, de 9:30 a 13:30, en Granja Mandala (Camino de los Ceibos, Maldonado): armamos entre todos un cantero de mariposas desde cero. Hasta 30 lugares.",
  grupo: "Un grupo de WhatsApp para hacer preguntas entre clase y clase.",
  precios: { completo: 4000, soloVirtual: 3500, deADosCompleto: 3600, deADosVirtual: 3150 },
} as const;

/** En qué momento de la inscripción estamos, en hora de Uruguay (UTC-3). */
export type FaseInscripcion = "abierta" | "por-arrancar" | "reenganche" | "cerrada";

export function faseInscripcion(ahora: Date = new Date()): FaseInscripcion {
  const t = ahora.getTime();
  const uy = (iso: string) => new Date(`${iso}-03:00`).getTime();
  if (t < uy("2026-11-24T00:00:00")) return "abierta";
  if (t < uy("2026-11-25T19:00:00")) return "por-arrancar";
  if (t < uy("2026-12-02T19:00:00")) return "reenganche";
  return "cerrada";
}

/** Lo que escribieron después de la charla (textual, sin nombre, foto ni teléfono). */
export const TESTIMONIOS = [
  "Me gustó el «encare», convencimiento y decisión de Candelaria, además de todo lo que demuestra saber.",
  "Quedé muy agradecida y motivada, entendí por qué no es lo mismo una planta que otra. Me puse a buscar y ya encontré que ofrecían la planta equivocada para las mariposas.",
  "Me encantó la charla, sirvió para despejar muchas dudas y confirmar otras.",
  "La charla fue muy buena, me encantó. Fue de mucha información muy interesante y útil.",
] as const;
