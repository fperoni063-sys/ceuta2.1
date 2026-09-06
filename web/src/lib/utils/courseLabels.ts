/**
 * Traduce los enums de `cursos` a texto para el cliente.
 *
 * Por qué existe: la ficha imprimía `categoria`, `modalidad` y `nivel` tal como
 * salen de la base, así que lo primero que leía alguien que venía de un anuncio
 * era "ninguno · hibrido · todos_los_niveles", arriba del título del curso.
 *
 * Además de traducir, las etiquetas venden: `basico` no es "Básico" (suena a
 * poco), es "Desde cero" (saca la objeción de "no sé nada del tema").
 */

const NIVELES: Record<string, string> = {
    basico: 'Desde cero',
    principiante: 'Desde cero',
    todos_los_niveles: 'Todos los niveles',
    intermedio: 'Nivel intermedio',
    avanzado: 'Nivel avanzado',
};

const MODALIDADES: Record<string, string> = {
    hibrido: 'Online + prácticas',
    online: '100% online',
    virtual: '100% online',
    presencial: 'Presencial',
    semipresencial: 'Online + prácticas',
};

const CATEGORIAS: Record<string, string> = {
    huerta: 'Huerta',
    energia_renovable: 'Energía renovable',
    bioconstruccion: 'Bioconstrucción',
    permacultura: 'Permacultura',
    cosmetica: 'Cosmética natural',
    hongos: 'Hongos',
    plantas_medicinales: 'Plantas medicinales',
};

/** Valores que en la base significan "sin dato" y no se muestran nunca. */
const VACIOS = new Set(['', 'ninguno', 'ninguna', 'null', 'undefined', 'n/a', '-']);

function normalizar(valor: string | null | undefined): string | null {
    if (!valor) return null;
    const v = valor.trim().toLowerCase();
    if (VACIOS.has(v)) return null;
    return v;
}

/** Convierte un enum desconocido en algo presentable: `algo_raro` -> `Algo raro`. */
function prettify(v: string): string {
    const limpio = v.replace(/[_-]+/g, ' ').trim();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function etiquetaNivel(nivel: string | null | undefined): string | null {
    const v = normalizar(nivel);
    if (!v) return null;
    return NIVELES[v] ?? prettify(v);
}

export function etiquetaModalidad(modalidad: string | null | undefined): string | null {
    const v = normalizar(modalidad);
    if (!v) return null;
    return MODALIDADES[v] ?? prettify(v);
}

export function etiquetaCategoria(categoria: string | null | undefined): string | null {
    const v = normalizar(categoria);
    if (!v) return null;
    return CATEGORIAS[v] ?? prettify(v);
}

/**
 * Las etiquetas de la ficha, ya filtradas y ordenadas.
 * Devuelve solo las que tienen algo que decir.
 */
export function etiquetasDeCurso(curso: {
    categoria?: string | null;
    modalidad?: string | null;
    nivel?: string | null;
}): string[] {
    return [
        etiquetaCategoria(curso.categoria),
        etiquetaModalidad(curso.modalidad),
        etiquetaNivel(curso.nivel),
    ].filter((x): x is string => Boolean(x));
}
