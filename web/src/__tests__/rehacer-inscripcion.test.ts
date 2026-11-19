/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST as inscribir } from '@/app/api/inscripcion/route';
import { POST as preinscribir } from '@/app/api/inscripcion/preinscripcion/route';
import { createAdminClient } from '@/lib/supabase/server';
import { sincronizarCorreccion, sincronizarPreinscripcion } from '@/lib/services/syncViejaWeb';
import {
    cambioElTelefono,
    claveDeTelefono,
    estadoAlRehacer,
    perfilQueVino,
    precioPagadoAlRehacer,
} from '@/lib/utils/rehacerInscripcion';

jest.mock('@/lib/supabase/server', () => ({ createAdminClient: jest.fn() }));
jest.mock('@/lib/services/emailService', () => ({ sendEmail: jest.fn(), scheduleEmailSequence: jest.fn() }));
jest.mock('@/lib/utils/tokens', () => ({
    generateAccessToken: jest.fn(() => 'token'),
    getTokenExpiry: jest.fn(() => new Date()),
    generateMagicLink: jest.fn(() => 'enlace'),
}));
jest.mock('@/lib/services/syncViejaWeb', () => ({
    ...jest.requireActual('@/lib/services/syncViejaWeb'),
    sincronizarPreinscripcion: jest.fn().mockResolvedValue({ success: true }),
    sincronizarCorreccion: jest.fn().mockResolvedValue({ success: true }),
}));

const URL_VIEJA = 'https://www.ceuta.org.uy/cursos/calendario/209/-jardines-biodiversos-tu-jardin-de-mariposas';

// Jardín de mariposas: 4.000 con la práctica, 3.500 solo por Zoom.
const JARDINES = {
    nombre: 'Jardines biodiversos: tu jardín de mariposas',
    precio: 4000,
    precio_online: 3500,
    permite_online: true,
    modalidad: 'hibrido',
    fecha_inicio: '2026-11-25',
    url_web_vieja: URL_VIEJA,
};

// La reserva que ya existe: hecha solo por Zoom, con el número mal.
const RESERVA = {
    id: 304,
    access_token: 'tok',
    notas: null,
    nombre: 'María',
    telefono: '099697594',
    estado: 'pago_pendiente',
    modalidad_seleccionada: 'online',
};

/** Arma una base falsa y devuelve lo que las rutas le mandan a actualizar en `inscriptos`. */
function base(reserva: object | null) {
    const actualizaciones: Record<string, unknown>[] = [];
    const despuesDeActualizar = () => {
        const c: Record<string, unknown> = {
            error: null,
            single: async () => ({ data: { id: 304, access_token: 'tok' }, error: null }),
        };
        for (const m of ['select', 'eq']) c[m] = () => c;
        return c;
    };
    const consulta = (resultado: object) => {
        const c: Record<string, unknown> = { single: async () => resultado };
        for (const m of ['select', 'eq']) c[m] = () => c;
        c.update = (fila: Record<string, unknown>) => {
            actualizaciones.push(fila);
            return despuesDeActualizar();
        };
        return c;
    };
    (createAdminClient as jest.Mock).mockReturnValue({
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
        from: (tabla: string) => consulta(
            tabla === 'cursos'
                ? { data: JARDINES, error: null }
                : { data: reserva, error: reserva ? null : { message: 'sin filas' } }
        ),
    });
    return actualizaciones;
}

function pedir(ruta: string, body: object) {
    return new NextRequest(`http://localhost${ruta}`, { method: 'POST', body: JSON.stringify(body) });
}

const PASO_2 = {
    enrollment_id: 304,
    curso_id: 108,
    nombre: 'María',
    email: 'maria@correo.uy',
    telefono: '099697594',
    metodo_pago: 'transferencia',
    tipo_pago: 'total',
};

beforeEach(() => jest.clearAllMocks());

describe('rehacer la reserva en el paso 2 (/api/inscripcion)', () => {
    // Regresión 19/11/2026: el completo quedaba con el precio de solo online congelado.
    it('de solo online a completo: precio_pagado se borra y queda el completo', async () => {
        const actualizaciones = base(RESERVA);
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, modalidad_seleccionada: 'hibrido', monto_pago: 4000 }));
        expect(actualizaciones[0]).toMatchObject({ precio_pagado: null, modalidad_seleccionada: 'hibrido', monto_pago: 4000 });
    });

    it('si sigue en solo online, queda el precio online', async () => {
        const actualizaciones = base(RESERVA);
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, modalidad_seleccionada: 'online', monto_pago: 3500 }));
        expect(actualizaciones[0]).toMatchObject({ precio_pagado: 3500, modalidad_seleccionada: 'online' });
    });

    it('no le baja el estado a quien ya mandó el comprobante', async () => {
        const actualizaciones = base({ ...RESERVA, estado: 'pago_a_verificar' });
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, modalidad_seleccionada: 'online' }));
        expect(actualizaciones[0].estado).toBe('pago_a_verificar');
    });

    it('una reserva recién hecha pasa a pago pendiente, como siempre', async () => {
        const actualizaciones = base({ ...RESERVA, estado: 'contacto' });
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, modalidad_seleccionada: 'online' }));
        expect(actualizaciones[0].estado).toBe('pago_pendiente');
    });

    it('no borra la cédula ni el perfil que el paso 2 no manda', async () => {
        const actualizaciones = base(RESERVA);
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, modalidad_seleccionada: 'online' }));
        for (const campo of ['cedula', 'edad', 'departamento', 'direccion', 'como_se_entero']) {
            expect(actualizaciones[0]).not.toHaveProperty(campo);
        }
    });

    it('si corrigió el número, va una inscripción nueva a la web vieja', async () => {
        const actualizaciones = base(RESERVA);
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, telefono: '099 697 597', modalidad_seleccionada: 'online' }));
        expect(actualizaciones[0].telefono).toBe('099 697 597');
        expect(sincronizarCorreccion).toHaveBeenCalledWith(
            expect.objectContaining({ nombre: 'María', email: 'maria@correo.uy', telefono: '099 697 597' }),
            URL_VIEJA
        );
        expect(sincronizarPreinscripcion).not.toHaveBeenCalled();
    });

    it('el mismo número escrito de otra forma no manda nada a la web vieja', async () => {
        base(RESERVA);
        await inscribir(pedir('/api/inscripcion', { ...PASO_2, telefono: '+598 99 697 594', modalidad_seleccionada: 'online' }));
        expect(sincronizarCorreccion).not.toHaveBeenCalled();
    });
});

describe('rehacer la reserva en el paso 1 (/api/inscripcion/preinscripcion)', () => {
    const PASO_1 = { curso_id: 108, nombre: 'María', email: 'maria@correo.uy', modalidad_seleccionada: 'online' };

    it('con otro número: corrige la reserva que tenía y la manda a la web vieja', async () => {
        const actualizaciones = base(RESERVA);
        const res = await preinscribir(pedir('/api/inscripcion/preinscripcion', { ...PASO_1, telefono: '099697597' }));
        const json = await res.json();

        expect(json).toMatchObject({ success: true, id: 304, isExisting: true });
        expect(actualizaciones).toHaveLength(1);
        expect(actualizaciones[0]).toMatchObject({ nombre: 'María', telefono: '099697597' });
        expect(actualizaciones[0]).not.toHaveProperty('estado');
        expect(sincronizarCorreccion).toHaveBeenCalledWith(
            expect.objectContaining({ telefono: '099697597', email: 'maria@correo.uy' }),
            URL_VIEJA
        );
    });

    it('con los mismos datos no toca nada', async () => {
        const actualizaciones = base(RESERVA);
        await preinscribir(pedir('/api/inscripcion/preinscripcion', { ...PASO_1, telefono: '099 697 594' }));
        expect(actualizaciones).toHaveLength(0);
        expect(sincronizarCorreccion).not.toHaveBeenCalled();
    });

    it('si solo corrige el nombre, lo guarda pero no duplica en la web vieja', async () => {
        const actualizaciones = base(RESERVA);
        await preinscribir(pedir('/api/inscripcion/preinscripcion', { ...PASO_1, nombre: 'María Alicia', telefono: '099697594' }));
        expect(actualizaciones[0]).toMatchObject({ nombre: 'María Alicia' });
        expect(sincronizarCorreccion).not.toHaveBeenCalled();
    });
});

describe('ayudas para rehacer la reserva', () => {
    it.each([['099697597'], ['099 697 597'], ['+598 99 697 597'], ['59899697597'], ['0059899697597']])(
        '%s es el mismo número',
        (numero) => expect(claveDeTelefono(numero)).toBe('99697597')
    );

    it('un número vacío no cuenta como corrección', () => {
        expect(cambioElTelefono('099697594', '')).toBe(false);
        expect(cambioElTelefono('099697594', '099697597')).toBe(true);
    });

    it('el precio guardado a mano no se toca si no cambia de opción', () => {
        expect(precioPagadoAlRehacer(null, 'hibrido', 'hibrido')).toEqual({});
        expect(precioPagadoAlRehacer(null, 'online', 'hibrido')).toEqual({ precio_pagado: null });
        expect(precioPagadoAlRehacer(3500, 'hibrido', 'online')).toEqual({ precio_pagado: 3500 });
    });

    it('estados que se conservan y los que vuelven a pago pendiente', () => {
        expect(estadoAlRehacer('verificado')).toBe('verificado');
        expect(estadoAlRehacer('confirmado')).toBe('confirmado');
        expect(estadoAlRehacer('rechazado')).toBe('pago_pendiente');
        expect(estadoAlRehacer(undefined)).toBe('pago_pendiente');
    });

    it('el perfil vacío no pisa lo guardado', () => {
        expect(perfilQueVino({ cedula: '', edad: null, departamento: 'Canelones' })).toEqual({ departamento: 'Canelones' });
    });

    // La web vieja descarta curso, cédula y día repetidos: la corrección tiene que
    // ir con otra cédula de relleno que la del primer envío.
    it('la corrección no repite la cédula de relleno del primer envío', () => {
        const { construirCiSync } = jest.requireActual('@/lib/services/syncViejaWeb');
        const primerEnvio = construirCiSync({ id: 304, email: 'maria@correo.uy', telefono: '099697594' });
        const correccion = construirCiSync({ id: null, email: 'maria@correo.uy', telefono: '099697597' });
        expect(primerEnvio).toBe('00000304');
        expect(correccion).toMatch(/^00\d{6}$/);
        expect(correccion).not.toBe(primerEnvio);
    });
});
