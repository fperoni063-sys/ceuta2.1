import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Obtener clases del programa de un curso
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get('curso_id');

    if (!cursoId) {
        return NextResponse.json(
            { error: 'curso_id es requerido' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('programa_clases')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error fetching programa:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST - Crear nueva clase en el programa
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { curso_id, numero, titulo, tipo, practica_presencial, practica_virtual } = body;

        if (!curso_id || !titulo || !tipo) {
            return NextResponse.json(
                { error: 'curso_id, titulo y tipo son requeridos' },
                { status: 400 }
            );
        }

        // Obtener el máximo orden actual
        const { data: maxOrden } = await supabase
            .from('programa_clases')
            .select('orden')
            .eq('curso_id', curso_id)
            .order('orden', { ascending: false })
            .limit(1)
            .single();

        const nuevoOrden = (maxOrden?.orden ?? -1) + 1;

        // Obtener el máximo número actual
        const { data: maxNumero } = await supabase
            .from('programa_clases')
            .select('numero')
            .eq('curso_id', curso_id)
            .order('numero', { ascending: false })
            .limit(1)
            .single();

        const nuevoNumero = numero ?? (maxNumero?.numero ?? 0) + 1;

        const { data, error } = await supabase
            .from('programa_clases')
            .insert({
                curso_id,
                numero: nuevoNumero,
                titulo,
                tipo,
                practica_presencial: tipo === 'practico' ? (practica_presencial ?? false) : false,
                practica_virtual: tipo === 'practico' ? (practica_virtual ?? false) : false,
                orden: nuevoOrden,
                activo: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating clase:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error('Error in POST /api/admin/programa:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// PUT - Actualizar una clase
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'id es requerido' },
                { status: 400 }
            );
        }

        // Si el tipo es teórico, resetear las opciones de práctica
        if (updates.tipo === 'teorico') {
            updates.practica_presencial = false;
            updates.practica_virtual = false;
        }

        const { data, error } = await supabase
            .from('programa_clases')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating clase:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('Error in PUT /api/admin/programa:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE - Eliminar (soft delete) una clase
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'id es requerido' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('programa_clases')
        .update({ activo: false })
        .eq('id', id);

    if (error) {
        console.error('Error deleting clase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
