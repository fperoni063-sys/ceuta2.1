import {
    calcularDescuento,
    extraerConfigDescuento,
    extraerConfigDescuentoOnline,
} from '@/lib/utils/discountUtils';

/**
 * Lo que eligió la persona en la tarjeta de precio de un curso híbrido que
 * también se puede cursar solo online (por ejemplo, Jardines: con la práctica
 * presencial o solo por Zoom).
 *
 * Antes la elección vivía solo en el navegador: la inscripción no la guardaba y
 * el servidor calculaba el precio con código siempre sobre el precio del curso
 * completo. Quien elegía solo online con un código quedaba guardado con el
 * precio del completo.
 */
export type ModalidadElegida = 'hibrido' | 'online';

export function normalizarModalidad(valor: unknown): ModalidadElegida | null {
    return valor === 'hibrido' || valor === 'online' ? valor : null;
}

export interface CursoConModalidades {
    precio: number | null;
    precio_online?: number | null;
    permite_online?: boolean | null;
    modalidad?: string | null;
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number | null;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
    descuento_online_porcentaje?: number | null;
    descuento_online_etiqueta?: string | null;
}

/** La elección solo cuenta si el curso de verdad ofrece las dos opciones. */
export function modalidadValida(curso: CursoConModalidades, elegida: ModalidadElegida | null): ModalidadElegida | null {
    if (!elegida) return null;
    const ofreceDos = curso.modalidad === 'hibrido' && curso.permite_online === true;
    return ofreceDos ? elegida : null;
}

/** Precio de lista de la opción elegida (sin ningún descuento). */
export function precioDeLista(curso: CursoConModalidades, elegida: ModalidadElegida | null): number | null {
    if (curso.precio === null || curso.precio === undefined) return null;
    if (modalidadValida(curso, elegida) === 'online') return curso.precio_online ?? curso.precio;
    return curso.precio;
}

/** Precio de la opción elegida con el descuento automático del curso, si está vigente. */
export function precioConDescuentoDelCurso(curso: CursoConModalidades, elegida: ModalidadElegida | null): number | null {
    if (curso.precio === null || curso.precio === undefined) return null;
    const base = {
        ...curso,
        precio: curso.precio,
        descuento_cupos_usados: curso.descuento_cupos_usados ?? 0,
    };
    const config = modalidadValida(curso, elegida) === 'online'
        ? extraerConfigDescuentoOnline(base)
        : extraerConfigDescuento(base);
    return calcularDescuento(config).precioFinal;
}

/**
 * De dónde viene la persona, según el enlace (?origen=charla, whatsapp, correo...).
 * Solo letras, números, guion y guion bajo, hasta 30 caracteres: va a la base.
 */
export function normalizarOrigen(valor: unknown): string | null {
    if (typeof valor !== 'string') return null;
    const limpio = valor.trim().toLowerCase();
    return /^[a-z0-9_-]{1,30}$/.test(limpio) ? limpio : null;
}

/** Nota que queda en la inscripción para saber de dónde vino. */
export function notaDeOrigen(origen: string | null): string | null {
    return origen ? `origen: ${origen}` : null;
}
