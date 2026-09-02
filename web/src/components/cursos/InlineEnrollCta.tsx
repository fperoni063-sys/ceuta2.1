'use client';

import { useCourseEnroll } from '@/components/cursos/courseEnrollStore';
import { formatearPrecio, formatearFechaMedia } from '@/lib/utils/discountUtils';
import { PaymentTerms } from '@/components/cursos/PaymentTerms';
import { Calendar } from 'lucide-react';

/**
 * CTA repetido dentro del contenido.
 *
 * La barra fija resuelve "tener siempre un botón a mano"; esto resuelve otra cosa:
 * cerrar en el momento en que la persona termina de leer algo que la convenció
 * (el programa, los testimonios, las FAQ). El texto cambia en cada punto a
 * propósito: tres bloques idénticos se leen como plantilla y el ojo los saltea.
 */

const WHATSAPP_NUMBER = '59898910715';

interface InlineEnrollCtaProps {
    titulo: string;
    subtitulo?: string;
    /** Identifica el punto de la página del que salió el clic. */
    origen: string;
    /** Muestra también el botón de WhatsApp (útil donde la duda es la objeción). */
    mostrarWhatsapp?: boolean;
}

export function InlineEnrollCta({
    titulo,
    subtitulo,
    origen,
    mostrarWhatsapp = false,
}: InlineEnrollCtaProps) {
    const {
        curso, precioActual, precioFinal, precioCuota,
        tieneDescuento, moneda, openModal,
    } = useCourseEnroll();

    const hayPrecio = precioActual !== null && precioActual !== undefined && precioFinal !== null;

    // Se reusa formatearFechaMedia para no repetir el manejo de zona horaria
    // ni mostrar una fecha distinta a la de la sidebar.
    const fechaInicioTexto = (() => {
        if (curso.fecha_a_confirmar || !curso.fecha_inicio) return 'Fecha a confirmar';
        const texto = formatearFechaMedia(curso.fecha_inicio);
        return texto ? `Empieza el ${texto}` : null;
    })();

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hola! Estoy interesado/a en el curso "${curso.nombre}". ¿Podrían darme más información?`
    )}`;

    return (
        <section
            aria-label="Reservar cupo"
            className="rounded-2xl border border-green-700/20 bg-gradient-to-br from-green-50 to-cream dark:border-green-800/30 dark:from-green-950/25 dark:to-background p-6 sm:p-8"
        >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">

                <div className="min-w-0">
                    <h3 className="font-heading text-xl font-bold text-earth-900 sm:text-2xl text-balance">
                        {titulo}
                    </h3>
                    {subtitulo && (
                        <p className="mt-1.5 text-sm text-earth-900/70 sm:text-base">
                            {subtitulo}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        {hayPrecio ? (
                            <>
                                {tieneDescuento && (
                                    <span className="text-sm text-muted-foreground line-through tabular-nums">
                                        {formatearPrecio(precioActual, moneda)}
                                    </span>
                                )}
                                <span className="font-heading text-2xl font-bold text-green-700 tabular-nums sm:text-3xl">
                                    {formatearPrecio(precioFinal, moneda)}
                                </span>
                                {precioCuota && (
                                    <span className="text-sm text-earth-900/70">
                                        o {curso.cantidad_cuotas} cuotas de{' '}
                                        <strong className="font-semibold tabular-nums">
                                            {formatearPrecio(precioCuota, moneda)}
                                        </strong>
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="font-heading text-2xl font-bold text-green-700">
                                Consultar precio
                            </span>
                        )}
                    </div>

                    {fechaInicioTexto && (
                        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-earth-900/70">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-green-700" aria-hidden="true" />
                            {fechaInicioTexto}
                        </p>
                    )}

                    <PaymentTerms
                        cantidadCuotas={curso.cantidad_cuotas}
                        precioCuota={precioCuota ?? precioFinal}
                        moneda={moneda}
                        variant="compact"
                        className="mt-3.5"
                    />
                </div>

                <div className="flex w-full flex-shrink-0 flex-col gap-2.5 sm:w-auto sm:min-w-[15rem]">
                    <button
                        type="button"
                        onClick={() => openModal(origen)}
                        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-[#2d6a4f] px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#255a42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        Reservar mi cupo - Gratis
                    </button>

                    {mostrarWhatsapp && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-12 w-full items-center justify-center rounded-md border border-earth-900/25 bg-background px-6 text-sm font-medium text-earth-900 transition-colors hover:border-earth-900/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Preguntar por WhatsApp
                        </a>
                    )}

                    <p className="text-center text-xs leading-snug text-earth-900/60 sm:text-left">
                        Reservar no tiene costo. Elegís cómo pagar en el paso siguiente.
                    </p>
                </div>
            </div>
        </section>
    );
}
