import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateAccessToken, getTokenExpiry } from '@/lib/utils/tokens';
import { sendEmail, scheduleEmailSequence } from '@/lib/services/emailService';
import { processTemplate } from '@/lib/utils/templateProcessor';
import { calcularDescuento, extraerConfigDescuento, formatearPrecio } from '@/lib/utils/discountUtils';
import { sincronizarPreinscripcion } from '@/lib/services/syncViejaWeb';

/**
 * Pre-inscripción: Guarda solo los datos de contacto iniciales (Paso 1)
 * Este endpoint crea un registro con estado 'contacto' que luego se actualiza
 * cuando el usuario completa los pasos siguientes.
 * 
 * IMPORTANTE: Este endpoint ahora envía el email de confirmación inmediatamente
 * para capturar leads que abandonen después del Paso 1.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { curso_id, nombre, email, telefono, event_id } = body;

        // Validate required fields
        if (!curso_id || !nombre || !email || !telefono) {
            return NextResponse.json(
                { success: false, message: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Get course data for email template
        const { data: curso } = await supabase
            .from('cursos')
            .select('nombre, precio, fecha_inicio, descuento_porcentaje, descuento_cupos_totales, descuento_cupos_usados, descuento_etiqueta, descuento_fecha_fin, url_web_vieja')
            .eq('id', curso_id)
            .single();

        const cursoNombre = curso?.nombre || `Curso #${curso_id}`;

        // Calcular precio con descuento para el email
        let precioParaMostrar = formatearPrecio(curso?.precio || 0);

        if (curso) {
            const configDescuento = extraerConfigDescuento(curso);
            const resultadoDescuento = calcularDescuento(configDescuento);
            precioParaMostrar = formatearPrecio(resultadoDescuento.precioFinal);

            // Log para debug
            console.log('💰 Precio calculado para email:', {
                original: curso.precio,
                final: resultadoDescuento.precioFinal,
                tieneDescuento: resultadoDescuento.tieneDescuento
            });
        }

        // Check if email is already registered for this course
        const { data: existing } = await supabase
            .from('inscriptos')
            .select('id, estado, access_token')
            .eq('curso_id', curso_id)
            .eq('email', email)
            .single();

        // If already exists, return the existing ID with token for cookie
        if (existing) {
            console.log('📋 Pre-inscripción existente encontrada:', existing.id);
            return NextResponse.json({
                success: true,
                message: 'Pre-inscripción existente',
                id: existing.id,
                accessToken: existing.access_token,
                cursoNombre,
                isExisting: true,
            });
        }

        // Generate access token for future magic link
        const accessToken = generateAccessToken();
        const tokenExpiry = getTokenExpiry(30); // 30 días

        // Insert initial enrollment record with only contact data
        const { data, error } = await supabase
            .from('inscriptos')
            .insert({
                curso_id,
                nombre,
                email,
                telefono,
                estado: 'contacto', // Estado inicial para solo contacto
                access_token: accessToken,
                token_expires_at: tokenExpiry.toISOString(),
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating pre-enrollment:', error);
            return NextResponse.json(
                { success: false, message: 'Error al registrar pre-inscripción' },
                { status: 500 }
            );
        }

        // Log for tracking conversions
        console.log('📋 Nueva pre-inscripción (contacto):', {
            id: data.id,
            curso_id,
            nombre,
            email,
            telefono,
        });

        // ============================================================
        // ENVÍO DE EMAIL DE CONFIRMACIÓN (INMEDIATO - Paso 1)
        // ============================================================
        try {
            const { data: template } = await supabase
                .from('email_templates')
                .select('*')
                .eq('nombre', 'confirmacion')
                .eq('activo', true)
                .single();

            if (template) {
                const context = {
                    inscripto: {
                        id: data.id,
                        nombre,
                        email,
                        telefono,
                        access_token: accessToken,
                    },
                    curso: {
                        nombre: cursoNombre,
                        precio: precioParaMostrar,
                        fecha_inicio: curso?.fecha_inicio,
                    },
                };

                const emailHtml = processTemplate(template.contenido_html, context);
                const emailText = processTemplate(template.contenido_texto, context);
                const emailSubject = processTemplate(template.asunto, context);

                // Enviar email de confirmación
                const emailResult = await sendEmail({
                    to: email,
                    subject: emailSubject,
                    html: emailHtml,
                    text: emailText,
                }, data.id, 'confirmacion');

                console.log('📧 Email de confirmación enviado (Paso 1):', emailResult);

                // Programar secuencia de recordatorios (24h, 72h, 7d)
                await scheduleEmailSequence(data.id);
            }
        } catch (emailError) {
            // No bloqueamos el flujo si falla el email
            console.error('⚠️ Error enviando email de confirmación:', emailError);
        }

        // ============================================================
        // SINCRONIZACIÓN CON WEB VIEJA (Modo Hacker)
        // ============================================================
        if (curso?.url_web_vieja) {
            // Hacemos await pero es seguro porque tiene un AbortController de 4s
            await sincronizarPreinscripcion({ nombre, email, telefono }, curso.url_web_vieja);
        }

        // ============================================================
        // META CONVERSIONS API (Server-side) — Fire and forget
        // Sends the Lead event to Meta for campaign optimization.
        // This NEVER blocks the response or affects the user flow.
        // ============================================================
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_CAPI_ACCESS_TOKEN && event_id) {
                const { createHash } = await import('crypto');
                const hashSha256 = (val: string) => createHash('sha256').update(val.trim().toLowerCase()).digest('hex');

                const eventData = {
                    data: [{
                        event_name: 'Lead',
                        event_time: Math.floor(Date.now() / 1000),
                        event_id: event_id,
                        action_source: 'website',
                        event_source_url: request.headers.get('referer') || 'https://ceuta.org.uy',
                        user_data: {
                            em: [hashSha256(email)],
                            ph: [hashSha256(telefono.replace(/\D/g, ''))],
                            fn: [hashSha256(nombre.split(' ')[0])],
                            client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || '',
                            client_user_agent: request.headers.get('user-agent') || '',
                        },
                        custom_data: {
                            content_name: cursoNombre,
                            content_category: 'course_enrollment',
                            content_ids: [String(curso_id)],
                        },
                    }],
                };

                // Fire without await — response goes to user immediately
                fetch(
                    `https://graph.facebook.com/v20.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_CAPI_ACCESS_TOKEN}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(eventData),
                    }
                )
                .then(res => res.json())
                .then(result => console.log('[META-CAPI] ✅ Lead enviado (server):', result))
                .catch(err => console.warn('[META-CAPI] ⚠️ Error (ignorado):', err));
            }
        } catch (capiError) {
            // Absolutely never let this block the response
            console.warn('[META-CAPI] ⚠️ Error preparando evento (ignorado):', capiError);
        }

        return NextResponse.json({
            success: true,
            message: 'Datos de contacto guardados exitosamente',
            id: data.id,
            accessToken, // Para guardar en cookie inmediatamente
            cursoNombre, // Para mostrar en el banner
            isExisting: false,
        });
    } catch (error) {
        console.error('Pre-enrollment error:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}

