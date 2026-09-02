'use client';

import { useCallback, useMemo, useState, useRef, ReactNode } from 'react';
import { EnrollmentModal } from '@/components/cursos/EnrollmentModal';
import { CourseStickyCta } from '@/components/cursos/CourseStickyCta';
import { calcularDescuento } from '@/lib/utils/discountUtils';
import {
    CourseEnrollContext,
    CourseEnrollContextValue,
    CourseEnrollData,
    Modalidad,
} from '@/components/cursos/courseEnrollStore';

export { useCourseEnroll } from '@/components/cursos/courseEnrollStore';
export type { CourseEnrollData } from '@/components/cursos/courseEnrollStore';

/**
 * Fuente única de verdad para la inscripción de un curso.
 *
 * Por qué existe: antes el estado del modal vivía dentro de EnrollButton y la
 * modalidad (híbrido / 100% online) dentro de CourseSidebarClient. Al sumar una
 * barra fija y CTAs repetidos en el contenido, cada uno habría montado su propio
 * modal y calculado su propio precio: el usuario podía ver $7.560 en la barra y
 * $12.600 en la sidebar según qué modalidad tuviera elegida. Acá hay UN modal y
 * UN precio, y todos los botones de la página los comparten.
 */
export function CourseEnrollProvider({
    curso,
    children,
}: {
    curso: CourseEnrollData;
    children: ReactNode;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalidad, setModalidad] = useState<Modalidad>('hibrido');
    const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);

    // Guarda para no reabrir el modal con doble toque en mobile.
    const lastOpenRef = useRef(0);

    const esHibridoConOnline = curso.modalidad === 'hibrido' && curso.permite_online === true;

    // Si el curso no admite online, la modalidad elegida es irrelevante: siempre híbrido.
    const modalidadEfectiva: Modalidad = esHibridoConOnline ? modalidad : 'hibrido';
    const esOnline = modalidadEfectiva === 'online';

    // precio_online puede venir null a propósito (ver CLAUDE.md): en ese caso el
    // online cuesta lo mismo que el presencial. No inventamos un precio distinto.
    const precioActual = esOnline ? (curso.precio_online ?? curso.precio) : curso.precio;

    const descuentoPorcentaje = esOnline
        ? curso.descuento_online_porcentaje
        : curso.descuento_porcentaje;

    const descuentoEtiqueta = esOnline
        ? curso.descuento_online_etiqueta
        : curso.descuento_etiqueta;

    const moneda: 'UYU' | 'ARS' = curso.es_curso_argentina ? 'ARS' : 'UYU';

    // Mismo cálculo que usa PriceDisplay, para que barra y sidebar no puedan divergir.
    // Ojo: calcularDescuento apaga el descuento si está vencido O si no quedan cupos.
    const { precioFinal, precioCuota, tieneDescuento } = useMemo(() => {
        if (precioActual === null || precioActual === undefined) {
            return { precioFinal: null, precioCuota: null, tieneDescuento: false };
        }
        const d = calcularDescuento({
            precioOriginal: precioActual,
            descuentoPorcentaje: descuentoPorcentaje ?? null,
            cuposTotales: curso.descuento_cupos_totales ?? null,
            cuposUsados: curso.descuento_cupos_usados ?? 0,
            etiqueta: descuentoEtiqueta ?? null,
            fechaFin: curso.descuento_fecha_fin ?? null,
        });
        const cuotas = curso.cantidad_cuotas > 1
            ? Math.round(d.precioFinal / curso.cantidad_cuotas)
            : null;
        return {
            precioFinal: d.precioFinal,
            precioCuota: cuotas,
            tieneDescuento: d.tieneDescuento,
        };
    }, [
        precioActual,
        descuentoPorcentaje,
        descuentoEtiqueta,
        curso.descuento_cupos_totales,
        curso.descuento_cupos_usados,
        curso.descuento_fecha_fin,
        curso.cantidad_cuotas,
    ]);

    const openModal = useCallback((_origen: string) => {
        const now = Date.now();
        if (now - lastOpenRef.current < 400) return;
        lastOpenRef.current = now;
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const anchorRef = useCallback((node: HTMLElement | null) => {
        setAnchorNode(node);
    }, []);

    const value = useMemo<CourseEnrollContextValue>(() => ({
        curso,
        esHibridoConOnline,
        modalidad: modalidadEfectiva,
        setModalidad,
        precioActual,
        descuentoPorcentaje,
        descuentoEtiqueta,
        precioFinal,
        precioCuota,
        tieneDescuento,
        moneda,
        openModal,
        closeModal,
        isModalOpen,
        anchorRef,
        anchorNode,
    }), [
        curso, esHibridoConOnline, modalidadEfectiva, precioActual, descuentoPorcentaje,
        descuentoEtiqueta, precioFinal, precioCuota, tieneDescuento, moneda,
        openModal, closeModal, isModalOpen, anchorRef, anchorNode,
    ]);

    return (
        <CourseEnrollContext.Provider value={value}>
            {children}

            {/* Barra fija: única en toda la página */}
            <CourseStickyCta />

            {/* Modal: único en toda la página */}
            <EnrollmentModal
                isOpen={isModalOpen}
                onClose={closeModal}
                courseId={curso.id}
                courseName={curso.nombre}
                coursePrice={precioActual}
                linkMercadoPago={curso.link_mercado_pago}
                cantidadCuotas={curso.cantidad_cuotas}
                descuento_porcentaje={descuentoPorcentaje}
                descuento_cupos_totales={curso.descuento_cupos_totales}
                descuento_cupos_usados={curso.descuento_cupos_usados}
                descuento_etiqueta={descuentoEtiqueta}
                descuento_fecha_fin={curso.descuento_fecha_fin}
                dlocalHabilitado={curso.dlocal_habilitado}
                courseSlug={curso.slug}
                esCursoArgentina={curso.es_curso_argentina}
            />
        </CourseEnrollContext.Provider>
    );
}
