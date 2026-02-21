/**
 * Post-enrollment notification utilities
 * Provides functions for notifying staff and sending confirmations after enrollment
 */
import { COMPANY_INFO } from '../constants';

export interface EnrollmentData {
    id: number;
    curso_id: number;
    curso_nombre: string;
    nombre: string;
    email: string;
    telefono: string;
    cedula?: string | null;
    metodo_pago: 'transferencia' | 'mercadopago';
    codigo_descuento?: string | null;
}

/**
 * Generate WhatsApp message for Julia (secretary) about new enrollment
 */
export function generateJuliaNotificationMessage(enrollment: EnrollmentData): string {
    const paymentMethod = enrollment.metodo_pago === 'transferencia'
        ? '🏦 Transferencia bancaria'
        : '💳 Mercado Pago';

    const message = `📋 *Nueva Inscripción #${enrollment.id}*

👤 *Estudiante:* ${enrollment.nombre}
📧 Email: ${enrollment.email}
📱 Tel: ${enrollment.telefono}
${enrollment.cedula ? `🆔 CI: ${enrollment.cedula}` : ''}

📚 *Curso:* ${enrollment.curso_nombre}
💰 *Método de pago:* ${paymentMethod}
${enrollment.codigo_descuento ? `🎟️ Código: ${enrollment.codigo_descuento}` : ''}

⏳ Estado: Pendiente de pago`;

    return message;
}

/**
 * Generate WhatsApp deeplink for notifying Julia
 * Returns a URL that can be opened to send the notification message
 */
export function generateJuliaWhatsAppLink(enrollment: EnrollmentData): string {
    // Usamos la constante definida para secretaría (091 431 577)
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_SECRETARIA || COMPANY_INFO.whatsapp.secretaria;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(generateJuliaNotificationMessage(enrollment));

    return `https://wa.me/${cleanNumber}?text=${message}`;
}

/**
 * Generate confirmation email HTML for the enrollee
 */
export function generateConfirmationEmailHtml(enrollment: EnrollmentData): string {
    // Usamos la constante definida para contacto (098 910 715)
    // Se puede pasar como argumento si un futuro refactor lo permite, pero por ahora usamos el default actualizado
    const contactDisplay = COMPANY_INFO.whatsapp.contactoDisplay;
    const contactLink = `https://wa.me/${COMPANY_INFO.whatsapp.contacto}`;
    const emailContacto = COMPANY_INFO.email;

    const paymentInstructions = enrollment.metodo_pago === 'transferencia'
        ? `
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3 style="color: #166534; margin-top: 0;">Datos para la transferencia:</h3>
                <ul style="color: #374151; list-style: none; padding: 0;">
                    <li><strong>Banco:</strong> BROU</li>
                    <li><strong>Titular:</strong> CEUTA</li>
                    <li><strong>Cuenta:</strong> Consultar por WhatsApp</li>
                </ul>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                    Enviá el comprobante por WhatsApp al ${contactDisplay} para confirmar tu lugar.
                </p>
            </div>
        `
        : `
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">Pago con Mercado Pago</h3>
                <p style="color: #374151;">
                    Te contactaremos por WhatsApp con el link de pago, o podés acceder 
                    desde la página del curso.
                </p>
            </div>
        `;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Inscripción - CEUTA</title>
</head>
<body style="font-family: 'Source Sans 3', Arial, sans-serif; line-height: 1.6; color: #3d2914; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2d6a4f; font-family: 'Lora', Georgia, serif;">CEUTA</h1>
        <p style="color: #6b7280;">Centro Uruguayo de Tecnologías Apropiadas</p>
    </div>
    
    <div style="background-color: #faf6f1; padding: 30px; border-radius: 16px;">
        <h2 style="color: #3d2914; font-family: 'Lora', Georgia, serif; margin-top: 0;">
            ¡Hola ${enrollment.nombre.split(' ')[0]}! 🌱
        </h2>
        
        <p style="font-size: 18px;">
            Recibimos tu inscripción al curso <strong>${enrollment.curso_nombre}</strong>.
        </p>
        
        ${paymentInstructions}
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <h3 style="color: #3d2914; margin-top: 0;">Próximos pasos:</h3>
            <ol style="color: #374151; padding-left: 20px;">
                <li>Realizá el pago según el método elegido</li>
                <li>Enviá el comprobante por WhatsApp</li>
                <li>Te confirmaremos tu lugar en el curso</li>
            </ol>
        </div>
        
        <p style="margin-top: 30px; text-align: center;">
            <a href="${contactLink}?text=Hola!%20Acabo%20de%20inscribirme%20al%20curso%20${encodeURIComponent(enrollment.curso_nombre)}" 
               style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                💬 Contactar por WhatsApp
            </a>
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
        <p>
            CEUTA - Canelones 1198, Montevideo, Uruguay<br>
            <a href="mailto:${emailContacto}" style="color: #2d6a4f;">${emailContacto}</a>
        </p>
    </div>
</body>
</html>
    `;
}

/**
 * Generate plain text confirmation email for the enrollee
 */
export function generateConfirmationEmailText(enrollment: EnrollmentData): string {
    const contactDisplay = COMPANY_INFO.whatsapp.contactoDisplay;
    const emailContacto = COMPANY_INFO.email;

    const paymentMethod = enrollment.metodo_pago === 'transferencia'
        ? 'transferencia bancaria'
        : 'Mercado Pago';

    return `
¡Hola ${enrollment.nombre.split(' ')[0]}!

Recibimos tu inscripción al curso "${enrollment.curso_nombre}".

MÉTODO DE PAGO: ${paymentMethod}

${enrollment.metodo_pago === 'transferencia' ? `
DATOS PARA LA TRANSFERENCIA:
- Banco: BROU
- Titular: CEUTA
- Cuenta: Consultar por WhatsApp

Enviá el comprobante por WhatsApp al ${contactDisplay} para confirmar tu lugar.
` : `
Te contactaremos por WhatsApp con el link de pago de Mercado Pago.
`}

PRÓXIMOS PASOS:
1. Realizá el pago según el método elegido
2. Enviá el comprobante por WhatsApp
3. Te confirmaremos tu lugar en el curso

¿Tenés dudas? Escribinos por WhatsApp: ${contactDisplay}

---
CEUTA - Centro Uruguayo de Tecnologías Apropiadas
Canelones 1198, Montevideo, Uruguay
${emailContacto}
    `.trim();
}
