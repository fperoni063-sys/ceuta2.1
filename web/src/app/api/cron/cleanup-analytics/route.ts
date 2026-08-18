import { NextRequest, NextResponse } from 'next/server';
import { purgeOldAnalyticsEvents } from '@/app/actions/analytics';

// Verificar que la petición proviene de Vercel Cron o contiene el token secreto
function isValidCronRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
    // En producción, validar que la solicitud viene de Vercel Cron autorizado
    if (process.env.NODE_ENV === 'production' && !isValidCronRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Purgar eventos de más de 30 días de antigüedad
    const result = await purgeOldAnalyticsEvents(30);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error || 'Error al purgar eventos de analytics' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        message: 'Purga de analytics ejecutada exitosamente',
        deletedCount: result.deletedCount,
        timestamp: new Date().toISOString()
    });
}
