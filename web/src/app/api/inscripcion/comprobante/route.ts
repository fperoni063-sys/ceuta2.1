import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { uploadFile, UPLOAD_FOLDERS } from '@/lib/cloudinary';
import { sendPaymentProofReceivedEmail } from '@/lib/services/emailService';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
];

function generateFilename(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `comprobante_${timestamp}_${random}`;
}

/**
 * POST /api/inscripcion/comprobante
 * Upload a payment receipt (image or PDF)
 * 
 * Body: FormData with:
 * - file: The receipt file (image/pdf)
 * - token: Access token from the inscription
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const token = formData.get('token') as string | null;

        // Validation: File required
        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó archivo' },
                { status: 400 }
            );
        }

        // Validation: Token required
        if (!token) {
            return NextResponse.json(
                { error: 'Token de acceso requerido' },
                { status: 400 }
            );
        }

        // Validation: File type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP, GIF o PDF.' },
                { status: 400 }
            );
        }

        // Validation: File size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Archivo muy grande. Máximo 10MB.' },
                { status: 400 }
            );
        }

        // Verify token and get inscription
        const supabase = createAdminClient();
        const { data: inscripto, error: tokenError } = await supabase
            .from('inscriptos')
            .select('id, nombre, curso_id, estado')
            .eq('access_token', token)
            .single();

        if (tokenError || !inscripto) {
            return NextResponse.json(
                { error: 'Token inválido o inscripción no encontrada' },
                { status: 401 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const filename = generateFilename();

        // Determine resource type based on file
        const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';

        // Upload to Cloudinary
        const result = await uploadFile(
            buffer,
            UPLOAD_FOLDERS['comprobantes'],
            filename,
            resourceType
        );

        // Update inscription with receipt URL and change status
        const adminClient = createAdminClient();
        const { error: updateError } = await adminClient
            .from('inscriptos')
            .update({
                comprobante_url: result.url,
                estado: 'pago_a_verificar',
                updated_at: new Date().toISOString(),
            })
            .eq('id', inscripto.id);

        if (updateError) {
            console.error('Error updating inscription:', updateError);
            return NextResponse.json(
                { error: 'Error al actualizar inscripción' },
                { status: 500 }
            );
        }

        // Send confirmation email (Fire and forget, don't block response)
        sendPaymentProofReceivedEmail(inscripto.id)
            .then(res => {
                if (!res.success) console.error('Error sending proof email:', res.error);
                else console.log('📧 Proof received email sent');
            })
            .catch(err => console.error('Error sending proof email:', err));

        return NextResponse.json({
            success: true,
            url: result.url,
            message: 'Comprobante subido exitosamente. Tu pago está siendo verificado.',
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Error al procesar el comprobante' },
            { status: 500 }
        );
    }
}
