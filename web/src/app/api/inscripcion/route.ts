import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
    generateJuliaWhatsAppLink,
    generateConfirmationEmailHtml,
    generateConfirmationEmailText,
    EnrollmentData
} from '@/lib/utils/notifications';
import { generateAccessToken, getTokenExpiry, generateMagicLink } from '@/lib/utils/tokens';
import { sendEmail, scheduleEmailSequence } from '@/lib/services/emailService';
import { processTemplate } from '@/lib/utils/templateProcessor';
import { aplicarCodigo, normalizarCodigo } from '@/lib/utils/discountUtils';
import { sincronizarCorreccion, sincronizarPreinscripcion } from '@/lib/services/syncViejaWeb';
import {
    modalidadValida,
    normalizarModalidad,
    normalizarOrigen,
    notaDeOrigen,
    precioConDescuentoDelCurso,
    precioDeLista,
} from '@/lib/utils/modalidadInscripcion';
import {
    cambioElTelefono,
    estadoAlRehacer,
    perfilQueVino,
    precioPagadoAlRehacer,
} from '@/lib/utils/rehacerInscripcion';

const CAMPOS_FILA_ANTERIOR = 'id, access_token, notas, telefono, estado, modalidad_seleccionada';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            enrollment_id, // Si existe, actualizar registro existente
            curso_id,
            nombre,
            email,
            telefono,
            cedula,
            edad,
            departamento,
            direccion,
            como_se_entero,
            recibir_novedades,
            metodo_pago,
            codigo_descuento,
            tipo_pago,
            monto_pago,
            modalidad_seleccionada,
            origen,
        } = body;

        // Validate required fields
        if (!curso_id || !nombre || !email || !telefono) {
            return NextResponse.json(
                { success: false, message: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Get course data for notifications
        const { data: curso } = await supabase
            .from('cursos')
            .select('nombre, precio, fecha_inicio, url_web_vieja, modalidad, permite_online, precio_online, descuento_porcentaje, descuento_cupos_totales, descuento_cupos_usados, descuento_etiqueta, descuento_fecha_fin, descuento_online_porcentaje, descuento_online_etiqueta')
            .eq('id', curso_id)
            .single();

        const cursoNombre = curso?.nombre || `Curso #${curso_id}`;

        // Un código válido congela el precio en `precio_pagado`. Sin esto, el portal
        // del alumno (Mi inscripción) vuelve a mostrar el precio de lista, porque el
        // descuento por código no está cargado en el curso.
        // La opción elegida (con práctica o solo online) cambia el precio de lista.
        // Sin esto, el código se aplicaba siempre sobre el precio del curso completo.
        const modalidad = curso ? modalidadValida(curso, normalizarModalidad(modalidad_seleccionada)) : null;
        const precioBase = curso ? precioDeLista(curso, modalidad) : null;
        let precioPagado: number | null = null;
        if (codigo_descuento && precioBase) {
            const { data: validacion } = await supabase.rpc('validate_discount_code', {
                p_code: normalizarCodigo(String(codigo_descuento)),
                p_curso_id: curso_id,
            });
            const descuento = validacion?.[0];
            if (descuento?.valid) {
                precioPagado = aplicarCodigo(precioBase, descuento.tipo, descuento.valor);
            }
        }
        // Solo online sin código: también se congela, para que Mi inscripción no
        // muestre el precio del curso completo.
        if (precioPagado === null && modalidad === 'online' && curso) {
            precioPagado = precioConDescuentoDelCurso(curso, modalidad);
        }
        const conModalidad = modalidad ? { modalidad_seleccionada: modalidad } : {};
        const nota = notaDeOrigen(normalizarOrigen(origen));
        const conCodigo = precioPagado !== null ? { precio_pagado: precioPagado } : {};
        // Si tocó un método de pago apenas escribió el código, el monto del navegador
        // puede venir sin rebajar: acá manda el del código, salvo que deje una seña.
        const montoPago = precioPagado !== null && tipo_pago !== 'seña' ? precioPagado : (monto_pago || null);

        let data: { id: number } | null = null;
        let accessToken: string | undefined;
        let isNewEnrollment = false;

        // ============================================================
        // UPSERT LOGIC: Check if enrollment already exists for email+curso_id
        // ============================================================
        const { data: existingEnrollment } = await supabase
            .from('inscriptos')
            .select(CAMPOS_FILA_ANTERIOR)
            .eq('email', email)
            .eq('curso_id', curso_id)
            .single();

        if (existingEnrollment || enrollment_id) {
            // UPDATE existing enrollment
            const targetId = existingEnrollment?.id || enrollment_id;
            accessToken = existingEnrollment?.access_token;

            // Cómo estaba la reserva antes de pisarla: hace falta para no bajarle el
            // estado, no dejarle un precio viejo y saber si corrigió el número.
            let filaAnterior = existingEnrollment;
            if (!filaAnterior) {
                const { data: porId } = await supabase
                    .from('inscriptos')
                    .select(CAMPOS_FILA_ANTERIOR)
                    .eq('id', targetId)
                    .single();
                filaAnterior = porId ?? null;
            }

            const { data: updateResult, error } = await supabase
                .from('inscriptos')
                .update({
                    nombre,
                    telefono,
                    // El paso 2 no manda la cédula ni el resto del perfil: si llegan vacíos,
                    // no se borra lo que la persona ya había cargado.
                    ...perfilQueVino({ cedula, edad, departamento, direccion, como_se_entero }),
                    recibir_novedades: recibir_novedades || false,
                    metodo_pago: metodo_pago || null,
                    codigo_descuento: codigo_descuento || null,
                    tipo_pago: tipo_pago || 'total',
                    monto_pago: montoPago,
                    ...precioPagadoAlRehacer(precioPagado, filaAnterior?.modalidad_seleccionada, modalidad),
                    ...conModalidad,
                    ...(nota && existingEnrollment && !existingEnrollment.notas ? { notas: nota } : {}),
                    estado: estadoAlRehacer(filaAnterior?.estado),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', targetId)
                .select('id, access_token')
                .single();

            if (error) {
                console.error('Error updating enrollment:', error);
                return NextResponse.json(
                    { success: false, message: 'Error al actualizar inscripción' },
                    { status: 500 }
                );
            }
            data = { id: updateResult.id };
            accessToken = updateResult.access_token;
            console.log('📝 Updated existing enrollment:', { id: data.id, email, curso: cursoNombre });

            // Rehízo la reserva con otro número: que llegue también a la web vieja.
            if (curso?.url_web_vieja && filaAnterior && cambioElTelefono(filaAnterior.telefono, telefono)) {
                await sincronizarCorreccion({ nombre, email, telefono, cedula: cedula || null }, curso.url_web_vieja);
            }
        } else {
            // INSERT new enrollment
            isNewEnrollment = true;
            accessToken = generateAccessToken();
            const tokenExpiry = getTokenExpiry(30); // 30 días

            // Insert enrollment record with token
            const { data: insertResult, error } = await supabase
                .from('inscriptos')
                .insert({
                    curso_id,
                    nombre,
                    email,
                    telefono,
                    cedula: cedula || null,
                    edad: edad || null,
                    departamento: departamento || null,
                    direccion: direccion || null,
                    como_se_entero: como_se_entero || null,
                    recibir_novedades: recibir_novedades || false,
                    metodo_pago: metodo_pago || null,
                    codigo_descuento: codigo_descuento || null,
                    tipo_pago: tipo_pago || 'total',
                    monto_pago: montoPago,
                    ...conCodigo,
                    ...conModalidad,
                    ...(nota ? { notas: nota } : {}),
                    estado: 'pago_pendiente',
                    // Nuevos campos para sistema de recordatorio
                    access_token: accessToken,
                    token_expires_at: tokenExpiry.toISOString(),
                })
                .select('id')
                .single();

            if (error) {
                console.error('Error creating enrollment:', error);
                return NextResponse.json(
                    { success: false, message: 'Error al registrar inscripción' },
                    { status: 500 }
                );
            }
            data = insertResult;
        }

        if (!data) {
            return NextResponse.json(
                { success: false, message: 'Error procesando inscripción' },
                { status: 500 }
            );
        }

        // Prepare enrollment data for notifications
        const enrollmentData: EnrollmentData = {
            id: data.id,
            curso_id,
            curso_nombre: cursoNombre,
            nombre,
            email,
            telefono,
            cedula: cedula || null,
            metodo_pago,
            codigo_descuento: codigo_descuento || null,
        };

        // Generate notification links and templates
        const juliaNotificationLink = generateJuliaWhatsAppLink(enrollmentData);
        const magicLink = accessToken ? generateMagicLink(accessToken) : null;

        // REMOVED: Early return for existing enrollments to ensure email is always sent.
        // if (!isNewEnrollment) { ... }

        console.log('📋 Enrollment processed:', { id: data.id, curso: cursoNombre, nombre, email, metodo_pago });

        // ============================================================
        // ENVÍO DE EMAIL: Solo si NO pasó por /api/inscripcion/preinscripcion
        // (Si pasó por preinscripcion, el email ya se envió en Paso 1)
        // ============================================================
        if (!enrollment_id) {
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
                        access_token: accessToken || '',
                    },
                    curso: {
                        nombre: cursoNombre,
                        precio: curso?.precio,
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

                console.log('📨 Confirmation Email Result (fallback):', emailResult);
            }

            // Programar secuencia de emails de seguimiento (SOLO si no pasó por preinscripcion)
            if (isNewEnrollment) {
                await scheduleEmailSequence(data.id);
                if (curso?.url_web_vieja) {
                    await sincronizarPreinscripcion(
                        { id: data.id, nombre, email, telefono, cedula: cedula || null },
                        curso.url_web_vieja
                    );
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Inscripción registrada exitosamente',
            id: data.id,
            magicLink, // Link para acceder a la página personal
            // Return notification data for client-side handling
            notifications: {
                // WhatsApp link to notify Julia (can be opened in a new tab)
                juliaWhatsAppLink: juliaNotificationLink,
                // Email templates in case we want to integrate email sending later
                emailHtml: generateConfirmationEmailHtml(enrollmentData),
                emailText: generateConfirmationEmailText(enrollmentData),
                emailSubject: `Confirmación de inscripción: ${cursoNombre} - CEUTA`,
            },
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
