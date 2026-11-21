/**
 * Viveros de Uruguay para conseguir plantas nativas (lista verificada por el equipo de Ceuta el 21/11/2026,
 * viveros_uruguay.json, solo los marcados verificado: true; Esqueje queda fuera).
 * `nativas: true` marca a los que se dedican a la flora nativa; en los otros conviene consultar antes.
 */

export type GrupoVivero = "Montevideo" | "Canelones" | "Maldonado" | "Rocha y Colonia";

export interface ViveroUruguay {
  nombre: string;
  zona: string;
  departamento: "Maldonado" | "Canelones" | "Montevideo" | "Rocha" | "Colonia";
  grupoFiltro: GrupoVivero;
  especialidad: string;
  instagram: string | null;
  web: string | null;
  telefono: string | null;
  verificado: true;
  nativas?: boolean;
}

const LISTA: ViveroUruguay[] = [
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

const ESPECIALISTAS_EN_NATIVAS = new Set([
  "Psamófila",
  "Vivero Salvaje",
  "Niñarupa Parque y Vivero Nativo",
  "Vivero Guaviyú",
  "Vivero Laguna del Chajá",
  "Vivero del Parque Roosevelt",
  "Vivero Pachamama",
  "Vivero Parati",
  "Vivero del Jardín Botánico de Montevideo",
  "Monte Nativo",
  "Vivero Palán Palán",
  "Vivero Las Cina Cinas",
  "Vivero de Sotobosque",
  "Vivero La Pedrera",
]);

/** Primero los que se dedican a nativas, en el orden de la lista. */
export const VIVEROS_URUGUAY: ViveroUruguay[] = LISTA.map((v) => ({
  ...v,
  nativas: ESPECIALISTAS_EN_NATIVAS.has(v.nombre),
})).sort((a, b) => Number(Boolean(b.nativas)) - Number(Boolean(a.nativas)));

export const GRUPOS_VIVEROS: GrupoVivero[] = ["Montevideo", "Canelones", "Maldonado", "Rocha y Colonia"];
