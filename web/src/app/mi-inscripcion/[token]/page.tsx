import { notFound } from 'next/navigation';
import { MiInscripcionClient } from './MiInscripcionClient';
import { TokenExpiredClient } from './TokenExpiredClient';

interface PageProps {
    params: Promise<{ token: string }>;
}

interface ApiResponse {
    success: boolean;
    expired?: boolean;
    message?: string;
    emailHint?: string;
    cursoId?: number;
    cursoNombre?: string;
    data?: {
        id: number;
        nombre: string;
        email: string;
        estado: 'contacto' | 'pago_pendiente' | 'pago_a_verificar' | 'verificado' | 'cancelado' | 'primer_contacto' | 'segundo_contacto';
        metodo_pago: string;
        fecha_inscripcion: string;
        curso: {
            id: number;
            nombre: string;
            precio: number;
            link_mercado_pago?: string;
            fecha_inicio?: string;
            modalidad?: string;
            lugar?: string;
            cantidad_cuotas?: number;
            slug?: string;
            descripcion?: string | null;
            imagen_portada?: string | null;
            duracion?: string;
            categoria?: string | null;
            nivel?: string | null;
            transformacion_hook?: string | null;
            fecha_a_confirmar?: boolean;
            lugar_a_confirmar?: boolean;
            es_inscripcion_anticipada?: boolean;
            descuento_porcentaje?: number | null;
            descuento_cupos_totales?: number | null;
            descuento_cupos_usados?: number;
            descuento_etiqueta?: string | null;
            descuento_online_porcentaje?: number | null;
            descuento_online_etiqueta?: string | null;
            descuento_fecha_fin?: string | null;
            precio_online?: number | null;
        };
    };
}

async function getInscripcion(token: string): Promise<ApiResponse | null> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/mi-inscripcion/${token}`, {
        cache: 'no-store',
    });

    // Para 410 (token expirado), parseamos la respuesta igualmente
    if (res.status === 410) {
        return res.json();
    }

    if (!res.ok) return null;
    return res.json();
}

export default async function MiInscripcionPage({ params }: PageProps) {
    const { token } = await params;
    const result = await getInscripcion(token);

    // Si no hay resultado, 404
    if (!result) {
        notFound();
    }

    // Si el token expiró, mostrar página de recuperación
    if (result.expired) {
        return (
            <TokenExpiredClient
                emailHint={result.emailHint}
                cursoId={result.cursoId}
                cursoNombre={result.cursoNombre}
            />
        );
    }

    // Si no fue exitoso por otra razón, 404
    if (!result.success || !result.data) {
        notFound();
    }

    return <MiInscripcionClient data={result.data} token={token} />;
}

export async function generateMetadata() {
    return {
        title: 'Mi Preinscripción - CEUTA',
        robots: 'noindex, nofollow', // No indexar páginas personales
    };
}
