import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { normalizarCodigo } from '@/lib/utils/discountUtils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { codigo, curso_id } = body;

        if (!codigo) {
            return NextResponse.json(
                { valid: false, message: 'Código requerido' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Call the RPC function to validate the discount
        const { data, error } = await supabase.rpc('validate_discount_code', {
            p_code: normalizarCodigo(String(codigo)),
            p_curso_id: curso_id || null,
        });

        if (error) {
            console.error('Error validating discount:', error);
            return NextResponse.json(
                { valid: false, message: 'Error validando código' },
                { status: 500 }
            );
        }

        // La función SIEMPRE devuelve una fila: si el código sirve lo dice `valid`,
        // no el hecho de que haya datos.
        const discount = data?.[0];
        if (discount?.valid) {
            return NextResponse.json({
                valid: true,
                tipo: discount.tipo,
                valor: discount.valor,
            });
        }

        return NextResponse.json({
            valid: false,
            message: discount?.error_message || 'Código inválido o expirado',
        });
    } catch (error) {
        console.error('Discount validation error:', error);
        return NextResponse.json(
            { valid: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
