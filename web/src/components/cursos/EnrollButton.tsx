'use client';

import { Button } from '@/components/ui/button';
import { useCourseEnroll } from '@/components/cursos/courseEnrollStore';

/**
 * CTA principal de la sidebar.
 *
 * Ya no monta su propio EnrollmentModal: el modal es unico y vive en
 * CourseEnrollProvider. Asi la barra fija, los CTA del contenido y este boton
 * abren siempre la misma instancia, con el mismo precio y la misma modalidad.
 *
 * El wrapper lleva el anchorRef del contexto: es lo que la barra fija observa
 * para saber si este boton sigue a la vista.
 */
export function EnrollButton() {
    const { openModal, anchorRef } = useCourseEnroll();

    return (
        <div ref={anchorRef}>
            <Button
                onClick={() => openModal('sidebar')}
                className="w-full"
                size="lg"
            >
                Reservar mi cupo - Gratis
            </Button>
        </div>
    );
}
