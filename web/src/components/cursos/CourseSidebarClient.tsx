'use client';

import { Calendar, Clock, MapPin, Phone, Monitor, Users2 } from 'lucide-react';
import { EnrollButton } from '@/components/cursos/EnrollButton';
import { PriceDisplay } from '@/components/cursos/PriceDisplay';
import { formatearFechaLarga } from '@/lib/utils/discountUtils';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { PaymentTerms } from '@/components/cursos/PaymentTerms';
import { useCourseEnroll } from '@/components/cursos/courseEnrollStore';

/**
 * Sidebar de precio + CTA.
 *
 * La modalidad elegida y el precio resultante ya no viven acá: vienen de
 * CourseEnrollProvider, para que la barra fija del pie no pueda mostrar un
 * precio distinto al de esta tarjeta.
 */
export function CourseSidebarClient() {
    const {
        curso,
        esHibridoConOnline,
        modalidad,
        setModalidad,
        precioActual,
        precioCuota,
        precioFinal,
        descuentoPorcentaje,
        descuentoEtiqueta,
        moneda,
    } = useCourseEnroll();

    const whatsappNumber = '59898910715';
    const whatsappMessage = encodeURIComponent(
        `Hola! Estoy interesado/a en el curso "${curso.nombre}". ¿Podrían darme más información?`
    );
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const opcionBase =
        'p-3 rounded-lg border-2 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

    // max-h + overflow en lg: un elemento `sticky` más alto que la pantalla se pega
    // arriba y deja su parte de abajo permanentemente fuera de vista. Con la tarjeta
    // a 970px, en un portátil de 1366x768 el botón caía en esa zona muerta. Con el
    // tope, si no entra, la tarjeta scrollea por dentro y al CTA siempre se llega.
    return (
        <div className="bg-background rounded-2xl shadow-lg border border-earth-900/10 dark:border-white/10 p-6 md:p-8 sticky top-24 lg:max-h-[calc(100vh_-_7rem)] lg:overflow-y-auto">
            {/* Selector de Modalidad (solo para híbridos con opción online) */}
            {esHibridoConOnline && (
                <div className="mb-6 pb-6 border-b border-earth-900/10 dark:border-white/10">
                    <p className="text-sm text-muted-foreground mb-3">Elegí tu modalidad:</p>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Modalidad del curso">
                        <button
                            type="button"
                            onClick={() => setModalidad('hibrido')}
                            aria-pressed={modalidad === 'hibrido'}
                            className={`${opcionBase} ${modalidad === 'hibrido'
                                ? 'border-green-700 bg-green-700/10'
                                : 'border-earth-900/15 hover:border-earth-900/40'
                                }`}
                        >
                            <Users2
                                className={`w-5 h-5 mb-1 ${modalidad === 'hibrido' ? 'text-green-700' : 'text-muted-foreground'}`}
                                aria-hidden="true"
                            />
                            <span className={`block text-sm font-medium ${modalidad === 'hibrido' ? 'text-green-700' : 'text-foreground'}`}>
                                Híbrido
                            </span>
                            <span className="block text-xs text-muted-foreground">Con prácticas presenciales</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalidad('online')}
                            aria-pressed={modalidad === 'online'}
                            className={`${opcionBase} ${modalidad === 'online'
                                ? 'border-green-700 bg-green-700/10'
                                : 'border-earth-900/15 hover:border-earth-900/40'
                                }`}
                        >
                            <Monitor
                                className={`w-5 h-5 mb-1 ${modalidad === 'online' ? 'text-green-700' : 'text-muted-foreground'}`}
                                aria-hidden="true"
                            />
                            <span className={`block text-sm font-medium ${modalidad === 'online' ? 'text-green-700' : 'text-foreground'}`}>
                                100% Online
                            </span>
                            <span className="block text-xs text-muted-foreground">Sin presenciales</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Price */}
            <div className="text-center mb-6 pb-6 border-b border-earth-900/10 dark:border-white/10">
                <p className="text-sm text-muted-foreground mb-1">Inversión</p>
                {precioActual ? (
                    <PriceDisplay
                        precioOriginal={precioActual}
                        cantidadCuotas={curso.cantidad_cuotas}
                        descuentoPorcentaje={descuentoPorcentaje}
                        descuentoCuposTotales={curso.descuento_cupos_totales}
                        descuentoCuposUsados={curso.descuento_cupos_usados}
                        descuentoEtiqueta={descuentoEtiqueta}
                        descuentoFechaFin={curso.descuento_fecha_fin}
                        variant="sidebar"
                        moneda={moneda}
                    />
                ) : (
                    <p className="font-heading text-4xl font-bold text-green-700">Consultar</p>
                )}
            </div>


            {/* CTA Buttons — van pegados al precio para que en un portátil de
                1366x768 el botón entre en el primer golpe de vista de la tarjeta.
                Los datos del curso quedan abajo: se repiten en el cuerpo de la
                página (Horarios, Programa) y en los CTA del contenido. */}
            <div className="space-y-3">
                <CountdownTimer
                    targetDate={curso.descuento_fecha_fin}
                    variant="subtle"
                    label="Tiempo restante del descuento:"
                    className="mb-2 border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20"
                />

                <EnrollButton />

                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center rounded-md border border-earth-900/25 bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-earth-900/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                    Consultar por WhatsApp
                </a>
            </div>

            {/* Quick Info */}
            <div className="space-y-4 mt-6">
                {curso.duracion && (
                    <div className="flex items-center gap-3 text-foreground">
                        <Clock className="w-5 h-5 text-green-700 flex-shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-sm text-muted-foreground">Duración</p>
                            <p className="font-medium">{curso.duracion}</p>
                        </div>
                    </div>
                )}
                {(curso.lugar || curso.lugar_a_confirmar) && (
                    <div className="flex items-center gap-3 text-foreground">
                        <MapPin className="w-5 h-5 text-green-700 flex-shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-sm text-muted-foreground">Lugar</p>
                            <p className="font-medium">
                                {curso.lugar_a_confirmar ? (
                                    curso.departamento_probable
                                        ? `${curso.departamento_probable} (dirección a confirmar)`
                                        : 'A definir'
                                ) : curso.lugar}
                            </p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3 text-foreground">
                    <Calendar className="w-5 h-5 text-green-700 flex-shrink-0" aria-hidden="true" />
                    <div>
                        <p className="text-sm text-muted-foreground">Inicio</p>
                        <p className="font-medium">
                            {curso.fecha_a_confirmar
                                ? 'Fecha a confirmar'
                                : formatearFechaLarga(curso.fecha_inicio) || 'Consultar'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/*
              * Va DEBAJO del botón a propósito. Con el bloque arriba, la sidebar
              * pasaba de 561px a 970px contra ~804px de alto útil en una pantalla
              * de 900: al hacerse sticky, el CTA quedaba cortado abajo y no había
              * forma de llegar a él. Acá abajo, si algo se corta es la
              * tranquilización —que además se repite en los CTA del contenido—
              * y nunca el botón.
              */}
            <PaymentTerms
                cantidadCuotas={curso.cantidad_cuotas}
                precioCuota={precioCuota ?? precioFinal}
                moneda={moneda}
                variant="full"
                className="mt-6"
            />
        </div>
    );
}
