import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/configuracion/pagos
 * Endpoint público que retorna la configuración de métodos de pago
 * para mostrar al usuario durante el proceso de inscripción.
 */
export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch all payment-related configuration
        const { data: configs, error } = await supabase
            .from('configuracion')
            .select('clave, valor')
            .in('clave', [
                // Cuenta para transferencia directa
                'banco_nombre',
                'banco_cuenta',
                'banco_titular',
                'banco_tipo',
                'banco_moneda',
                // Cuenta para Abitab/Red Pagos (puede ser diferente)
                'efectivo_banco_nombre',
                'efectivo_banco_cuenta',
                'efectivo_banco_titular',
                'efectivo_habilitado',
                'efectivo_instrucciones',
                'efectivo_codigo',
                // WhatsApp
                'whatsapp_julia',
            ]);

        if (error) {
            console.error('Error fetching payment config:', error);
            return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
        }

        // Convert array to object for easier access
        const configMap: Record<string, string> = {};
        configs?.forEach((c) => {
            configMap[c.clave] = c.valor;
        });

        // Structure the response
        const response = {
            // Cuenta para transferencia bancaria directa
            banco: {
                nombre: configMap['banco_nombre'] || 'BROU',
                cuenta: configMap['banco_cuenta'] || '',
                titular: configMap['banco_titular'] || 'CEUTA',
                tipo: configMap['banco_tipo'] || 'Caja de Ahorro en Pesos',
                moneda: configMap['banco_moneda'] || 'Pesos Uruguayos',
            },
            // Cuenta para pagos en Abitab/Red Pagos (puede ser diferente)
            efectivo: {
                habilitado: configMap['efectivo_habilitado'] === 'true',
                // Si hay cuenta específica para efectivo, usarla; sino usar la misma de transferencia
                banco: {
                    nombre: configMap['efectivo_banco_nombre'] || configMap['banco_nombre'] || 'BROU',
                    cuenta: configMap['efectivo_banco_cuenta'] || configMap['banco_cuenta'] || '600-7403522',
                    titular: configMap['efectivo_banco_titular'] || configMap['banco_titular'] || 'CEUTA',
                },
                instrucciones: configMap['efectivo_instrucciones'] || 'Acercate a cualquier Abitab o Red Pagos y solicitá realizar un depósito en la cuenta BROU (Caja de Ahorro en Pesos) detallada a continuación',
                codigo: configMap['efectivo_codigo'] || null,
            },
            whatsapp: configMap['whatsapp_julia'] || '+59898910715',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in payment config API:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
