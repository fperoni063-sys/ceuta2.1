
import { DiscountConfig, calcularDescuento, extraerConfigDescuento, extraerConfigDescuentoOnline } from './discountUtils';

interface CourseData {
    precio: number;
    modalidad?: string;
    precio_online?: number | null;
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
    descuento_online_porcentaje?: number | null;
    descuento_online_etiqueta?: string | null;
}

interface EnrollmentContext {
    fecha_inscripcion: string;
    precio_pagado?: number | null;
}

/**
 * Calculates the effective price for a user.
 * If precio_pagado is set (paid), that price is honored.
 * Otherwise, calculates based on CURRENT discount status (no frozen price for unpaid).
 */
export function calculateFrozenPrice(course: CourseData, context: EnrollmentContext) {
    // 1. If a specific price was already locked/paid (legacy or manually set), use it.
    if (context.precio_pagado) {
        return {
            finalPrice: context.precio_pagado,
            originalPrice: course.precio,
            hasDiscount: context.precio_pagado < course.precio,
            discountLabel: null,
            isFrozen: true,
            isOnline: false
        };
    }

    const isOnline = course.modalidad?.toLowerCase().includes('online') || false;

    // Extract config based on modality
    let config: DiscountConfig;

    if (isOnline) {
        config = extraerConfigDescuentoOnline({
            precio: course.precio,
            precio_online: course.precio_online,
            descuento_porcentaje: course.descuento_porcentaje,
            descuento_cupos_totales: course.descuento_cupos_totales,
            descuento_cupos_usados: course.descuento_cupos_usados,
            descuento_etiqueta: course.descuento_etiqueta,
            descuento_fecha_fin: course.descuento_fecha_fin,
            descuento_online_porcentaje: course.descuento_online_porcentaje,
            descuento_online_etiqueta: course.descuento_online_etiqueta,
        });
    } else {
        config = extraerConfigDescuento({
            precio: course.precio,
            descuento_porcentaje: course.descuento_porcentaje,
            descuento_cupos_totales: course.descuento_cupos_totales,
            descuento_cupos_usados: course.descuento_cupos_usados,
            descuento_etiqueta: course.descuento_etiqueta,
            descuento_fecha_fin: course.descuento_fecha_fin,
        });
    }

    // Use the standard discount calculation (respects current date & cupos)
    const discountResult = calcularDescuento(config);

    return {
        finalPrice: discountResult.precioFinal,
        originalPrice: discountResult.precioOriginal,
        hasDiscount: discountResult.tieneDescuento,
        discountLabel: discountResult.etiqueta,
        discountPercentage: discountResult.porcentaje,
        isFrozen: false, // No longer freezing for unpaid enrollments
        isOnline
    };
}

