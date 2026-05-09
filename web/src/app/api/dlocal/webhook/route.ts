import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
    validateWebhookSignature,
    retrievePayment,
} from '@/lib/services/dlocalService';

/**
 * POST /api/dlocal/webhook
 * 
 * Receives payment status change notifications from dLocal Go.
 * dLocal sends: { payment_id: "DP-XXXXX" }
 * Header: Authorization: V2-HMAC-SHA256, Signature: <sig>
 * 
 * MUST return 200 OK or dLocal will retry every 10 min for 30 days.
 */
export async function POST(request: NextRequest) {
    try {
        // ============================================================
        // 1. READ RAW BODY FOR SIGNATURE VALIDATION
        // ============================================================
        const rawBody = await request.text();
        const authHeader = request.headers.get('authorization') || '';

        console.log('[dLocal Webhook] Received notification');

        // ============================================================
        // 2. VALIDATE HMAC-SHA256 SIGNATURE
        // ============================================================
        // In sandbox mode, dLocal might not send signatures consistently.
        // We validate when present, but log warnings when missing.
        const hasDLocalKeys = process.env.DLOCAL_API_KEY && process.env.DLOCAL_SECRET_KEY;

        if (hasDLocalKeys && authHeader) {
            const isValid = validateWebhookSignature(rawBody, authHeader);
            if (!isValid) {
                console.error('[dLocal Webhook] ❌ Invalid signature - rejecting');
                // Return 200 to prevent infinite retries, but don't process
                return NextResponse.json({ status: 'invalid_signature' }, { status: 200 });
            }
            console.log('[dLocal Webhook] ✅ Signature validated');
        } else if (!authHeader) {
            console.warn('[dLocal Webhook] ⚠️ No Authorization header - processing anyway (sandbox?)');
        }

        // ============================================================
        // 3. PARSE BODY
        // ============================================================
        let body: { payment_id?: string };
        try {
            body = JSON.parse(rawBody);
        } catch {
            console.error('[dLocal Webhook] Failed to parse body:', rawBody);
            return NextResponse.json({ status: 'invalid_body' }, { status: 200 });
        }

        const paymentId = body.payment_id;
        if (!paymentId) {
            console.error('[dLocal Webhook] No payment_id in body');
            return NextResponse.json({ status: 'missing_payment_id' }, { status: 200 });
        }

        console.log('[dLocal Webhook] Processing payment:', paymentId);

        // ============================================================
        // 4. RETRIEVE FULL PAYMENT DETAILS FROM DLOCAL
        // ============================================================
        const paymentDetails = await retrievePayment(paymentId);
        const paymentStatus = paymentDetails.status;

        console.log('[dLocal Webhook] Payment status:', {
            id: paymentId,
            status: paymentStatus,
            amount: paymentDetails.amount,
            order_id: paymentDetails.order_id,
        });

        const supabase = createAdminClient();

        // ============================================================
        // 5. FIND OUR PAYMENT RECORD
        // ============================================================
        const { data: dlocalPago, error: findError } = await supabase
            .from('dlocal_pagos')
            .select('id, inscripto_id, status')
            .eq('dlocal_payment_id', paymentId)
            .maybeSingle();

        if (findError) {
            console.error('[dLocal Webhook] Error finding payment:', findError);
            return NextResponse.json({ status: 'db_error' }, { status: 200 });
        }

        if (!dlocalPago) {
            console.warn('[dLocal Webhook] Payment not found in DB:', paymentId);
            // Might be a payment from a different environment or old data
            return NextResponse.json({ status: 'payment_not_found' }, { status: 200 });
        }

        // ============================================================
        // 6. UPDATE DLOCAL_PAGOS RECORD
        // ============================================================
        const { error: updatePaymentError } = await supabase
            .from('dlocal_pagos')
            .update({
                status: paymentStatus,
                raw_notification: paymentDetails as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
            })
            .eq('id', dlocalPago.id);

        if (updatePaymentError) {
            console.error('[dLocal Webhook] Error updating dlocal_pagos:', updatePaymentError);
        }

        // ============================================================
        // 7. UPDATE INSCRIPTO BASED ON PAYMENT STATUS
        // ============================================================
        const inscriptoId = dlocalPago.inscripto_id;

        if (paymentStatus === 'PAID') {
            // ✅ Payment successful — auto-verify the enrollment
            console.log('[dLocal Webhook] ✅ Payment PAID - verifying inscription:', inscriptoId);

            const { error: updateError } = await supabase
                .from('inscriptos')
                .update({
                    estado: 'verificado',
                    monto_pagado: paymentDetails.amount,
                    metodo_pago: 'dlocal',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', inscriptoId);

            if (updateError) {
                console.error('[dLocal Webhook] Error updating inscripto:', updateError);
            }

            // Cancel pending reminder emails
            const { error: cancelError } = await supabase
                .from('scheduled_emails')
                .update({ estado: 'cancelled' })
                .eq('inscripto_id', inscriptoId)
                .eq('estado', 'pending');

            if (cancelError) {
                console.error('[dLocal Webhook] Error cancelling emails:', cancelError);
            }

            console.log('[dLocal Webhook] 🎉 Enrollment verified and emails cancelled for:', inscriptoId);

        } else if (paymentStatus === 'REJECTED' || paymentStatus === 'CANCELLED') {
            // ❌ Payment failed
            console.log('[dLocal Webhook] ❌ Payment', paymentStatus, 'for inscription:', inscriptoId);

            // We don't change the inscripto estado — they can retry or use another method
            // Just log it for admin visibility

        } else if (paymentStatus === 'EXPIRED') {
            // ⏰ Payment expired
            console.log('[dLocal Webhook] ⏰ Payment EXPIRED for inscription:', inscriptoId);
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });

    } catch (error) {
        console.error('[dLocal Webhook] Unhandled error:', error);
        // Return 200 to prevent infinite retries
        return NextResponse.json({ status: 'error' }, { status: 200 });
    }
}
