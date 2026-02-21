const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente para obtener credenciales
const envPath = path.resolve(__dirname, '../.env.local');
let processEnv = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            processEnv[key] = value;
        }
    });
} catch (e) {
    console.error('Error leyendo .env.local:', e);
    process.exit(1);
}

const supabaseUrl = processEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = processEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan credenciales de Supabase en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTemplate() {
    console.log('🔄 Actualizando template de email "confirmacion"...');

    const nuevoHtml = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
        <!-- Header con gradiente -->
        <div style="background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CEUTA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0; font-size: 14px;">Centro Uruguayo de Tecnologías Apropiadas</p>
        </div>
        
        <div style="padding: 30px;">
            <!-- Badge de estado -->
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="background: #dcfce7; color: #166534; padding: 10px 20px; border-radius: 50px; font-size: 14px; font-weight: bold;">
                    ✅ Cupo Reservado
                </span>
            </div>
            
            <!-- Saludo -->
            <h2 style="color: #3d2914; margin-top: 0;">Hola {{nombre_corto}},</h2>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Tu lugar en <strong>{{curso_nombre}}</strong> quedó reservado.
            </p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Para confirmar tu inscripción, completá el pago desde el botón de abajo.
            </p>
            
            <!-- CTA Principal -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{link_inscripcion}}" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
                          color: white; 
                          padding: 18px 40px; 
                          text-decoration: none; 
                          border-radius: 10px; 
                          font-weight: bold; 
                          font-size: 16px;
                          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);">
                    CONFIRMAR MI LUGAR
                </a>
            </div>
            
            <!-- Urgencia -->
            <p style="text-align: center; color: #f59e0b; font-size: 14px; margin: 20px 0;">
                ⏰ Tu reserva es válida por 7 días
            </p>
            
            <!-- Detalles del curso -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #374151; margin-top: 0; font-size: 14px;">Detalles:</h3>
                <ul style="color: #374151; list-style: none; padding: 0; margin: 0; font-size: 14px;">
                    <li style="padding: 5px 0;">📚 <strong>Curso:</strong> {{curso_nombre}}</li>
                    <li style="padding: 5px 0;">💰 <strong>Inversión:</strong> {{curso_precio}}</li>
                    <li style="padding: 5px 0;">📅 <strong>Inicio:</strong> {{fecha_inicio}}</li>
                </ul>
            </div>
            
            <!-- WhatsApp -->
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                ¿Tenés alguna duda? Escribinos por 
                <a href="https://wa.me/59898843651" style="color: #25D366; text-decoration: none;">WhatsApp</a>
            </p>
            
            <!-- Despedida -->
            <p style="color: #374151; font-size: 16px; margin-top: 30px;">
                Nos vemos pronto,<br>
                <strong>CEUTA</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                CEUTA - Canelones 1198, Montevideo
            </p>
        </div>
    </div>
</body>
</html>`;

    const nuevoTexto = `Hola {{nombre_corto}},

Tu lugar en "{{curso_nombre}}" quedó reservado.

Para confirmar tu inscripción, completá el pago desde este link:
{{link_inscripcion}}

⏰ Tu reserva es válida por 7 días.

DETALLES:
- Curso: {{curso_nombre}}
- Inversión: {{curso_precio}}
- Inicio: {{fecha_inicio}}

¿Tenés alguna duda? Escribinos por WhatsApp: 098 843 651

Nos vemos pronto,
CEUTA

---
CEUTA - Canelones 1198, Montevideo`;

    const { data, error } = await supabase
        .from('email_templates')
        .update({
            asunto: 'Tu lugar en {{curso_nombre}} quedó reservado',
            contenido_html: nuevoHtml,
            contenido_texto: nuevoTexto,
            updated_at: new Date().toISOString()
        })
        .eq('nombre', 'confirmacion')
        .select();

    if (error) {
        console.error('❌ Error actualizando template:', error);
    } else {
        console.log('✅ Template actualizado exitosamente:', data);
    }
}

updateTemplate();
