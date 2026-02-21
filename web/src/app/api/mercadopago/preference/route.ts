import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, price, quantity, payer_email, enrollment_id } = body;

        if (!process.env.MP_ACCESS_TOKEN) {
            console.error("Mercado Pago Access Token is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: enrollment_id,
                        title: title,
                        quantity: quantity,
                        unit_price: Number(price),
                        currency_id: 'UYU', // Or whichever currency you are using
                    },
                ],
                payer: {
                    email: payer_email,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/exito`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/error`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/pendiente`,
                },
                auto_return: 'approved',
                external_reference: String(enrollment_id), // Important to link payment to enrollment
                // notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`, // Can be added later
            }
        });

        return NextResponse.json({ init_point: result.init_point, sandbox_init_point: result.sandbox_init_point });

    } catch (error) {
        console.error('Error creating preference:', error);
        return NextResponse.json({ error: 'Error creating preference' }, { status: 500 });
    }
}
