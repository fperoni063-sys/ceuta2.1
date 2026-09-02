'use client';

import { CreditCard, CalendarDays, ShieldCheck } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils/discountUtils';

/**
 * "Cómo funciona el pago" — las tres cosas que sacan el miedo de encima.
 *
 * Por qué existe: la ficha mostraba "$ 8.820" y ese número es el que decide si
 * la persona sigue o se va, pero **no es lo que tiene que pagar para entrar**.
 * Paga la primera cuota y ya está adentro; las otras dos van mes a mes. Y si se
 * arrepiente antes de que arranque, se le devuelve.
 *
 * Las tres cosas ya existían en el sistema pero recién en el PASO 3 del wizard,
 * o sea después de que la persona dejó sus datos. Ahí no sirven para convertir.
 *
 * Nada de esto es inventado:
 *  - el escalonado sale de `cantidad_cuotas` (3 en 9 cursos, 1 en Biopiscinas);
 *  - "no es débito automático" y el reembolso son el texto que el propio
 *    EnrollmentModal ya le muestra al cliente en la caja de "Información
 *    Importante". Reembolso confirmado por Franco el 2026-09-02.
 */

interface PaymentTermsProps {
    cantidadCuotas: number;
    /** Importe de UNA cuota (o del pago único si cantidadCuotas === 1). */
    precioCuota: number | null;
    moneda?: 'UYU' | 'ARS';
    /** `full` para la sidebar, `compact` para los CTA dentro del contenido. */
    variant?: 'full' | 'compact';
    className?: string;
}

export function PaymentTerms({
    cantidadCuotas,
    precioCuota,
    moneda = 'UYU',
    variant = 'full',
    className = '',
}: PaymentTermsProps) {
    // Sin precio no hay nada que prometer: el curso está "a consultar".
    if (precioCuota === null || precioCuota === undefined) return null;

    const enCuotas = cantidadCuotas > 1;
    const restantes = cantidadCuotas - 1;

    const items = [
        {
            Icon: CreditCard,
            texto: enCuotas ? (
                <>
                    Pagás la <strong className="font-semibold">primera cuota de {formatearPrecio(precioCuota, moneda)}</strong> y ya entrás al curso.
                </>
            ) : (
                <>
                    Pagás <strong className="font-semibold">{formatearPrecio(precioCuota, moneda)}</strong> y ya entrás al curso.
                </>
            ),
        },
        ...(enCuotas
            ? [{
                Icon: CalendarDays,
                texto: (
                    <>
                        {restantes === 1 ? 'La cuota restante' : `Las ${restantes} cuotas restantes`}, una por mes, mientras cursás.
                        {' '}No es débito automático: las hacés vos.
                    </>
                ),
            }]
            : []),
        {
            Icon: ShieldCheck,
            texto: (
                <>
                    ¿Cambiás de idea? <strong className="font-semibold">Te devolvemos el pago</strong> si cancelás antes de que empiece el curso.
                </>
            ),
        },
    ];

    if (variant === 'compact') {
        return (
            <ul className={`space-y-1.5 ${className}`}>
                {items.map(({ Icon, texto }, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-snug text-earth-900/75">
                        <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-700" aria-hidden="true" />
                        <span>{texto}</span>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className={`rounded-lg border border-green-700/20 bg-green-700/5 p-4 ${className}`}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-green-700">
                Cómo funciona el pago
            </p>
            <ul className="space-y-2">
                {items.map(({ Icon, texto }, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/85">
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-700" aria-hidden="true" />
                        <span>{texto}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
