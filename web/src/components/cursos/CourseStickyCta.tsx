'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCourseEnroll } from '@/components/cursos/courseEnrollStore';
import { formatearPrecio } from '@/lib/utils/discountUtils';
import { ShieldCheck, CalendarClock } from 'lucide-react';

/**
 * Barra de inscripción fija al pie.
 *
 * Problema que resuelve: la ficha de curso mide ~10 pantallas de celular y el
 * único "Reservar mi cupo" vivía en la pantalla 1,1. Quien leía el programa, los
 * testimonios y las FAQ —el más convencido de todos— llegaba al final sin ningún
 * botón a mano. Medido: de 12.258 visitantes, 41 abrieron el formulario.
 *
 * Reglas de la barra:
 *  - Aparece recién cuando el CTA de la sidebar sale de pantalla (nunca dos veces
 *    el mismo botón a la vista).
 *  - Se esconde con el modal abierto.
 *  - Publica su alto en --ceuta-cta-h para que el botón flotante de WhatsApp suba
 *    y no quede tapado.
 */

const WHATSAPP_NUMBER = '59898910715';

export function CourseStickyCta() {
    const {
        curso, precioActual, precioFinal, precioCuota, tieneDescuento,
        moneda, openModal, isModalOpen, anchorNode,
    } = useCourseEnroll();

    const [mounted, setMounted] = useState(false);
    const [pastAnchor, setPastAnchor] = useState(false);
    const barRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setMounted(true), []);

    // Mostrar la barra solo después de pasar el CTA de la sidebar.
    //
    // Se calcula con getBoundingClientRect y no con IntersectionObserver a
    // propósito: IO se entrega desde el pipeline de render, así que en pestañas
    // en segundo plano o webviews que no componen frames puede no dispararse
    // nunca y la barra quedaría escondida para siempre. Un rect leído en el
    // scroll es determinista y cuesta lo mismo con el throttle de rAF.
    useEffect(() => {
        if (!mounted) return;

        const check = () => {
            if (!anchorNode || !anchorNode.isConnected) {
                // Sin ancla caemos a un umbral fijo para no dejar la página sin barra.
                setPastAnchor(window.scrollY > 600);
                return;
            }
            // El ancla ya quedó por encima del viewport => mostramos la barra.
            setPastAnchor(anchorNode.getBoundingClientRect().bottom < 0);
        };

        check();
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check, { passive: true });
        return () => {
            window.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
        };
    }, [mounted, anchorNode]);

    const visible = mounted && pastAnchor && !isModalOpen;

    // Publicar el alto real para que WhatsApp/banners se corran hacia arriba.
    const syncHeight = useCallback(() => {
        const h = visible && barRef.current ? barRef.current.offsetHeight : 0;
        document.documentElement.style.setProperty('--ceuta-cta-h', `${h}px`);
    }, [visible]);

    useEffect(() => {
        syncHeight();
        if (!visible) return;
        const ro = new ResizeObserver(syncHeight);
        if (barRef.current) ro.observe(barRef.current);
        window.addEventListener('resize', syncHeight);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', syncHeight);
        };
    }, [visible, syncHeight]);

    // Limpiar al desmontar para no dejar el offset colgado en otras páginas.
    useEffect(() => () => {
        document.documentElement.style.removeProperty('--ceuta-cta-h');
    }, []);

    if (!mounted) return null;

    // ---- Contenido del precio (respeta exactamente el estado de la base) ----
    const hayPrecio = precioActual !== null && precioActual !== undefined && precioFinal !== null;

    // Urgencia real: la fecha de inicio del curso, no una promo inventada.
    //
    // La fecha se arma con los componentes Y-M-D en hora local, igual que
    // formatearFechaLarga: `new Date('2026-09-10')` es medianoche UTC, que en
    // UTC-3 cae el 9 a las 21:00 y descuenta un día de más.
    const diasParaEmpezar = (() => {
        if (curso.fecha_a_confirmar || !curso.fecha_inicio) return null;
        const [year, month, day] = curso.fecha_inicio.split('T')[0].split('-').map(Number);
        if (!year || !month || !day) return null;
        const inicio = new Date(year, month - 1, day);
        if (Number.isNaN(inicio.getTime())) return null;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return Math.round((inicio.getTime() - hoy.getTime()) / 86400000);
    })();

    const notaUrgencia =
        diasParaEmpezar === null ? null
            : diasParaEmpezar < 0 ? null
                : diasParaEmpezar === 0 ? 'Empieza hoy'
                    : diasParaEmpezar === 1 ? 'Empieza mañana'
                        : diasParaEmpezar <= 21 ? `Empieza en ${diasParaEmpezar} días`
                            : null;

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hola! Estoy interesado/a en el curso "${curso.nombre}". ¿Podrían darme más información?`
    )}`;

    return createPortal(
        <div
            ref={barRef}
            role="region"
            aria-label="Inscripción al curso"
            aria-hidden={!visible}
            data-visible={visible ? 'true' : 'false'}
            className={[
                'fixed inset-x-0 bottom-0 z-40',
                'border-t border-border bg-background/95 backdrop-blur-md',
                'shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.18)] dark:shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.6)]',
                'transition-transform duration-300 ease-out motion-reduce:transition-none',
                visible ? 'translate-y-0' : 'translate-y-full pointer-events-none',
            ].join(' ')}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">

                {/* Bloque de precio */}
                <div className="min-w-0 flex-1">
                    {hayPrecio ? (
                        <>
                            {/* El número grande es lo que hay que pagar para entrar
                                (la 1ª cuota), igual que en la sidebar. Si mostrara el
                                total, la barra contradiría a la tarjeta de precio. */}
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                {tieneDescuento && !precioCuota && (
                                    <span className="text-xs text-muted-foreground line-through tabular-nums">
                                        {formatearPrecio(precioActual, moneda)}
                                    </span>
                                )}
                                <span className="font-heading text-xl font-bold leading-none text-green-700 tabular-nums sm:text-2xl">
                                    {formatearPrecio(precioCuota ?? precioFinal, moneda)}
                                </span>
                            </div>
                            {/* A 375px entra una sola línea: la urgencia va abajo,
                                en la franja de ancho completo. */}
                            <p className="mt-1 truncate text-[11px] leading-tight text-muted-foreground sm:text-xs">
                                {precioCuota
                                    ? `1ª cuota · curso ${formatearPrecio(precioFinal, moneda)}`
                                    : 'Pago único'}
                            </p>
                        </>
                    ) : (
                        <>
                            <span className="font-heading text-lg font-bold leading-none text-green-700 sm:text-xl">
                                Consultar precio
                            </span>
                            <p className="mt-1 truncate text-[11px] leading-tight text-muted-foreground sm:text-xs">
                                Te lo pasamos por WhatsApp
                            </p>
                        </>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex flex-shrink-0 items-center gap-2">
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Consultar este curso por WhatsApp"
                        tabIndex={visible ? 0 : -1}
                        className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-[#25D366] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.272-.57-.421" />
                        </svg>
                    </a>

                    <button
                        type="button"
                        onClick={() => openModal('sticky_bar')}
                        tabIndex={visible ? 0 : -1}
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#2d6a4f] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#255a42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
                    >
                        Reservar mi cupo
                        <span className="ml-1.5 hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline">
                            Gratis
                        </span>
                    </button>
                </div>
            </div>

            {/* Franja de ancho completo: urgencia real (fecha de inicio) + por qué
                apretar el botón no da miedo. Va acá porque es la única línea con
                lugar suficiente en un celular de 375px. */}
            <div className="border-t border-border/60 bg-muted/40">
                <p className="mx-auto flex max-w-3xl items-center justify-center gap-1.5 px-4 py-1.5 text-center text-[10.5px] leading-tight text-muted-foreground sm:text-[11.5px]">
                    {notaUrgencia ? (
                        <>
                            <CalendarClock className="h-3.5 w-3.5 flex-shrink-0 text-green-700" aria-hidden="true" />
                            <span>
                                <strong className="font-semibold text-foreground/80">{notaUrgencia}</strong>
                                <span aria-hidden="true"> · </span>
                                reservar no tiene costo ni te compromete
                            </span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-green-700" aria-hidden="true" />
                            <span>Reservar no tiene costo y no te compromete. Elegís cómo pagar después.</span>
                        </>
                    )}
                </p>
            </div>
        </div>,
        document.body
    );
}
