import { render, screen, waitFor } from '@testing-library/react';
import { CourseEnrollProvider, CourseEnrollData, useCourseEnroll } from '@/components/cursos/CourseEnrollContext';
import { CourseSidebarClient } from '@/components/cursos/CourseSidebarClient';
import { EnrollmentModal } from '@/components/cursos/EnrollmentModal';

jest.mock('@/components/cursos/EnrollmentModal', () => ({ EnrollmentModal: jest.fn(() => null) }));
jest.mock('@/components/cursos/CourseStickyCta', () => ({ CourseStickyCta: () => null }));

const curso: CourseEnrollData = {
    id: 107,
    nombre: 'Monte comestible',
    precio: 5000,
    cantidad_cuotas: 1,
    duracion: null,
    lugar: null,
    lugar_a_confirmar: false,
    departamento_probable: null,
    fecha_inicio: '2026-11-10',
    fecha_a_confirmar: false,
    link_mercado_pago: null,
    modalidad: 'hibrido',
    permite_online: false,
    precio_online: null,
    descuento_fecha_fin: '2026-11-06T23:59:59-03:00',
};

function Precio() {
    const { precioActual, precioFinal, tieneDescuento, codigoAplicado } = useCourseEnroll();
    return <p data-testid="precio">{JSON.stringify({ precioActual, precioFinal, tieneDescuento, codigoAplicado })}</p>;
}

function precioVisto() {
    return JSON.parse(screen.getByTestId('precio').textContent || '{}');
}

function abrir(busqueda: string, respuesta: () => Promise<unknown>) {
    window.history.pushState({}, '', `/cursos/monte-comestible${busqueda}`);
    global.fetch = jest.fn(respuesta) as jest.Mock;
    return render(<CourseEnrollProvider curso={curso}><Precio /></CourseEnrollProvider>);
}

const responde = (cuerpo: object) => () => Promise.resolve({ json: () => Promise.resolve(cuerpo) });
const valido = responde({ valid: true, tipo: 'porcentaje', valor: 20 });

describe('el código que trae el enlace', () => {
    it('sin código no llama a la API y queda el precio de lista', () => {
        abrir('', valido);

        expect(global.fetch).not.toHaveBeenCalled();
        expect(precioVisto()).toMatchObject({ precioFinal: 5000, tieneDescuento: false, codigoAplicado: null });
    });

    it('con un código válido, la ficha muestra el precio con el descuento', async () => {
        abrir('?codigo=monte%2020', valido);

        await waitFor(() => expect(precioVisto().precioFinal).toBe(4000));
        expect(precioVisto()).toMatchObject({ precioActual: 5000, tieneDescuento: true, codigoAplicado: 'MONTE20' });
        expect(global.fetch).toHaveBeenCalledWith('/api/validate-discount', expect.objectContaining({
            body: JSON.stringify({ codigo: 'MONTE20', curso_id: 107 }),
        }));
    });

    // Si le llegara el precio rebajado, el modal aplicaría el 20% sobre los 4.000.
    it('el modal sigue recibiendo el precio de lista', async () => {
        abrir('?codigo=MONTE20', valido);

        await waitFor(() => expect(precioVisto().precioFinal).toBe(4000));
        const ultima = (EnrollmentModal as unknown as jest.Mock).mock.lastCall?.[0];
        expect(ultima.coursePrice).toBe(5000);
    });

    it('con un código inválido o vencido, queda el precio de lista', async () => {
        abrir('?codigo=INVENTADO', responde({ valid: false, message: 'Código inválido' }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        await new Promise((listo) => setTimeout(listo));
        expect(precioVisto()).toMatchObject({ precioFinal: 5000, tieneDescuento: false, codigoAplicado: null });
    });

    it('si falla la validación, queda el precio de lista', async () => {
        abrir('?codigo=MONTE20', () => Promise.reject(new Error('sin red')));

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        await new Promise((listo) => setTimeout(listo));
        expect(precioVisto()).toMatchObject({ precioFinal: 5000, tieneDescuento: false, codigoAplicado: null });
    });

    it('la tarjeta dice el precio tachado, el rebajado y el código', async () => {
        window.history.pushState({}, '', '/cursos/monte-comestible?codigo=MONTE20');
        global.fetch = jest.fn(valido) as jest.Mock;
        render(<CourseEnrollProvider curso={curso}><CourseSidebarClient /></CourseEnrollProvider>);

        expect(await screen.findByText('Con tu código MONTE20')).toBeTruthy();
        expect(screen.getByText(/5\.000/).className).toContain('line-through');
        expect(screen.getAllByText(/4\.000/).length).toBeGreaterThanOrEqual(2);
    });
});
