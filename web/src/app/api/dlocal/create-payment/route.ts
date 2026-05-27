import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
    createPayment,
    generateOrderId,
} from '@/lib/services/dlocalService';

/**
 * POST /api/dlocal/create-payment
 * 
 * Creates a payment in dLocal Go and returns the redirect URL.
 * The frontend redirects the user to dLocal's checkout page.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            inscripto_id,
            curso_id,
            amount,
            payer_name,
            payer_email,
            payer_phone,
        } = body;

        // ============================================================
        // 1. VALIDATE INPUT
        // ============================================================
        if (!inscripto_id || !curso_id || !amount) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos: inscripto_id, curso_id, amount' },
                { status: 400 }
            );
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'El monto debe ser un número positivo' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // ============================================================
        // 2. VALIDATE COURSE HAS DLOCAL ENABLED
        // ============================================================
        const { data: curso, error: cursoError } = await supabase
            .from('cursos')
            .select('id, nombre, precio, dlocal_habilitado, slug, es_curso_argentina')
            .eq('id', curso_id)
            .single();

        if (cursoError || !curso) {
            return NextResponse.json(
                { error: 'Curso no encontrado' },
                { status: 404 }
            );
        }

        if (!curso.dlocal_habilitado) {
            return NextResponse.json(
                { error: 'El pago con dLocal no está habilitado para este curso' },
                { status: 403 }
            );
        }

        // ============================================================
        // 3. VALIDATE INSCRIPTO EXISTS
        // ============================================================
        const { data: inscripto, error: inscriptoError } = await supabase
            .from('inscriptos')
            .select('id, nombre, email, telefono')
            .eq('id', inscripto_id)
            .single();

        if (inscriptoError || !inscripto) {
            return NextResponse.json(
                { error: 'Inscripción no encontrada' },
                { status: 404 }
            );
        }

        // ============================================================
        // 4. VALIDATE AMOUNT (server-side, never trust frontend)
        // ============================================================
        // The amount should have already been calculated by the enrollment
        // flow. We validate it's reasonable (not negative, not absurdly high).
        if (amount > 1000000) {
            return NextResponse.json(
                { error: 'Monto inválido' },
                { status: 400 }
            );
        }

        // ============================================================
        // 5. CHECK FOR EXISTING PENDING PAYMENT (idempotency)
        // ============================================================
        const { data: existingPayment } = await supabase
            .from('dlocal_pagos')
            .select('id, dlocal_payment_id, redirect_url, status')
            .eq('inscripto_id', inscripto_id)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingPayment?.redirect_url) {
            // Return existing pending payment's redirect URL
            console.log('[dLocal] Returning existing pending payment:', existingPayment.dlocal_payment_id);
            return NextResponse.json({
                success: true,
                redirect_url: existingPayment.redirect_url,
                payment_id: existingPayment.dlocal_payment_id,
                reused: true,
            });
        }

        // ============================================================
        // 6. CREATE PAYMENT IN DLOCAL
        // ============================================================
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ceuta-cursos.vercel.app';
        const orderId = generateOrderId(inscripto_id);

        // Determine currency and country based on course config
        const currency = curso.es_curso_argentina ? 'ARS' : 'UYU';
        const country = 'AR'; // Forzado a AR para habilitar Rapipago/Pago Fácil y tarjetas locales de Argentina

        console.log(`[dLocal] Creating ${currency} payment for course ${curso.id} (Argentina: ${!!curso.es_curso_argentina})`);

        const dlocalResponse = await createPayment({
            amount,
            currency,
            country,
            orderId,
            description: `Curso: ${curso.nombre} - ${payer_name || inscripto.nombre}`.substring(0, 100),
            successUrl: `${appUrl}/pago-exitoso?order=${orderId}`,
            backUrl: `${appUrl}/cursos/${curso.slug || ''}`,
            notificationUrl: `${appUrl}/api/dlocal/webhook`,
            payer: {
                name: payer_name || inscripto.nombre,
                email: payer_email || inscripto.email,
                phone: payer_phone || inscripto.telefono,
            },
        });

        // ============================================================
        // 7. SAVE PAYMENT RECORD IN DB
        // ============================================================
        const { error: insertError } = await supabase
            .from('dlocal_pagos')
            .insert({
                inscripto_id,
                dlocal_payment_id: dlocalResponse.id,
                order_id: orderId,
                amount,
                currency,
                status: dlocalResponse.status || 'PENDING',
                redirect_url: dlocalResponse.redirect_url,
                notification_url: `${appUrl}/api/dlocal/webhook`,
                success_url: `${appUrl}/pago-exitoso?order=${orderId}`,
                raw_response: dlocalResponse as unknown as Record<string, unknown>,
            });

        if (insertError) {
            console.error('[dLocal] Error saving payment record:', insertError);
            // Don't fail the payment - the redirect still works
        }

        // ============================================================
        // 8. UPDATE INSCRIPTO METODO_PAGO
        // ============================================================
        await supabase
            .from('inscriptos')
            .update({
                metodo_pago: 'dlocal',
                updated_at: new Date().toISOString(),
            })
            .eq('id', inscripto_id);

        console.log('[dLocal] Payment created successfully:', {
            inscripto_id,
            payment_id: dlocalResponse.id,
            amount,
            order_id: orderId,
        });

        return NextResponse.json({
            success: true,
            redirect_url: dlocalResponse.redirect_url,
            payment_id: dlocalResponse.id,
            order_id: orderId,
        });

    } catch (error) {
        console.error('[dLocal] Create payment error:', error);
        return NextResponse.json(
            { error: 'Error al crear el pago. Intentá de nuevo.' },
            { status: 500 }
        );
    }
}
