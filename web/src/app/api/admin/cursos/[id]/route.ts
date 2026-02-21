import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/cursos/[id] - Get a single course
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Verify authentication first
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const adminClient = createAdminClient();
        const { data: curso, error } = await adminClient
            .from('cursos')
            .select(`
                *,
                docentes:docente_id (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching course:', error);
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(curso);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

/**
 * PUT /api/admin/cursos/[id] - Update a course
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Verify authentication first
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();

        // Use admin client (service role) to bypass RLS
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('cursos')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating course:', error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/cursos/[id] - Soft delete a course
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Verify authentication first
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('cursos')
            .update({ activo: false })
            .eq('id', id);

        if (error) {
            console.error('Error archiving course:', error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }

        return NextResponse.json({ success: true, archived: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
