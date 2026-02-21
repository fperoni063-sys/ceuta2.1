import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Calendar, Clock, MapPin, Monitor, Users2 } from 'lucide-react';
import { PriceDisplay, DiscountBadge } from '@/components/cursos/PriceDisplay';
import { formatearPrecio, formatearFechaMedia } from '@/lib/utils/discountUtils';

export interface CourseCardData {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string | null;
    precio: number | null;
    fecha_inicio: string | null;
    duracion: string | null;
    modalidad: string | null;
    lugar: string | null;
    nivel: string | null;
    categoria: string | null;
    imagen_portada: string | null;
    transformacion_hook: string | null;
    fecha_a_confirmar?: boolean;
    lugar_a_confirmar?: boolean;
    es_inscripcion_anticipada?: boolean;
    cantidad_cuotas?: number;
    // Discount fields
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
    descuento_online_porcentaje?: number | null;
    descuento_online_etiqueta?: string | null;
}

interface CourseCardProps {
    course: CourseCardData;
    noLink?: boolean;
}

export function CourseCard({ course, noLink = false }: CourseCardProps) {

    // Solo mostrar modalidad si es 100% online o 100% presencial (NO híbrido)
    const getModalityDisplay = (modalidad: string | null) => {
        const m = modalidad?.toLowerCase();
        if (m === 'virtual' || m === 'online') {
            return { label: '100% Online', icon: Monitor };
        }
        if (m === 'presencial') {
            return { label: 'Presencial', icon: Users2 };
        }
        // Híbrido: no mostrar nada en la card
        return null;
    };

    const modalityDisplay = getModalityDisplay(course.modalidad);

    const cardContent = (
        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-700/30 bg-background">
            {/* Course Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
                {course.imagen_portada ? (
                    <Image
                        src={course.imagen_portada}
                        alt={course.nombre}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-700/20 to-earth-900/10 flex items-center justify-center">
                        <span className="text-earth-900/30 font-heading text-2xl">CEUTA</span>
                    </div>
                )}
                {/* Badges: Inscripción Anticipada y/o Modalidad (solo si no es híbrido) */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                    {course.es_inscripcion_anticipada && (
                        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                            Anticipada
                        </Badge>
                    )}
                    {/* Discount Badge */}
                    <DiscountBadge
                        porcentaje={course.descuento_porcentaje}
                        etiqueta={course.descuento_etiqueta}
                        className="shadow-sm"
                    />
                    {modalityDisplay && (
                        <Badge variant="secondary" className="bg-background/90 text-earth-900 backdrop-blur-sm">
                            <modalityDisplay.icon className="w-3 h-3 mr-1" />
                            {modalityDisplay.label}
                        </Badge>
                    )}
                </div>
            </div>

            <CardHeader className="pb-2 pt-4 px-4">
                <h3 className="font-serif text-xl font-bold text-earth-900 group-hover:text-green-700 transition-colors leading-tight">
                    {course.nombre}
                </h3>
            </CardHeader>

            <CardContent className="px-4 pb-4">
                {/* Description - now below title */}
                <p className="text-foreground/70 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {course.transformacion_hook || course.descripcion || 'Aprende con nosotros'}
                </p>

                {/* Course Details */}
                <div className="space-y-2.5 text-sm text-foreground/70">
                    <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-green-700 shrink-0" />
                        <span>
                            {course.fecha_a_confirmar
                                ? 'Fecha a confirmar'
                                : formatearFechaMedia(course.fecha_inicio) || 'Consultar'
                            }
                        </span>
                    </div>
                    {course.duracion && (
                        <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-green-700 shrink-0" />
                            <span>{course.duracion}</span>
                        </div>
                    )}
                    <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                        <span className="leading-snug">
                            {course.lugar_a_confirmar
                                ? 'A coordinar'
                                : course.lugar || 'Consultar'
                            }
                            {/* If we have modality and it's mixed, we might want to append it here if it's not in the badge */}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-4 py-4 border-t border-earth-900/10 mt-auto bg-background/50">
                {/* Price */}
                <div className="w-full">
                    {course.precio ? (
                        <PriceDisplay
                            precioOriginal={course.precio}
                            cantidadCuotas={course.cantidad_cuotas}
                            descuentoPorcentaje={course.descuento_porcentaje}
                            descuentoCuposTotales={course.descuento_cupos_totales}
                            descuentoCuposUsados={course.descuento_cupos_usados}
                            descuentoEtiqueta={null} // No mostrar etiqueta en footer de card, ya está en badge de imagen
                            descuentoFechaFin={course.descuento_fecha_fin}
                            variant="card"
                            className="items-start"
                        />
                    ) : (
                        <span className="font-semibold text-green-700">
                            {formatearPrecio(course.precio)}
                        </span>
                    )}
                </div>
            </CardFooter>
        </Card>
    );

    if (noLink) {
        return <div className="block">{cardContent}</div>;
    }

    return (
        <Link href={`/cursos/${course.slug || course.id}`} className="block group">
            {cardContent}
        </Link>
    );
}

