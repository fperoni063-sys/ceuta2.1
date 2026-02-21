/**
 * Utilidades de descuento para el sistema de cursos
 * Funciones puras para cálculos de descuento y formateo
 */

// =====================================================
// Types
// =====================================================

export interface DiscountConfig {
    precioOriginal: number;
    descuentoPorcentaje: number | null;
    cuposTotales: number | null;
    cuposUsados: number;
    etiqueta: string | null;
    fechaFin?: string | null;
}

export interface DiscountResult {
    precioFinal: number;
    precioOriginal: number;
    tieneDescuento: boolean;
    porcentaje: number;
    ahorro: number;
    cuposDisponibles: number | null;  // null = sin límite o no aplica
    mostrarCupos: boolean;            // true si < 6
    etiqueta: string | null;
    fechaFin: string | null;
    estaExpirado: boolean;
}

// Umbral para mostrar "Últimos X cupos"
const UMBRAL_MOSTRAR_CUPOS = 6;

// =====================================================
// Main Functions
// =====================================================

/**
 * Calcula el descuento y retorna toda la información necesaria
 * para mostrarlo en la UI
 */
export function calcularDescuento(config: DiscountConfig): DiscountResult {
    const { precioOriginal, descuentoPorcentaje, cuposTotales, cuposUsados, etiqueta, fechaFin } = config;

    // Verificar expiración (End of Day para que el descuento sea válido todo el día de vencimiento)
    let estaExpirado = false;
    if (fechaFin) {
        const endDate = new Date(fechaFin);
        // Ajustar al final del día para que expire a las 23:59:59
        endDate.setHours(23, 59, 59, 999);
        estaExpirado = new Date() > endDate;
    }

    // Validar que hay un descuento válido configurado
    const tieneDescuentoConfigurado =
        !estaExpirado &&
        descuentoPorcentaje !== null &&
        descuentoPorcentaje > 0 &&
        cuposTotales !== null &&
        cuposTotales > 0;

    // Calcular cupos disponibles
    const cuposDisponibles = cuposTotales !== null
        ? Math.max(0, cuposTotales - cuposUsados)
        : null;

    // El descuento aplica solo si hay cupos disponibles
    const tieneDescuento = tieneDescuentoConfigurado &&
        cuposDisponibles !== null &&
        cuposDisponibles > 0;

    // Calcular precio final
    const porcentajeEfectivo = tieneDescuento ? (descuentoPorcentaje ?? 0) : 0;
    const ahorro = Math.round(precioOriginal * porcentajeEfectivo / 100);
    const precioFinal = tieneDescuento
        ? precioOriginal - ahorro
        : precioOriginal;

    // Determinar si mostrar cupos restantes
    const mostrarCupos = tieneDescuento &&
        cuposDisponibles !== null &&
        cuposDisponibles < UMBRAL_MOSTRAR_CUPOS;

    return {
        precioFinal,
        precioOriginal,
        tieneDescuento,
        porcentaje: porcentajeEfectivo,
        ahorro,
        cuposDisponibles,
        mostrarCupos,
        etiqueta: tieneDescuento ? etiqueta : null,
        fechaFin: tieneDescuento ? (fechaFin || null) : null,
        estaExpirado,
    };
}

// =====================================================
// Formatting Functions
// =====================================================

/**
 * Formatea un precio en pesos uruguayos de forma determinista
 * Evita problemas de hidratación (UYU vs $)
 */
export function formatearPrecio(precio: number | null): string {
    if (precio === null || precio === undefined) return 'Consultar';

    const formatter = new Intl.NumberFormat('es-UY', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return `$ ${formatter.format(precio)}`;
}

/**
 * Formateo de fechas determinista para evitar errores de hidratación
 */
const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DIAS = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

export function formatearFechaLarga(dateStr: string | null): string {
    if (!dateStr) return '';

    // Extraemos YYYY, MM, DD para instanciar la fecha local y evitar 
    // desplazamientos de zona horaria (ej: 00:00 UTC -> 21:00 UTC-3 del día previo)
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const diaSemana = DIAS[date.getDay()];
    const dia = date.getDate();
    const mes = MESES[date.getMonth()];
    const anio = date.getFullYear();

    return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
}

export function formatearFechaMedia(dateStr: string | null): string {
    if (!dateStr) return '';

    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const dia = date.getDate();
    const mes = MESES[date.getMonth()];
    const anio = date.getFullYear();

    return `${dia} de ${mes} de ${anio}`;
}

/**
 * Calcula el precio por cuota
 */
export function calcularPrecioCuota(precioTotal: number, cantidadCuotas: number): number {
    if (cantidadCuotas <= 1) return precioTotal;
    return Math.ceil(precioTotal / cantidadCuotas);
}

/**
 * Formatea el texto de cuotas
 */
export function formatearCuotas(precioTotal: number, cantidadCuotas: number): string {
    if (cantidadCuotas <= 1) return formatearPrecio(precioTotal);

    const precioCuota = calcularPrecioCuota(precioTotal, cantidadCuotas);
    return `${cantidadCuotas} cuotas de ${formatearPrecio(precioCuota)}`;
}

/**
 * Genera el mensaje de cupos disponibles de forma sutil
 */
export function mensajeCuposDisponibles(cupos: number): string {
    if (cupos === 1) return 'Último cupo disponible';
    if (cupos <= 3) return `Últimos ${cupos} cupos disponibles`;
    return `${cupos} cupos disponibles`;
}

// =====================================================
// Validation Functions
// =====================================================

/**
 * Valida la configuración de descuento para el panel admin
 */
export function validarConfigDescuento(config: {
    porcentaje: number | null;
    cuposTotales: number | null;
    cuposUsados: number;
}): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Porcentaje debe estar entre 1 y 100 (Validación relajada para permitir > 100 si se desea)
    if (config.porcentaje !== null) {
        if (config.porcentaje <= 0) {
            errores.push('El porcentaje de descuento debe ser mayor a 0');
        }
        // Removed cap of 100%
    }

    // Cupos totales debe ser >= 0
    if (config.cuposTotales !== null && config.cuposTotales < 0) {
        errores.push('Los cupos totales no pueden ser negativos');
    }

    // Cupos usados no puede ser mayor a totales
    if (config.cuposTotales !== null && config.cuposUsados > config.cuposTotales) {
        errores.push('Los cupos usados no pueden ser mayores a los totales');
    }

    // Si hay porcentaje, debe haber cupos totales
    if (config.porcentaje !== null && config.porcentaje > 0 && config.cuposTotales === null) {
        errores.push('Debe especificar la cantidad de cupos con descuento');
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}

// =====================================================
// Helper for Course Data
// =====================================================

/**
 * Extrae la configuración de descuento de un objeto curso
 */
export function extraerConfigDescuento(curso: {
    precio: number;
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
}): DiscountConfig {
    return {
        precioOriginal: curso.precio,
        descuentoPorcentaje: curso.descuento_porcentaje ?? null,
        cuposTotales: curso.descuento_cupos_totales ?? null,
        cuposUsados: curso.descuento_cupos_usados ?? 0,
        etiqueta: curso.descuento_etiqueta ?? null,
        fechaFin: curso.descuento_fecha_fin ?? null,
    };
}

/**
 * Extrae la configuración de descuento para modalidad online
 */
export function extraerConfigDescuentoOnline(curso: {
    precio_online?: number | null;
    precio: number;
    descuento_online_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_online_etiqueta?: string | null;
    descuento_porcentaje?: number | null;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
}): DiscountConfig {
    const precioBase = curso.precio_online ?? curso.precio;

    // Si hay descuento online específico, usarlo; si no, NO hay descuento
    const porcentaje = curso.descuento_online_porcentaje ?? null;
    const etiqueta = curso.descuento_online_etiqueta ?? null;

    return {
        precioOriginal: precioBase,
        descuentoPorcentaje: porcentaje,
        cuposTotales: curso.descuento_cupos_totales ?? null,
        cuposUsados: curso.descuento_cupos_usados ?? 0,
        etiqueta,
        fechaFin: curso.descuento_fecha_fin ?? null,
    };
}
