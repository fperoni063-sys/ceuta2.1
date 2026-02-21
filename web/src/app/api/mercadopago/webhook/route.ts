import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/lib/supabase/server';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        console.log(`Webhook received: topic=${topic}, id=${id}`);

        // Sometimes the body contains the data, so let's parse it just in case
        const body = await req.json().catch(() => ({}));
        const bodyId = body?.data?.id || body?.id;
        const finalId = id || bodyId;
        const finalTopic = topic || body?.type;

        if (finalTopic === 'payment') {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: finalId });

            if (paymentInfo.status === 'approved') {
                const enrollmentId = paymentInfo.external_reference;

                if (enrollmentId) {
                    const supabase = createAdminClient();

                    const { error } = await supabase
                        .from('inscriptos')
                        .update({
                            estado: 'confirmado', // Or 'pago_completado' depending on your logic
                            monto_pago: paymentInfo.transaction_amount,
                            metodo_pago: 'mercadopago',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', enrollmentId);

                    if (error) {
                        console.error('Error updating enrollment status in Supabase:', error);
                        // We return 200 anyway to stop MP from retrying indefinitely, but we log the error
                        return NextResponse.json({ status: 'error_updating_db' }, { status: 200 });
                    }

                    console.log(`Enrollment ${enrollmentId} confirmed via Mercado Pago Webhook.`);
                }
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
