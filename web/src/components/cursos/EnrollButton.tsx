'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnrollmentModal } from '@/components/cursos/EnrollmentModal';

interface EnrollButtonProps {
    courseId: number;
    courseName: string;
    coursePrice: number | null;
    linkMercadoPago?: string | null;
    cantidadCuotas?: number;
    // Discount fields
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
}

export function EnrollButton({
    courseId,
    courseName,
    coursePrice,
    linkMercadoPago,
    cantidadCuotas,
    descuento_porcentaje,
    descuento_cupos_totales,
    descuento_cupos_usados,
    descuento_etiqueta,
    descuento_fecha_fin,
}: EnrollButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full"
                size="lg"
            >
                Reservar mi Cupo
            </Button>
            <EnrollmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseId={courseId}
                courseName={courseName}
                coursePrice={coursePrice}
                linkMercadoPago={linkMercadoPago}
                cantidadCuotas={cantidadCuotas}
                descuento_porcentaje={descuento_porcentaje}
                descuento_cupos_totales={descuento_cupos_totales}
                descuento_cupos_usados={descuento_cupos_usados}
                descuento_etiqueta={descuento_etiqueta}
                descuento_fecha_fin={descuento_fecha_fin}
            />
        </>
    );
}
