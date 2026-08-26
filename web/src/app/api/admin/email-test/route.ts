import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmailHtml } from '@/lib/utils/email-layout';
import { getEmailProviderStatus, sendEmail } from '@/lib/services/emailService';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

export async function GET() {
    const user = await requireAdmin();
    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.json(getEmailProviderStatus());
}

export async function POST(request: NextRequest) {
    const user = await requireAdmin();
    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const to = (typeof body.to === 'string' && body.to.trim()) || user.email;

    if (!to) {
        return NextResponse.json(
            { error: 'Indicá un email destino' },
            { status: 400 }
        );
    }

    const status = getEmailProviderStatus();
    if (!status.configured) {
        return NextResponse.json(
            {
                success: false,
                error: 'Email no configurado. Agregá RESEND_API_KEY en Vercel (ver CONFIGURAR_EMAIL.md).',
                provider: status.provider,
            },
            { status: 503 }
        );
    }

    const html = generateEmailHtml({
        title: 'Prueba de correo',
        content: `
            <p style="font-size: 16px; color: #374151; text-align: center;">
                Si estás leyendo esto, el envío de correos de CEUTA está funcionando.
            </p>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
                Proveedor: <strong>${status.provider}</strong><br/>
                Remitente: ${status.from}
            </p>
        `,
        previewText: 'Prueba de envío CEUTA',
        badgeText: '✅ Test',
        badgeColor: 'success',
    });

    const result = await sendEmail({
        to,
        subject: 'Prueba de correo — CEUTA',
        html,
        text: `Prueba de envío CEUTA. Proveedor: ${status.provider}. Remitente: ${status.from}`,
    });

    if (!result.success) {
        return NextResponse.json(
            { success: false, error: result.error, provider: status.provider },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        to,
        provider: result.provider,
        from: status.from,
    });
}
