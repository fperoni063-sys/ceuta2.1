import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/faqs?curso_id=X - Obtener FAQs de un curso (incluye globales)
// GET /api/faqs - Obtener solo FAQs globales
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const cursoId = searchParams.get('curso_id');
    const soloGlobales = searchParams.get('solo_globales') === 'true';

    const supabase = createAdminClient();

    let query = supabase
        .from('faqs_cursos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (soloGlobales) {
        // Solo FAQs globales
        query = query.is('curso_id', null);
    } else if (cursoId) {
        // FAQs del curso específico + globales
        query = query.or(`curso_id.eq.${cursoId},curso_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, data });
}

// POST /api/faqs - Crear nueva FAQ
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { curso_id, pregunta, respuesta, orden = 0 } = body;

        if (!pregunta || !respuesta) {
            return NextResponse.json(
                { success: false, message: 'Pregunta y respuesta son requeridos' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('faqs_cursos')
            .insert({
                curso_id: curso_id || null, // null = global
                pregunta,
                respuesta,
                orden,
                activo: true
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}

// PUT /api/faqs - Actualizar FAQ existente
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, pregunta, respuesta, orden, activo } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID es requerido' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (pregunta !== undefined) updateData.pregunta = pregunta;
        if (respuesta !== undefined) updateData.respuesta = respuesta;
        if (orden !== undefined) updateData.orden = orden;
        if (activo !== undefined) updateData.activo = activo;

        const { data, error } = await supabase
            .from('faqs_cursos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json(
            { success: false, message: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}

// DELETE /api/faqs?id=X - Eliminar FAQ
export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { success: false, message: 'ID es requerido' },
            { status: 400 }
        );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('faqs_cursos')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, message: 'FAQ eliminada' });
}
