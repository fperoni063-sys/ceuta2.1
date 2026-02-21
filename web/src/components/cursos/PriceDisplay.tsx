'use client';

import { calcularDescuento, formatearPrecio, mensajeCuposDisponibles, calcularPrecioCuota, DiscountConfig, formatearFechaMedia } from '@/lib/utils/discountUtils';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock } from 'lucide-react';

/**
 * Componente unificado para mostrar precios con/sin descuento
 * Diseño sutil y profesional para público uruguayo 30-50 años
 */

export interface PriceDisplayProps {
    // Precio base
    precioOriginal: number;
    cantidadCuotas?: number;

    // Descuento (opcional)
    descuentoPorcentaje?: number | null;
    descuentoCuposTotales?: number | null;
    descuentoCuposUsados?: number;
    descuentoEtiqueta?: string | null;
    descuentoFechaFin?: string | null;

    // Variantes de diseño
    variant?: 'sidebar' | 'card' | 'modal' | 'compact';

    // Mostrar desglose de cuotas
    showCuotas?: boolean;

    // Clases adicionales
    className?: string;
}

export function PriceDisplay({
    precioOriginal,
    cantidadCuotas = 1,
    descuentoPorcentaje = null,
    descuentoCuposTotales = null,
    descuentoCuposUsados = 0,
    descuentoEtiqueta = null,
    descuentoFechaFin = null,
    variant = 'sidebar',
    showCuotas = true,
    className = '',
}: PriceDisplayProps) {
    // Calcular descuento
    const config: DiscountConfig = {
        precioOriginal,
        descuentoPorcentaje,
        cuposTotales: descuentoCuposTotales,
        cuposUsados: descuentoCuposUsados,
        etiqueta: descuentoEtiqueta,
        fechaFin: descuentoFechaFin,
    };
    const descuento = calcularDescuento(config);

    // Helpers de estilo según variante
    const styles = getStyles(variant);

    // Componentes internos
    const precioCuota = showCuotas && cantidadCuotas > 1
        ? calcularPrecioCuota(descuento.precioFinal, cantidadCuotas)
        : descuento.precioFinal;

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Badge con etiqueta personalizada */}
            {descuento.tieneDescuento && descuento.etiqueta && (
                <Badge className={styles.badge}>
                    {descuento.etiqueta}
                </Badge>
            )}

            {/* Precio */}
            <div className={styles.priceContainer}>
                {/* Precio original tachado (si hay descuento) */}
                {descuento.tieneDescuento && (
                    <span className={styles.originalPrice}>
                        {formatearPrecio(descuento.precioOriginal)}
                    </span>
                )}

                {/* Precio final */}
                {showCuotas && cantidadCuotas > 1 ? (
                    <div className={styles.cuotasContainer}>
                        {variant === 'card' && <Sparkles className="w-4 h-4 text-orange-400 mr-1" />}
                        <span className={styles.cuotasLabel}>
                            {variant !== 'card' && '✨ '}
                            {cantidadCuotas} cuotas de
                        </span>
                        <span className={styles.mainPrice}>
                            {formatearPrecio(precioCuota)}
                        </span>
                        <span className={styles.totalLabel}>
                            (Total: {formatearPrecio(descuento.precioFinal)})
                        </span>
                    </div>
                ) : (
                    <span className={styles.mainPrice}>
                        {formatearPrecio(descuento.precioFinal)}
                    </span>
                )}

                {/* Ahorro (si hay descuento significativo y variante lo permite) */}
                {descuento.tieneDescuento && descuento.ahorro > 0 && variant !== 'compact' && (
                    <span className={styles.savings}>
                        Ahorrás {formatearPrecio(descuento.ahorro)}
                    </span>
                )}
            </div>

            {/* Cupos disponibles (sutil, solo si < 6) */}
            {descuento.mostrarCupos && descuento.cuposDisponibles !== null && (
                <p className={styles.cuposMessage}>
                    {mensajeCuposDisponibles(descuento.cuposDisponibles)}
                </p>
            )}

            {/* Fecha de expiración (Badge Premium) */}
            {descuento.tieneDescuento && descuento.fechaFin && !descuento.estaExpirado && variant !== 'compact' && (
                <div className={`mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${variant === 'card'
                    ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/10 text-amber-700 dark:text-amber-300 text-[10px]'
                    : variant === 'modal'
                        ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs'
                        : 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-green-950/20 dark:to-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs shadow-sm'
                    }`}>

                    {variant === 'modal' ? (
                        // Modal: Candado (Seguridad / Precio Congelado)
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    ) : (
                        // Card/Sidebar: Reloj (Oportunidad)
                        <Clock className={variant === 'card' ? "w-3 h-3" : "w-3.5 h-3.5"} />
                    )}

                    <span className="font-medium">
                        {variant === 'modal'
                            ? `Precio congelado hasta el ${formatearFechaMedia(descuento.fechaFin)}`
                            : `Oferta válida hasta el ${formatearFechaMedia(descuento.fechaFin)}`
                        }
                    </span>
                </div>
            )}
        </div>
    );
}

// =====================================================
// Estilos por variante
// =====================================================

function getStyles(variant: PriceDisplayProps['variant']) {
    const baseStyles = {
        container: 'flex flex-col',
        badge: 'bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-2',
        priceContainer: 'flex flex-col',
        originalPrice: 'text-gray-400 line-through text-sm',
        mainPrice: 'font-heading font-bold text-green-700',
        cuotasContainer: 'flex flex-col items-center',
        cuotasLabel: 'text-sm font-medium text-gray-600',
        totalLabel: 'text-xs text-gray-400',
        savings: 'text-xs text-green-600 font-medium mt-1',
        cuposMessage: 'text-xs text-amber-600 font-medium mt-2',
    };

    switch (variant) {
        case 'sidebar':
            return {
                ...baseStyles,
                container: 'flex flex-col items-center text-center',
                mainPrice: 'font-heading font-bold text-3xl text-green-700',
                cuotasContainer: 'flex flex-col items-center gap-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full',
                cuotasLabel: 'text-sm font-medium',
                cuposMessage: 'text-sm text-amber-600 dark:text-amber-400 font-medium mt-3 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg',
            };

        case 'card':
            return {
                ...baseStyles,
                container: 'flex flex-col',
                mainPrice: 'font-heading font-bold text-lg text-green-700 ml-1',
                cuotasContainer: 'flex items-center flex-wrap gap-1', // Reduced gap for tighter look
                cuotasLabel: 'text-sm font-medium text-gray-700',
                totalLabel: 'text-xs text-gray-400 ml-1',
                originalPrice: 'text-gray-400 line-through text-xs',
            };

        case 'modal':
            return {
                ...baseStyles,
                container: 'flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-800/30',
                mainPrice: 'font-heading font-bold text-2xl text-green-700',
                badge: 'bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium px-3 py-1 rounded-full mb-3',
            };

        case 'compact':
            return {
                ...baseStyles,
                container: 'flex items-center gap-2',
                mainPrice: 'font-semibold text-green-700',
                badge: 'bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded',
                originalPrice: 'text-gray-400 line-through text-xs',
                cuposMessage: 'hidden', // No mostrar en compact
            };

        default:
            return baseStyles;
    }
}

// =====================================================
// Subcomponentes útiles
// =====================================================

/**
 * Badge de descuento para usar en imágenes de cards
 */
export function DiscountBadge({
    etiqueta,
    porcentaje,
    className = '',
}: {
    etiqueta?: string | null;
    porcentaje?: number | null;
    className?: string;
}) {
    if (!etiqueta && !porcentaje) return null;

    const texto = etiqueta || `${porcentaje}% OFF`;

    return (
        <Badge className={`bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 ${className}`}>
            {texto}
        </Badge>
    );
}
