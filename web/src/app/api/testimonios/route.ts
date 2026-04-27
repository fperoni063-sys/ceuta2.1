import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/testimonios?curso_id=X
export async function GET(request: NextRequest) {
    const cursoId = request.nextUrl.searchParams.get('curso_id');

    const supabase = createAdminClient();

    let query = supabase
        .from('testimonios_cursos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (cursoId) {
        query = query.eq('curso_id', cursoId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}

// POST /api/testimonios
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { curso_id, nombre, texto, foto_url, orden = 0 } = body;

        if (!nombre || !texto) {
            return NextResponse.json(
                { success: false, message: 'Nombre y texto son requeridos' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('testimonios_cursos')
            .insert({
                curso_id,
                nombre,
                texto,
                foto_url: foto_url || null,
                orden,
                activo: true,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}

// PUT /api/testimonios
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, nombre, texto, foto_url, activo } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID es requerido' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const updateData: Record<string, unknown> = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (texto !== undefined) updateData.texto = texto;
        if (foto_url !== undefined) updateData.foto_url = foto_url;
        if (activo !== undefined) updateData.activo = activo;

        const { data, error } = await supabase
            .from('testimonios_cursos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}

// DELETE /api/testimonios?id=X
export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, message: 'ID es requerido' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('testimonios_cursos')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Testimonio eliminado' });
}
