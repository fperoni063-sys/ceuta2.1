import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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
            p_codigo: codigo.toUpperCase(),
            p_curso_id: curso_id || null,
        });

        if (error) {
            console.error('Error validating discount:', error);
            return NextResponse.json(
                { valid: false, message: 'Error validando código' },
                { status: 500 }
            );
        }

        // The RPC returns the discount info if valid
        if (data && data.length > 0) {
            const discount = data[0];
            return NextResponse.json({
                valid: true,
                tipo: discount.tipo,
                valor: discount.valor,
                nombre: discount.nombre,
            });
        }

        return NextResponse.json({
            valid: false,
            message: 'Código inválido o expirado',
        });
    } catch (error) {
        console.error('Discount validation error:', error);
        return NextResponse.json(
            { valid: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
