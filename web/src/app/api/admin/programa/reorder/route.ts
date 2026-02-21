import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT - Reordenar clases del programa
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { clases } = body; // Array de { id, orden }

        if (!clases || !Array.isArray(clases)) {
            return NextResponse.json(
                { error: 'clases debe ser un array de { id, orden }' },
                { status: 400 }
            );
        }

        // Actualizar cada clase con su nuevo orden y número
        const updates = clases.map(({ id, orden }: { id: number; orden: number }) =>
            supabase
                .from('programa_clases')
                .update({
                    orden,
                    numero: orden + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error in PUT /api/admin/programa/reorder:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
