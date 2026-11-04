/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/mi-inscripcion/[token]/route';
import { createAdminClient } from '@/lib/supabase/server';
import { calculateFrozenPrice } from '@/lib/utils/priceLogic';

jest.mock('@/lib/supabase/server', () => ({ createAdminClient: jest.fn() }));

const token = 'a'.repeat(64);
const curso = { id: 107, nombre: 'Monte comestible', precio: 5000, cantidad_cuotas: 1 };
const reserva = { id: 1, nombre: 'A', email: 'a@b.uy', estado: 'pago_pendiente', metodo_pago: 'transferencia', created_at: '2026-11-04T17:47:32Z', cursos: curso };

async function lo_que_ve(fila: object) {
    const c: Record<string, unknown> = { single: async () => ({ data: fila, error: null }) };
    for (const m of ['select', 'eq', 'update']) c[m] = () => c;
    (createAdminClient as jest.Mock).mockReturnValue({ from: () => c });
    const res = await GET(new NextRequest(`http://localhost/api/mi-inscripcion/${token}`), { params: Promise.resolve({ token }) });
    const { data } = await res.json();
    return calculateFrozenPrice(data.curso, { fecha_inscripcion: data.fecha_inscripcion, precio_pagado: data.precio_pagado });
}

describe('/api/mi-inscripcion/[token]', () => {
    // Regresión: la ruta leía `precio_pagado` y no lo devolvía, así que la página de
    // pago mostraba $ 5.000 al que había reservado a 4.000 con el código.
    it('el que reservó con código ve el precio congelado', async () => {
        expect(await lo_que_ve({ ...reserva, precio_pagado: 4000 })).toMatchObject({ finalPrice: 4000, originalPrice: 5000, hasDiscount: true });
    });

    it('el que reservó sin código ve el precio del curso', async () => {
        expect(await lo_que_ve({ ...reserva, precio_pagado: null })).toMatchObject({ finalPrice: 5000, hasDiscount: false });
    });
});
