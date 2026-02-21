export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Listar todos los templates
export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('orden_secuencia', { ascending: true, nullsFirst: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates: data });
}

// PUT: Actualizar un template
export async function PUT(request: NextRequest) {
    const body = await request.json();
    const { id, asunto, contenido_html, contenido_texto, activo } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('email_templates')
        .update({
            asunto,
            contenido_html,
            contenido_texto,
            activo,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
