import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface ReorderItem {
    id: number;
    orden: number;
}

// PUT /api/faqs/reorder - Reordenar FAQs
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { items }: { items: ReorderItem[] } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json(
                { success: false, message: 'Items array es requerido' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Actualizar cada item con su nuevo orden
        const updates = items.map((item) =>
            supabase
                .from('faqs_cursos')
                .update({ orden: item.orden, updated_at: new Date().toISOString() })
                .eq('id', item.id)
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true, message: 'Orden actualizado' });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}
