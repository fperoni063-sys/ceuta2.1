import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/comprobantes
 * Fetch paginated list of inscriptos with payment receipts
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - estado: Filter by estado (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const estado = searchParams.get('estado');

        const offset = (page - 1) * limit;

        const supabase = createAdminClient();

        // Build query
        let query = supabase
            .from('inscriptos')
            .select(`
                id,
                nombre,
                email,
                telefono,
                comprobante_url,
                comprobante_tipo,
                estado,
                metodo_pago,
                monto_pagado,
                monto_pago,
                codigo_descuento,
                updated_at,
                created_at,
                cursos:curso_id (
                    id,
                    nombre,
                    precio
                )
            `, { count: 'exact' })
            .not('comprobante_url', 'is', null)
            .order('updated_at', { ascending: false });

        // Apply estado filter if provided
        if (estado) {
            query = query.eq('estado', estado);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching comprobantes:', error);
            return NextResponse.json(
                { error: 'Error al obtener comprobantes' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                hasMore: offset + limit < (count || 0)
            }
        });

    } catch (error) {
        console.error('Error in comprobantes API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
