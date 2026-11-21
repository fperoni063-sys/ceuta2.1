/**
 * Momentos recortados de la charla gratuita de Candelaria Domínguez (miércoles 18/11/2026, Zoom).
 * Cada recorte es continuo: no se editó ni se cambió nada de lo que ella dice.
 * Subtítulos tomados de la transcripción de la charla, con los errores de la transcripción automática corregidos.
 * Videos de 960 x 540, entre 0,6 y 3 MB, en Cloudinary (nunca en /public).
 */

export type MomentoId =
  | "comedor-de-paso"
  | "planta-de-la-monarca"
  | "el-mayor-premio"
  | "la-planta-estrella"
  | "nadie-juega-al-golf"
  | "cualquier-escala"
  | "dos-tres-plantitas"
  | "hojas-comidas"
  | "manchas-faro"
  | "el-curso";

export interface Subtitulo {
  /** segundos desde el inicio del recorte */
  s: number;
  e: number;
  t: string;
}

export interface MomentoCharla {
  id: MomentoId;
  titulo: string;
  bajada: string;
  /** minuto de la grabación completa, para el que quiera verla entera */
  minuto: string;
  duracion: number;
  video: string;
  poster: string;
  subtitulos: Subtitulo[];
}

const V = "https://res.cloudinary.com/dgey83xqy/video/upload";
const I = "https://res.cloudinary.com/dgey83xqy/image/upload";

export const GRABACION_CHARLA_URL =
  "https://drive.google.com/drive/folders/1V2iXp2eVAg8hySxcdrYRJzmg-GfnzwF7";

export const FOTO_JARDIN_CANDELARIA = `${I}/v1795270170/ceuta/tu-jardin-mariposas/charla/jardin-candelaria-cuatro-ojos.jpg`;

export const MOMENTOS: Record<MomentoId, MomentoCharla> = {
  "comedor-de-paso": {
    id: "comedor-de-paso",
    titulo: "Con flores solas, tu jardín es un comedor de paso",
    bajada: "Por qué la mariposa come y se va, y qué hace que se quede.",
    minuto: "44:30",
    duracion: 46,
    video: `${V}/v1795269302/ceuta/tu-jardin-mariposas/charla/comedor-de-paso.mp4`,
    poster: `${I}/v1795269300/ceuta/tu-jardin-mariposas/charla/comedor-de-paso-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 5.2, t: "Por eso la dieta de la oruga es ultra mega específica." },
      { s: 5.3, e: 8.1, t: "Una oruga de mariposa espejito, por ejemplo," },
      { s: 8.1, e: 10.6, t: "solamente puede comer pasiflora," },
      { s: 10.7, e: 13.6, t: "que es la pasiflora del mburucuyá." },
      { s: 13.7, e: 18.1, t: "Lo conocemos todos: tiene una flor divinísima y un fruto rico también." },
      { s: 18.1, e: 23.2, t: "Y si la ponemos arriba de rosales, la misma oruga se va a morir de hambre." },
      { s: 23.2, e: 24.8, t: "No va a poder comer eso." },
      { s: 24.8, e: 28.0, t: "Si nosotros solamente sembramos flores," },
      { s: 28.0, e: 30.1, t: "vamos a tener un comedor de paso." },
      { s: 30.1, e: 36.6, t: "O sea, la mariposa va a pasar, va a libar en esa flor y va a seguir de largo." },
      { s: 36.6, e: 41.1, t: "Pero si nosotros sembramos las plantas hospederas," },
      { s: 41.1, e: 46.0, t: "nuestro jardín se va a convertir en el territorio reproductivo de esa especie." },
    ],
  },
  "planta-de-la-monarca": {
    id: "planta-de-la-monarca",
    titulo: "La planta «de la monarca» que la enferma",
    bajada: "La asclepia roja y naranja que se vende en viveros es exótica.",
    minuto: "48:07",
    duracion: 81,
    video: `${V}/v1795269338/ceuta/tu-jardin-mariposas/charla/planta-de-la-monarca.mp4`,
    poster: `${I}/v1795269334/ceuta/tu-jardin-mariposas/charla/planta-de-la-monarca-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 8.3, t: "Un ejemplo de esto es la Asclepias curassavica, que es una exótica," },
      { s: 8.4, e: 13.1, t: "que es esta que vemos roja con naranja," },
      { s: 13.1, e: 18.5, t: "y que se vende mucho como «ah, esta es la de la mariposa monarca»." },
      { s: 18.6, e: 21.5, t: "Pero ¿qué pasa con esta?" },
      { s: 21.6, e: 27.1, t: "Es muy vendida en los viveros, y a diferencia de las especies nativas," },
      { s: 27.1, e: 32.2, t: "como la Asclepias mellodora, la de color blanco, que es nuestra nativa," },
      { s: 32.2, e: 35.0, t: "o el Oxypetalum solanoides, que pierden sus hojas en invierno," },
      { s: 35.0, e: 41.7, t: "esta especie tropical mantiene el follaje todo el año en los jardines urbanos protegidos." },
      { s: 41.8, e: 48.8, t: "Y esto lo que genera es que confunde a la mariposa monarca del sur" },
      { s: 48.8, e: 53.4, t: "e impide su diapausa invernal." },
      { s: 53.5, e: 63.1, t: "Esto favorece a su vez la acumulación de un protozoo, un parásito," },
      { s: 63.2, e: 70.9, t: "que causa malformaciones y muerte en las poblaciones." },
      { s: 71.0, e: 77.9, t: "Entonces nosotros pensamos que estamos haciendo un bien, porque ponemos esta planta y vienen un montón de mariposas," },
      { s: 78.0, e: 81.0, t: "pero en realidad no estamos haciendo un bien." },
    ],
  },
  "el-mayor-premio": {
    id: "el-mayor-premio",
    titulo: "El racimo rojo en la coronilla: el mayor premio",
    bajada: "Las orugas de la bandera argentina asustan, pero son inofensivas.",
    minuto: "41:56",
    duracion: 68,
    video: `${V}/v1795269319/ceuta/tu-jardin-mariposas/charla/el-mayor-premio.mp4`,
    poster: `${I}/v1795269315/ceuta/tu-jardin-mariposas/charla/el-mayor-premio-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 5.4, t: "Una particularidad que tiene esta especie, verán ese montoncito de las orugas," },
      { s: 5.5, e: 11.1, t: "es que son una especie gregaria: viven en grupos compactos" },
      { s: 11.2, e: 17.1, t: "de decenas de individuos sobre árboles como la coronilla," },
      { s: 17.2, e: 24.0, t: "y tienen un color rojo intenso y pelos largos, blancos y oscuros, de aspecto muy llamativo." },
      { s: 24.1, e: 32.0, t: "Entonces, cuando la gente la ve, el rojo nos da alerta," },
      { s: 32.1, e: 38.4, t: "la gente se asusta pensando que son gusanos quemadores, que nos van a picar." },
      { s: 38.5, e: 47.6, t: "La realidad es que son completamente inofensivas y no tienen pelos urticantes." },
      { s: 47.7, e: 56.1, t: "Si le hacemos una caricita, que a mí me encanta, son una ternurita, no nos va a pasar nada." },
      { s: 56.2, e: 58.0, t: "Y nunca debemos eliminarlos." },
      { s: 58.1, e: 67.8, t: "Ver este racimo rojo en una coronilla es el mayor premio que podemos recibir en un jardín." },
    ],
  },
  "la-planta-estrella": {
    id: "la-planta-estrella",
    titulo: "Si tenés poco espacio, empezá por la mariposera",
    bajada: "La planta comodín: da casa a una mariposa y comida a decenas.",
    minuto: "54:26",
    duracion: 42,
    video: `${V}/v1795269327/ceuta/tu-jardin-mariposas/charla/la-planta-estrella.mp4`,
    poster: `${I}/v1795269325/ceuta/tu-jardin-mariposas/charla/la-planta-estrella-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 3.0, t: "Esta es la planta estrella." },
      { s: 3.1, e: 5.5, t: "¿Por qué? Porque cumple una doble función." },
      { s: 5.6, e: 11.9, t: "Por un lado, es hospedera de la mariposa perezosa común," },
      { s: 12.0, e: 19.1, t: "y entre febrero y mayo, las grandes panículas blancas que tiene, además de perfumadísimas," },
      { s: 19.2, e: 26.1, t: "atraen decenas de especies de mariposas. Es un imán masivo nectarífero." },
      { s: 26.2, e: 32.3, t: "Entonces, si tengo poco espacio, poca posibilidad de poner otras cosas," },
      { s: 32.4, e: 37.9, t: "es con esta: me sirve para traer todas las mariposas y a su vez es hospedera de una." },
      { s: 38.0, e: 42.0, t: "Es como comodín. Tiene que ir." },
    ],
  },
  "nadie-juega-al-golf": {
    id: "nadie-juega-al-golf",
    titulo: "Nadie juega al golf en el patio de su casa",
    bajada: "Dejá el pasto corto solo donde lo usás.",
    minuto: "1:14:45",
    duracion: 25,
    video: `${V}/v1795269333/ceuta/tu-jardin-mariposas/charla/nadie-juega-al-golf.mp4`,
    poster: `${I}/v1795269331/ceuta/tu-jardin-mariposas/charla/nadie-juega-al-golf-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 3.7, t: "Buscar reducir al mínimo el césped convencional." },
      { s: 3.8, e: 9.5, t: "Limitémonos al césped donde quiero jugar a la pelota con el nene," },
      { s: 9.6, e: 15.7, t: "donde me quiero tirar al pasto a tomar sol, donde quiero andar pisando descalzo." },
      { s: 15.8, e: 20.8, t: "Pero si no lo necesito… nadie juega al golf en el patio de su casa." },
      { s: 20.9, e: 24.7, t: "Entonces no necesitamos tener el pasto cortito, cortito." },
    ],
  },
  "cualquier-escala": {
    id: "cualquier-escala",
    titulo: "En un balcón también se puede",
    bajada: "Macetas en el balcón, el cerco en el patio: sirve a cualquier escala.",
    minuto: "1:16:37",
    duracion: 26,
    video: `${V}/v1795269306/ceuta/tu-jardin-mariposas/charla/cualquier-escala.mp4`,
    poster: `${I}/v1795269304/ceuta/tu-jardin-mariposas/charla/cualquier-escala-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 6.2, t: "Esto de las escalas de aplicación: este modelo se adapta a cualquier escala." },
      { s: 6.3, e: 12.8, t: "En un balcón o terraza podemos hacerlo con macetas, cultivar distintas especies" },
      { s: 12.9, e: 14.6, t: "como las que les puse acá." },
      { s: 14.7, e: 20.8, t: "En un patio doméstico se puede incorporar el cerco." },
      { s: 20.9, e: 25.5, t: "Vamos generando un ecosistema completo en miniatura." },
    ],
  },
  "dos-tres-plantitas": {
    id: "dos-tres-plantitas",
    titulo: "Con dos o tres plantitas ya cambia",
    bajada: "Cada pequeño cambio en tu casa suma, desde un balcón a un patio.",
    minuto: "14:35",
    duracion: 29,
    video: `${V}/v1795269308/ceuta/tu-jardin-mariposas/charla/dos-tres-plantitas.mp4`,
    poster: `${I}/v1795269307/ceuta/tu-jardin-mariposas/charla/dos-tres-plantitas-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 6.9, t: "Cada pequeño cambio que hagamos en nuestras casas," },
      { s: 7.0, e: 10.4, t: "desde un pequeño balcón a un patio, va a generar" },
      { s: 10.4, e: 14.4, t: "un efecto positivo para la biodiversidad." },
      { s: 14.5, e: 21.0, t: "Si cada uno de nosotros se va de esta clase con la idea de colocar" },
      { s: 21.0, e: 29.2, t: "dos, tres plantitas, ya estamos contribuyendo a generar un cambio positivo." },
    ],
  },
  "hojas-comidas": {
    id: "hojas-comidas",
    titulo: "Celebrá las hojas comidas y no podes en invierno",
    bajada: "Dos errores de la jardinería de siempre que espantan a las mariposas.",
    minuto: "1:30:02",
    duracion: 57,
    video: `${V}/v1795269323/ceuta/tu-jardin-mariposas/charla/hojas-comidas.mp4`,
    poster: `${I}/v1795269320/ceuta/tu-jardin-mariposas/charla/hojas-comidas-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 3.4, t: "Aceptar y celebrar las hojas comidas." },
      { s: 3.4, e: 10.9, t: "Cuando vean el mburucuyá, el sen del campo, la coronilla, con las hojas comidas por las orugas," },
      { s: 11.0, e: 13.7, t: "no hay que alarmarse ni aplicar nada." },
      { s: 13.8, e: 18.6, t: "Es la evidencia, la prueba física de que es un éxito lo que está pasando." },
      { s: 18.7, e: 23.0, t: "El jardín está vivo y está cumpliendo el propósito ecológico." },
      { s: 23.0, e: 27.6, t: "Las plantas nativas están adaptadas a eso y rebrotan con fuerza." },
      { s: 27.7, e: 34.2, t: "Lo otro es no podar en otoño ni en invierno." },
      { s: 34.3, e: 39.0, t: "Raro esto que les estoy diciendo, pero es un error grave de la jardinería tradicional." },
      { s: 39.1, e: 48.4, t: "Sobre esos tallos secos y ramas que parecen inactivos descansan huevos, orugas hibernantes y crisálidas camufladas." },
      { s: 48.5, e: 57.3, t: "Entonces esperamos hasta septiembre, octubre, noviembre, para ir haciendo limpiezas suaves." },
    ],
  },
  "manchas-faro": {
    id: "manchas-faro",
    titulo: "Plantá en manchas: un faro para las mariposas",
    bajada: "Por qué las plantas sueltas y dispersas no alcanzan.",
    minuto: "1:13:23",
    duracion: 45,
    video: `${V}/v1795269330/ceuta/tu-jardin-mariposas/charla/manchas-faro.mp4`,
    poster: `${I}/v1795269329/ceuta/tu-jardin-mariposas/charla/manchas-faro-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 4.9, t: "En cuanto a la composición espacial:" },
      { s: 5.0, e: 8.0, t: "no plantar ejemplares sueltos y dispersos." },
      { s: 8.1, e: 13.3, t: "Agrupar varios ejemplares de la misma especie," },
      { s: 13.4, e: 19.7, t: "formar manchas irregulares, al menos un metro cuadrado en lo posible." },
      { s: 19.8, e: 26.8, t: "Si lo que podemos tener es una, bueno, una: hacer algo es mejor que no hacer nada." },
      { s: 26.9, e: 32.8, t: "Esto lo que genera es como crear un faro visual y aromático." },
      { s: 32.9, e: 41.8, t: "La mariposa lo detecta a la distancia y puede alimentarse sin gastar energía volando de un extremo a otro del jardín," },
      { s: 41.9, e: 45.0, t: "porque vieron que la mariposa va posándose y pasa a otra, otra, otra." },
    ],
  },
  "el-curso": {
    id: "el-curso",
    titulo: "Candelaria cuenta el curso, clase por clase",
    bajada: "Lo que se ve en las tres clases y la práctica en Granja Mandala.",
    minuto: "1:33:53",
    duracion: 76,
    video: `${V}/v1795269314/ceuta/tu-jardin-mariposas/charla/el-curso.mp4`,
    poster: `${I}/v1795269309/ceuta/tu-jardin-mariposas/charla/el-curso-poster.jpg`,
    subtitulos: [
      { s: 0.3, e: 5.0, t: "La parte práctica tiene que ver con plantar con sus manos un mini jardín de mariposas." },
      { s: 5.0, e: 11.5, t: "Va a ser en Maldonado: la granja es entre Maldonado y San Carlos." },
      { s: 11.5, e: 20.9, t: "Para quienes estén más lejos, pueden tomar el curso sin la parte práctica." },
      { s: 21.0, e: 26.6, t: "Acá está el cronograma de lo que vamos a ver en cada una de las clases:" },
      { s: 26.7, e: 32.4, t: "ver cómo es el suelo, si el suelo sirve, aprender a leer el asoleamiento," },
      { s: 32.4, e: 39.6, t: "el agua, qué es lo que ya crece, cómo preparar la tierra, dónde van las plantas," },
      { s: 39.6, e: 45.4, t: "cuáles son las nectaríferas, cuáles son las hospederas, qué capas, cómo tener flores casi todo el año," },
      { s: 45.5, e: 51.3, t: "cómo hacerlo también en macetas, porque muchos dicen «ay, pero yo tengo un balconcito, no puedo hacer nada»." },
      { s: 51.4, e: 58.0, t: "Claro que podemos. Cómo hago que se queden las mariposas, entender el ciclo de la oruga y la mariposa," },
      { s: 58.0, e: 66.8, t: "y un jardín para poder disfrutarlo: el jardín tiene doble propósito, es también estético." },
      { s: 66.9, e: 70.4, t: "Lo que vamos a hacer es generar un refugio de biodiversidad para polinizadores." },
      { s: 70.5, e: 76.3, t: "Y en Granja Mandala armamos entre todos un cantero de mariposas desde cero." },
    ],
  },
};
