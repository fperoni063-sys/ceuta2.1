# Sistema de Recordatorio - Parte 2: Templates y APIs

---

## 7. Templates de Email - Contenido por Defecto

### 7.1 Seed de templates iniciales

```typescript
// Archivo: src/lib/data/defaultEmailTemplates.ts

export const defaultEmailTemplates = [
    {
        nombre: 'confirmacion',
        asunto: '✅ Tu preinscripción a {{curso_nombre}} está confirmada',
        orden_secuencia: 1,
        horas_despues: 0, // Inmediato
        descripcion: 'Email de confirmación inmediata tras la preinscripción',
        variables_disponibles: [
            '{{nombre}}', '{{nombre_corto}}', '{{email}}', '{{telefono}}',
            '{{curso_nombre}}', '{{curso_precio}}', '{{metodo_pago}}',
            '{{link_inscripcion}}', '{{fecha_inicio}}'
        ],
        contenido_html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d6a4f; margin: 0;">CEUTA</h1>
            <p style="color: #6b7280; margin: 5px 0;">Centro Uruguayo de Tecnologías Apropiadas</p>
        </div>
        
        <!-- Contenido principal -->
        <h2 style="color: #3d2914;">¡Hola {{nombre_corto}}! 🌱</h2>
        
        <p style="font-size: 16px; color: #374151;">
            Recibimos tu preinscripción al curso <strong>{{curso_nombre}}</strong>.
        </p>
        
        <p style="font-size: 16px; color: #374151;">
            Tu lugar está reservado. Solo falta completar el pago para confirmar definitivamente tu inscripción.
        </p>
        
        <!-- Botón principal -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px;">
                COMPLETAR MI INSCRIPCIÓN
            </a>
        </div>
        
        <!-- Info del curso -->
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">Detalles de tu preinscripción:</h3>
            <ul style="color: #374151; list-style: none; padding: 0; margin: 0;">
                <li style="padding: 5px 0;">📚 <strong>Curso:</strong> {{curso_nombre}}</li>
                <li style="padding: 5px 0;">💰 <strong>Inversión:</strong> {{curso_precio}}/mes</li>
                <li style="padding: 5px 0;">📅 <strong>Inicio:</strong> {{fecha_inicio}}</li>
            </ul>
        </div>
        
        <!-- Próximos pasos -->
        <div style="background-color: #faf6f1; padding: 20px; border-radius: 12px;">
            <h3 style="color: #3d2914; margin-top: 0;">Próximos pasos:</h3>
            <ol style="color: #374151; padding-left: 20px;">
                <li>Hacé clic en el botón de arriba</li>
                <li>Elegí tu método de pago</li>
                <li>¡Listo! Te confirmaremos tu lugar</li>
            </ol>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
                ¿Tenés dudas? Escribinos por 
                <a href="https://wa.me/59898843651" style="color: #25D366;">WhatsApp</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px;">
                CEUTA - Canelones 1198, Montevideo
            </p>
        </div>
    </div>
</body>
</html>`,
        contenido_texto: `¡Hola {{nombre_corto}}!

Recibimos tu preinscripción al curso "{{curso_nombre}}".

Tu lugar está reservado. Solo falta completar el pago para confirmar definitivamente tu inscripción.

👉 Completá tu inscripción acá: {{link_inscripcion}}

DETALLES:
- Curso: {{curso_nombre}}
- Inversión: {{curso_precio}}/mes
- Inicio: {{fecha_inicio}}

PRÓXIMOS PASOS:
1. Hacé clic en el link de arriba
2. Elegí tu método de pago
3. ¡Listo! Te confirmaremos tu lugar

¿Dudas? WhatsApp: 098 843 651

---
CEUTA - Canelones 1198, Montevideo`
    },
    
    {
        nombre: 'recordatorio_24h',
        asunto: '{{nombre_corto}}, tu lugar en {{curso_nombre}} te está esperando',
        orden_secuencia: 2,
        horas_despues: 24,
        descripcion: 'Recordatorio suave después de 24 horas',
        variables_disponibles: [
            '{{nombre}}', '{{nombre_corto}}', '{{curso_nombre}}', 
            '{{link_inscripcion}}', '{{curso_precio}}'
        ],
        contenido_html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">Solo un recordatorio amigable...</h2>
        
        <p style="color: #374151; font-size: 16px;">
            Hola {{nombre_corto}}, vimos que te preinscribiste a <strong>{{curso_nombre}}</strong> 
            pero todavía no completaste tu inscripción.
        </p>
        
        <p style="color: #374151; font-size: 16px;">
            🤔 <strong>¿Tenés alguna duda?</strong>
        </p>
        
        <!-- FAQs -->
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>❓ "¿Puedo pagar mes a mes?"</strong><br>
            <span style="color: #6b7280;">→ Sí, el pago es mensual. Sin compromiso a largo plazo.</span></p>
            
            <p style="margin: 10px 0;"><strong>❓ "¿Qué pasa si no puedo ir a una clase?"</strong><br>
            <span style="color: #6b7280;">→ Las clases quedan grabadas para que las veas después.</span></p>
            
            <p style="margin: 10px 0;"><strong>❓ "¿Tiene certificado?"</strong><br>
            <span style="color: #6b7280;">→ Sí, certificado oficial de CEUTA al completar el curso.</span></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                COMPLETAR INSCRIPCIÓN
            </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Si decidiste no inscribirte, no hay problema. Este es el último recordatorio.
        </p>
    </div>
</body>
</html>`,
        contenido_texto: `Solo un recordatorio amigable...

Hola {{nombre_corto}}, vimos que te preinscribiste a "{{curso_nombre}}" 
pero todavía no completaste tu inscripción.

¿Tenés alguna duda?

❓ "¿Puedo pagar mes a mes?"
→ Sí, el pago es mensual. Sin compromiso a largo plazo.

❓ "¿Qué pasa si no puedo ir a una clase?"
→ Las clases quedan grabadas para que las veas después.

❓ "¿Tiene certificado?"
→ Sí, certificado oficial de CEUTA.

👉 Completá tu inscripción: {{link_inscripcion}}

---
CEUTA`
    },
    
    {
        nombre: 'urgencia_72h',
        asunto: '⚠️ {{nombre_corto}}, quedan pocos lugares para {{curso_nombre}}',
        orden_secuencia: 3,
        horas_despues: 72,
        descripcion: 'Email de urgencia con prueba social',
        variables_disponibles: [
            '{{nombre_corto}}', '{{curso_nombre}}', '{{link_inscripcion}}'
        ],
        contenido_html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">{{nombre_corto}}, 📊 actualización de tu curso:</h2>
        
        <p style="color: #374151; font-size: 16px;">
            Queríamos avisarte que el curso <strong>"{{curso_nombre}}"</strong> 
            está recibiendo muchas inscripciones.
        </p>
        
        <!-- Testimonios -->
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">💬 Lo que dicen nuestros estudiantes:</h3>
            
            <blockquote style="border-left: 3px solid #f59e0b; padding-left: 15px; margin: 15px 0; font-style: italic; color: #78350f;">
                "El mejor curso que hice. Los profes son increíbles y el contenido muy práctico."
                <br><strong>— María G., egresada 2024</strong>
            </blockquote>
            
            <blockquote style="border-left: 3px solid #f59e0b; padding-left: 15px; margin: 15px 0; font-style: italic; color: #78350f;">
                "Me cambió la perspectiva profesional. 100% recomendado."
                <br><strong>— Carlos R., egresado 2024</strong>
            </blockquote>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #dc2626; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                ASEGURAR MI LUGAR
            </a>
        </div>
    </div>
</body>
</html>`,
        contenido_texto: `{{nombre_corto}}, actualización de tu curso:

El curso "{{curso_nombre}}" está recibiendo muchas inscripciones.

💬 Lo que dicen nuestros estudiantes:

"El mejor curso que hice. Los profes son increíbles."
— María G., egresada 2024

"Me cambió la perspectiva profesional."
— Carlos R., egresada 2024

👉 Asegurá tu lugar: {{link_inscripcion}}

---
CEUTA`
    },
    
    {
        nombre: 'ultima_oportunidad_7d',
        asunto: 'Tu preinscripción expira pronto',
        orden_secuencia: 4,
        horas_despues: 168, // 7 días
        descripcion: 'Último email antes de que expire la preinscripción',
        variables_disponibles: [
            '{{nombre_corto}}', '{{curso_nombre}}', '{{link_inscripcion}}'
        ],
        contenido_html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914;">{{nombre_corto}},</h2>
        
        <p style="color: #374151; font-size: 16px;">
            Tu preinscripción a <strong>{{curso_nombre}}</strong> expira en las próximas horas.
        </p>
        
        <p style="color: #374151; font-size: 16px;">
            Después de eso, tendrías que volver a preinscribirte 
            (si quedan lugares disponibles).
        </p>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="color: #991b1b; font-size: 18px; margin: 0;">
                ⏰ <strong>Este es el último aviso</strong>
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link_inscripcion}}" 
               style="display: inline-block; background-color: #2d6a4f; color: white; 
                      padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                COMPLETAR INSCRIPCIÓN
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            P.D.: Si hay algo que te frena, respondé este email. Queremos ayudarte.
        </p>
    </div>
</body>
</html>`,
        contenido_texto: `{{nombre_corto}},

Tu preinscripción a "{{curso_nombre}}" expira en las próximas horas.

Después de eso, tendrías que volver a preinscribirte (si quedan lugares).

⏰ Este es el último aviso.

👉 Completá tu inscripción: {{link_inscripcion}}

P.D.: Si hay algo que te frena, respondé este email. Queremos ayudarte.

---
CEUTA`
    }
];
```

---

## 8. Procesador de Variables

```typescript
// Archivo: src/lib/utils/templateProcessor.ts

import { generateMagicLink } from './tokens';

export interface TemplateContext {
    inscripto: {
        id: number;
        nombre: string;
        email: string;
        telefono: string;
        access_token: string;
    };
    curso: {
        nombre: string;
        precio?: number;
        fecha_inicio?: string;
    };
}

/**
 * Procesa un template reemplazando las variables con valores reales
 */
export function processTemplate(
    template: string, 
    context: TemplateContext
): string {
    const { inscripto, curso } = context;
    
    // Extraer nombre corto (primer nombre)
    const nombreCorto = inscripto.nombre.split(' ')[0];
    
    // Generar link mágico
    const linkInscripcion = generateMagicLink(inscripto.access_token);
    
    // Formatear precio
    const cursoPrecie = curso.precio 
        ? `$${curso.precio.toLocaleString('es-UY')}` 
        : 'Consultar';
    
    // Formatear fecha
    const fechaInicio = curso.fecha_inicio || 'A confirmar';
    
    // Mapa de reemplazos
    const replacements: Record<string, string> = {
        '{{nombre}}': inscripto.nombre,
        '{{nombre_corto}}': nombreCorto,
        '{{email}}': inscripto.email,
        '{{telefono}}': inscripto.telefono,
        '{{curso_nombre}}': curso.nombre,
        '{{curso_precio}}': cursoPrecie,
        '{{fecha_inicio}}': fechaInicio,
        '{{link_inscripcion}}': linkInscripcion,
    };
    
    // Aplicar reemplazos
    let result = template;
    for (const [variable, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(variable, 'g'), value);
    }
    
    return result;
}
```

---

## 9. API Routes

### 9.1 Modificar API de inscripción existente

```typescript
// Archivo: src/app/api/inscripcion/route.ts (MODIFICAR)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateAccessToken, getTokenExpiry, generateMagicLink } from '@/lib/utils/tokens';
import { sendEmail, scheduleEmailSequence } from '@/lib/services/emailService';
import { processTemplate } from '@/lib/utils/templateProcessor';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { curso_id, nombre, email, telefono, cedula, edad, departamento, 
                direccion, como_se_entero, recibir_novedades, metodo_pago } = body;

        if (!curso_id || !nombre || !email || !telefono) {
            return NextResponse.json(
                { success: false, message: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Obtener datos del curso
        const { data: curso } = await supabase
            .from('cursos')
            .select('nombre, precio')
            .eq('id', curso_id)
            .single();

        // 🆕 Generar token de acceso
        const accessToken = generateAccessToken();
        const tokenExpiry = getTokenExpiry(30); // 30 días

        // Insertar inscripción con token
        const { data, error } = await supabase
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
                estado: 'pendiente',
                // 🆕 Nuevos campos
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

        // 🆕 Obtener template de confirmación
        const { data: template } = await supabase
            .from('email_templates')
            .select('*')
            .eq('nombre', 'confirmacion')
            .single();

        if (template) {
            // Preparar contexto para el template
            const context = {
                inscripto: {
                    id: data.id,
                    nombre,
                    email,
                    telefono,
                    access_token: accessToken,
                },
                curso: {
                    nombre: curso?.nombre || 'Curso CEUTA',
                    precio: curso?.precio,
                },
            };

            // Procesar y enviar email de confirmación
            const emailHtml = processTemplate(template.contenido_html, context);
            const emailText = processTemplate(template.contenido_texto, context);
            const emailSubject = processTemplate(template.asunto, context);

            await sendEmail({
                to: email,
                subject: emailSubject,
                html: emailHtml,
                text: emailText,
            }, data.id, 'confirmacion');
        }

        // 🆕 Programar secuencia de emails de seguimiento
        await scheduleEmailSequence(data.id);

        // 🆕 Generar link mágico para la respuesta
        const magicLink = generateMagicLink(accessToken);

        return NextResponse.json({
            success: true,
            message: 'Inscripción registrada exitosamente',
            id: data.id,
            // 🆕 Devolver link para mostrar en confirmación
            magicLink,
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
```

### 9.2 API para página personal (mi-inscripcion)

```typescript
// Archivo: src/app/api/mi-inscripcion/[token]/route.ts (NUEVO)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    const { token } = params;

    if (!token || token.length < 32) {
        return NextResponse.json(
            { success: false, message: 'Token inválido' },
            { status: 400 }
        );
    }

    const supabase = createAdminClient();

    // Buscar inscripción por token
    const { data: inscripcion, error } = await supabase
        .from('inscriptos')
        .select(`
            id,
            nombre,
            email,
            telefono,
            estado,
            metodo_pago,
            created_at,
            veces_visitado,
            token_expires_at,
            cursos (
                id,
                nombre,
                precio,
                mercadopago_link,
                fecha_inicio,
                modalidad,
                ubicacion
            )
        `)
        .eq('access_token', token)
        .single();

    if (error || !inscripcion) {
        return NextResponse.json(
            { success: false, message: 'Preinscripción no encontrada' },
            { status: 404 }
        );
    }

    // Verificar si el token expiró
    if (inscripcion.token_expires_at) {
        const expiry = new Date(inscripcion.token_expires_at);
        if (expiry < new Date()) {
            return NextResponse.json(
                { success: false, message: 'Este enlace ha expirado' },
                { status: 410 }
            );
        }
    }

    // Actualizar contador de visitas
    await supabase
        .from('inscriptos')
        .update({ 
            veces_visitado: (inscripcion.veces_visitado || 0) + 1,
            ultima_visita: new Date().toISOString()
        })
        .eq('id', inscripcion.id);

    return NextResponse.json({
        success: true,
        data: {
            id: inscripcion.id,
            nombre: inscripcion.nombre,
            email: inscripcion.email,
            estado: inscripcion.estado,
            metodo_pago: inscripcion.metodo_pago,
            fecha_inscripcion: inscripcion.created_at,
            curso: inscripcion.cursos,
        }
    });
}
```

---

Continúa en Parte 3...
