import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            token,
            cedula,
            edad,
            departamento,
            direccion,
            como_se_entero,
        } = body;

        // Validaciones básicas
        if (!token || !cedula || !edad || !departamento || !direccion) {
            return NextResponse.json(
                { success: false, message: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Verificar token y actualizar
        const { data, error } = await supabase
            .from('inscriptos')
            .update({
                cedula,
                edad,
                departamento,
                direccion,
                como_se_entero: como_se_entero || null,
                updated_at: new Date().toISOString()
            })
            .eq('access_token', token)
            .select('id')
            .single();

        if (error || !data) {
            console.error('Error completando perfil:', error);
            return NextResponse.json(
                { success: false, message: 'Token inválido o error al guardar los datos' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Perfil completado exitosamente'
        });
    } catch (error) {
        console.error('Completar perfil error:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
