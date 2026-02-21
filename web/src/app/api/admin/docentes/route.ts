import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/docentes - List all teachers
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const adminClient = createAdminClient();
        const { data: docentes, error } = await adminClient
            .from('docentes')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error fetching docentes:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(docentes);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

/**
 * POST /api/admin/docentes - Create a new teacher
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('docentes')
            .insert({
                nombre: body.nombre,
                descripcion: body.descripcion || '',
                foto_url: body.foto_url || '',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating docente:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
