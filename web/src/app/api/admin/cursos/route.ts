import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/cursos - List all courses (for admin)
 */
export async function GET() {
    try {
        // Verify authentication first
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Use admin client to get all courses
        const adminClient = createAdminClient();
        const { data: cursos, error } = await adminClient
            .from('cursos')
            .select('*')
            .order('orden', { ascending: true });

        if (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(cursos);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

/**
 * POST /api/admin/cursos - Create a new course
 */
export async function POST(request: NextRequest) {
    try {
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
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
