'use client';

import { createContext, useContext } from 'react';

/**
 * Contexto y tipos de la inscripción, separados del provider a propósito.
 *
 * El provider importa la barra fija y el modal; esos, a su vez, necesitan el
 * hook. Si todo viviera en el mismo archivo habría un ciclo de imports. Este
 * módulo no importa componentes, así que corta el ciclo.
 */

export interface CourseEnrollData {
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
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
    descuento_online_porcentaje?: number | null;
    descuento_online_etiqueta?: string | null;
    dlocal_habilitado?: boolean;
    slug?: string;
    es_curso_argentina?: boolean;
}

export type Modalidad = 'hibrido' | 'online';

export interface CourseEnrollContextValue {
    curso: CourseEnrollData;
    /** Solo true si el curso es híbrido Y admite cursada 100% online. */
    esHibridoConOnline: boolean;
    modalidad: Modalidad;
    setModalidad: (m: Modalidad) => void;

    /** Precio de lista de la modalidad elegida. null = "Consultar". */
    precioActual: number | null;
    descuentoPorcentaje: number | null | undefined;
    descuentoEtiqueta: string | null | undefined;
    /** Precio ya con descuento aplicado (o el de lista si no hay descuento vigente). */
    precioFinal: number | null;
    /** Precio por cuota, o null si el curso es de pago único. */
    precioCuota: number | null;
    tieneDescuento: boolean;
    moneda: 'UYU' | 'ARS';

    openModal: (origen: string) => void;
    closeModal: () => void;
    isModalOpen: boolean;

    /**
     * Ref para el CTA principal de la sidebar. La barra fija se muestra recién
     * cuando este nodo sale de pantalla, así no hay dos botones iguales a la vez.
     */
    anchorRef: (node: HTMLElement | null) => void;
    anchorNode: HTMLElement | null;
}

export const CourseEnrollContext = createContext<CourseEnrollContextValue | null>(null);

export function useCourseEnroll(): CourseEnrollContextValue {
    const ctx = useContext(CourseEnrollContext);
    if (!ctx) {
        throw new Error('useCourseEnroll debe usarse dentro de <CourseEnrollProvider>');
    }
    return ctx;
}
