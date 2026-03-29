import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Next.js 13+ App Router config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Configuración de Cloudinary incompleta' }, { status: 500 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        // Generamos la firma para que el frontend pueda subir directamente un archivo pesando > 4.5MB
        // Forzaremos que vaya a la carpeta de videos.
        const folder = 'ceuta/cursos/videos';

        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: folder,
            },
            apiSecret
        );

        return NextResponse.json({
            signature,
            timestamp,
            folder,
            cloudName,
            apiKey
        });
    } catch (error) {
        console.error('Error generando firma de Cloudinary:', error);
        return NextResponse.json({ error: 'Error interno generando firma de subida' }, { status: 500 });
    }
}
