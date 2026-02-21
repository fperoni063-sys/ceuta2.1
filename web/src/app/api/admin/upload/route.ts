import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, isValidFolder, type UploadFolder } from '@/lib/cloudinary';

// Next.js 13+ App Router config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateFilename(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folder = formData.get('folder') as string | null;

        // Validation
        if (!file) {
            return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
        }

        if (!folder || !isValidFolder(folder)) {
            return NextResponse.json({ error: 'Carpeta inválida' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Imagen muy grande (máx 5MB)' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const filename = generateFilename();

        // Upload to Cloudinary
        const result = await uploadImage(buffer, folder as UploadFolder, filename);

        return NextResponse.json({
            success: true,
            url: result.url,
            publicId: result.publicId,
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Return specific error message for configuration issues
        const errorMessage = error instanceof Error ? error.message : 'Error al procesar la imagen';
        const isConfigError = errorMessage.includes('configuration') || errorMessage.includes('Missing');

        return NextResponse.json(
            { error: isConfigError ? errorMessage : 'Error al procesar la imagen' },
            { status: isConfigError ? 503 : 500 }
        );
    }
}
