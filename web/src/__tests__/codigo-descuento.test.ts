/** @jest-environment node */
import { NextRequest } from 'next/server';
import { aplicarCodigo, normalizarCodigo } from '@/lib/utils/discountUtils';
import { POST } from '@/app/api/validate-discount/route';
import { POST as inscribir } from '@/app/api/inscripcion/route';
import { createAdminClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({ createAdminClient: jest.fn() }));
jest.mock('@/lib/services/emailService', () => ({ sendEmail: jest.fn(), scheduleEmailSequence: jest.fn() }));
jest.mock('@/lib/utils/tokens', () => ({
    generateAccessToken: jest.fn(() => 'token'),
    getTokenExpiry: jest.fn(() => new Date()),
    generateMagicLink: jest.fn(() => 'enlace'),
}));

function validar(body: object, rpc: jest.Mock) {
    (createAdminClient as jest.Mock).mockReturnValue({ rpc });
    return POST(new NextRequest('http://localhost/api/validate-discount', {
        method: 'POST',
        body: JSON.stringify(body),
    }));
}

describe('/api/validate-discount', () => {
    // Regresión: la ruta llamaba con p_codigo, la base no encontraba la función y
    // ningún código funcionó nunca.
    it('llama a la función con el parámetro que existe en la base', async () => {
        const rpc = jest.fn().mockResolvedValue({ data: [{ valid: true, tipo: 'porcentaje', valor: 20, error_message: null }], error: null });
        const res = await validar({ codigo: 'monte 20', curso_id: 107 }, rpc);

        expect(rpc).toHaveBeenCalledWith('validate_discount_code', { p_code: 'MONTE20', p_curso_id: 107 });
        expect(await res.json()).toEqual({ valid: true, tipo: 'porcentaje', valor: 20 });
    });

    // Regresión: la función siempre devuelve una fila. Mirar si había datos daba por
    // bueno cualquier código.
    it('rechaza el código cuando la fila dice valid: false', async () => {
        const rpc = jest.fn().mockResolvedValue({ data: [{ valid: false, tipo: null, valor: null, error_message: 'Código vencido' }], error: null });
        const res = await validar({ codigo: 'MONTE20', curso_id: 107 }, rpc);

        expect(await res.json()).toEqual({ valid: false, message: 'Código vencido' });
    });

    it('avisa si la base falla', async () => {
        const rpc = jest.fn().mockResolvedValue({ data: null, error: { message: 'caída' } });
        const res = await validar({ codigo: 'MONTE20', curso_id: 107 }, rpc);

        expect(res.status).toBe(500);
        expect((await res.json()).valid).toBe(false);
    });
});

describe('/api/inscripcion con código', () => {
    // Devuelve lo que la ruta le manda a guardar en `inscriptos`.
    async function guardado(body: object, validacion: object) {
        let escrito: Record<string, unknown> = {};
        const cadena = (resultado: object) => {
            const c: Record<string, unknown> = { single: async () => resultado };
            for (const m of ['select', 'eq']) c[m] = () => c;
            c.update = (fila: Record<string, unknown>) => { escrito = fila; return c; };
            return c;
        };
        (createAdminClient as jest.Mock).mockReturnValue({
            rpc: jest.fn().mockResolvedValue({ data: [validacion], error: null }),
            from: (tabla: string) => cadena(tabla === 'cursos'
                ? { data: { nombre: 'Monte comestible', precio: 5000, fecha_inicio: '2026-11-10' } }
                : { data: { id: 1, access_token: 'token' }, error: null }),
        });
        await inscribir(new NextRequest('http://localhost/api/inscripcion', {
            method: 'POST',
            body: JSON.stringify({ enrollment_id: 1, curso_id: 107, nombre: 'A', email: 'a@b.uy', telefono: '099', ...body }),
        }));
        return escrito;
    }

    const valido = { valid: true, tipo: 'porcentaje', valor: 20, error_message: null };

    // Regresión: sin congelar el precio, Mi inscripción mostraba $ 5.000 al que usó el código.
    it('congela el precio y corrige el monto aunque el navegador mande el de lista', async () => {
        const fila = await guardado({ codigo_descuento: 'MONTE20', tipo_pago: 'total', monto_pago: 5000 }, valido);
        expect(fila).toMatchObject({ precio_pagado: 4000, monto_pago: 4000 });
    });

    it('con seña respeta los $ 500 de hoy y congela el total', async () => {
        const fila = await guardado({ codigo_descuento: 'MONTE20', tipo_pago: 'seña', monto_pago: 500 }, valido);
        expect(fila).toMatchObject({ precio_pagado: 4000, monto_pago: 500 });
    });

    it('un código que no sirve no cambia el precio', async () => {
        const fila = await guardado(
            { codigo_descuento: 'OTRO', tipo_pago: 'total', monto_pago: 5000 },
            { valid: false, tipo: null, valor: null, error_message: 'Código vencido' },
        );
        expect(fila).not.toHaveProperty('precio_pagado');
        expect(fila.monto_pago).toBe(5000);
    });
});

describe('normalizarCodigo', () => {
    it.each([['monte20'], ['MONTE 20'], [' monte 20 '], ['Monte20']])('%s queda en MONTE20', (texto) => {
        expect(normalizarCodigo(texto)).toBe('MONTE20');
    });
});

describe('aplicarCodigo', () => {
    it('20% de 5.000 son 4.000 justos', () => {
        expect(aplicarCodigo(5000, 'porcentaje', 20)).toBe(4000);
    });

    it('un monto no deja el precio en negativo', () => {
        expect(aplicarCodigo(500, 'monto', 800)).toBe(0);
    });

    it('sin tipo conocido no toca el precio', () => {
        expect(aplicarCodigo(5000, null, null)).toBe(5000);
    });
});
