import { NextRequest, NextResponse } from 'next/server';
import { retrievePayment } from '@/lib/services/dlocalService';

/**
 * GET /api/dlocal/retrieve-payment?payment_id=DP-XXXXX
 * 
 * Retrieves payment status from dLocal Go.
 * Used by admin panel or frontend to check payment status.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get('payment_id');

        if (!paymentId) {
            return NextResponse.json(
                { error: 'payment_id is required' },
                { status: 400 }
            );
        }

        const payment = await retrievePayment(paymentId);

        return NextResponse.json({
            success: true,
            payment: {
                id: payment.id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                order_id: payment.order_id,
                created_date: payment.created_date,
            },
        });

    } catch (error) {
        console.error('[dLocal] Retrieve payment error:', error);
        return NextResponse.json(
            { error: 'Error retrieving payment' },
            { status: 500 }
        );
    }
}
