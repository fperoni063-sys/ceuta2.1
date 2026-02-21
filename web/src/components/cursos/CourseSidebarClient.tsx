'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, Monitor, Users2 } from 'lucide-react';
import { EnrollButton } from '@/components/cursos/EnrollButton';
import { PriceDisplay } from '@/components/cursos/PriceDisplay';
import { formatearPrecio, formatearFechaLarga } from '@/lib/utils/discountUtils';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

interface CourseSidebarProps {
    curso: {
        id: number;
        nombre: string;
        precio: number | null;
        cantidad_cuotas: number;
        duracion: string | null;
        lugar: string | null;
        lugar_a_confirmar: boolean;
        departamento_probable: string | null;
        fecha_inicio: string | null;
        fecha_a_confirmar: boolean;
        link_mercado_pago: string | null;
        modalidad: string | null;
        permite_online: boolean;
        precio_online: number | null;
        // Discount fields
        descuento_porcentaje?: number | null;
        descuento_cupos_totales?: number | null;
        descuento_cupos_usados?: number;
        descuento_etiqueta?: string | null;
        descuento_fecha_fin?: string | null;
        descuento_online_porcentaje?: number | null;
        descuento_online_etiqueta?: string | null;
    };
}


export function CourseSidebarClient({ curso }: CourseSidebarProps) {
    const whatsappNumber = '59898910715';
    const whatsappMessage = encodeURIComponent(`Hola! Estoy interesado/a en el curso "${curso.nombre}". ¿Podrían darme más información?`);
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`;

    // Estado para la modalidad seleccionada (solo relevante para cursos híbridos con opción online)
    const esHibridoConOnline = curso.modalidad === 'hibrido' && curso.permite_online;
    const [modalidadSeleccionada, setModalidadSeleccionada] = useState<'hibrido' | 'online'>('hibrido');

    // Determinar el precio según la modalidad seleccionada
    const precioActual = esHibridoConOnline && modalidadSeleccionada === 'online'
        ? (curso.precio_online || curso.precio)
        : curso.precio;

    // Determinar los valores de descuento activos según la modalidad
    const activeDescuentoPorcentaje = esHibridoConOnline && modalidadSeleccionada === 'online'
        ? curso.descuento_online_porcentaje
        : curso.descuento_porcentaje;

    const activeDescuentoEtiqueta = esHibridoConOnline && modalidadSeleccionada === 'online'
        ? curso.descuento_online_etiqueta
        : curso.descuento_etiqueta;

    return (
        <div className="bg-background rounded-2xl shadow-lg border border-earth-900/10 dark:border-white/5 p-6 md:p-8 sticky top-24">
            {/* Selector de Modalidad (solo para híbridos con opción online) */}
            {esHibridoConOnline && (
                <div className="mb-6 pb-6 border-b border-earth-900/10">
                    <p className="text-sm text-earth-900/60 mb-3">Elegí tu modalidad:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setModalidadSeleccionada('hibrido')}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${modalidadSeleccionada === 'hibrido'
                                ? 'border-green-600 bg-green-900/10'
                                : 'border-earth-900/10 hover:border-earth-900/30'
                                }`}
                        >
                            <Users2 className={`w-5 h-5 mb-1 ${modalidadSeleccionada === 'hibrido' ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className={`block text-sm font-medium ${modalidadSeleccionada === 'hibrido' ? 'text-green-700' : 'text-gray-700'}`}>
                                Híbrido
                            </span>
                            <span className="block text-xs text-gray-500">Con prácticas presenciales</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalidadSeleccionada('online')}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${modalidadSeleccionada === 'online'
                                ? 'border-green-600 bg-green-900/10'
                                : 'border-earth-900/10 hover:border-earth-900/30'
                                }`}
                        >
                            <Monitor className={`w-5 h-5 mb-1 ${modalidadSeleccionada === 'online' ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className={`block text-sm font-medium ${modalidadSeleccionada === 'online' ? 'text-green-700' : 'text-gray-700'}`}>
                                100% Online
                            </span>
                            <span className="block text-xs text-gray-500">Sin presenciales</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Price */}
            <div className="text-center mb-6 pb-6 border-b border-earth-900/10">
                <p className="text-sm text-earth-900/60 mb-1">Inversión</p>
                {precioActual ? (
                    <PriceDisplay
                        precioOriginal={precioActual}
                        cantidadCuotas={curso.cantidad_cuotas}
                        descuentoPorcentaje={activeDescuentoPorcentaje}
                        descuentoCuposTotales={curso.descuento_cupos_totales}
                        descuentoCuposUsados={curso.descuento_cupos_usados}
                        descuentoEtiqueta={activeDescuentoEtiqueta}
                        descuentoFechaFin={curso.descuento_fecha_fin}
                        variant="sidebar"
                    />
                ) : (
                    <p className="font-heading text-4xl font-bold text-accent">Consultar</p>
                )}
            </div>

            {/* Quick Info */}
            <div className="space-y-4 mb-6">
                {curso.duracion && (
                    <div className="flex items-center gap-3 text-earth-900">
                        <Clock className="w-5 h-5 text-green-700 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-earth-900/60">Duración</p>
                            <p className="font-medium">{curso.duracion}</p>
                        </div>
                    </div>
                )}
                {(curso.lugar || curso.lugar_a_confirmar) && (
                    <div className="flex items-center gap-3 text-earth-900">
                        <MapPin className="w-5 h-5 text-green-700 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-earth-900/60">Lugar</p>
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
                <div className="flex items-center gap-3 text-earth-900">
                    <Calendar className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-earth-900/60">Inicio</p>
                        <p className="font-medium">
                            {curso.fecha_a_confirmar
                                ? 'Fecha a confirmar'
                                : formatearFechaLarga(curso.fecha_inicio) || 'Consultar'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
                {/* Timer Sutil si aplica */}
                <CountdownTimer
                    targetDate={curso.descuento_fecha_fin}
                    variant="subtle"
                    label="Tiempo restante del descuento:"
                    className="mb-2 border-amber-100 bg-amber-50/50"
                />

                <EnrollButton
                    courseId={curso.id}
                    courseName={curso.nombre}
                    coursePrice={precioActual}
                    linkMercadoPago={curso.link_mercado_pago}
                    cantidadCuotas={curso.cantidad_cuotas}
                    descuento_porcentaje={activeDescuentoPorcentaje}
                    descuento_cupos_totales={curso.descuento_cupos_totales}
                    descuento_cupos_usados={curso.descuento_cupos_usados}
                    descuento_etiqueta={activeDescuentoEtiqueta}
                    descuento_fecha_fin={curso.descuento_fecha_fin}
                />
                <Button asChild variant="outline" className="w-full" size="lg">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Phone className="w-4 h-4 mr-2" />
                        Consultar por WhatsApp
                    </a>
                </Button>
            </div>

            {/* Mercado Pago Link */}
            {curso.link_mercado_pago && (
                <div className="mt-4 pt-4 border-t border-earth-900/10">
                    <Button asChild variant="secondary" className="w-full">
                        <a href={curso.link_mercado_pago} target="_blank" rel="noopener noreferrer">
                            Pagar con Mercado Pago
                        </a>
                    </Button>
                </div>
            )}
        </div>
    );
}
