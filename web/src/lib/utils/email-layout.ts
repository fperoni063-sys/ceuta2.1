
interface WrapperOptions {
    title: string;
    content: string;
    previewText?: string;
    badgeText?: string;
    badgeColor?: 'success' | 'warning' | 'error' | 'info';
}

/**
 * Generates the full HTML for a system email with the standard CEUTA design.
 */
export function generateEmailHtml({ title, content, previewText, badgeText, badgeColor = 'info' }: WrapperOptions): string {
    // Badge colors
    const badgeStyles = {
        success: 'background: #dcfce7; color: #166534;',
        warning: 'background: #fef9c3; color: #854d0e;',
        error: 'background: #fee2e2; color: #991b1b;',
        info: 'background: #e0f2fe; color: #075985;',
    };

    const currentBadgeStyle = badgeStyles[badgeColor] || badgeStyles.info;

    // Optional badge HTML
    const badgeHtml = badgeText
        ? `
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="${currentBadgeStyle} padding: 10px 20px; border-radius: 50px; font-size: 14px; font-weight: bold;">
                ${badgeText}
            </span>
        </div>`
        : '';

    // Optional preview text (hidden)
    const previewHtml = previewText
        ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
           <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>`
        : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    ${previewHtml}
    
    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <!-- Header con gradiente -->
        <div style="background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">CEUTA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0; font-size: 14px;">Centro Uruguayo de Tecnologías Apropiadas</p>
        </div>
        
        <div style="padding: 40px 30px;">
            ${badgeHtml}
            
            ${content}
            
            <!-- WhatsApp -->
            <div style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                    ¿Tenés alguna duda? Escribinos por 
                    <a href="https://wa.me/59898910715" style="color: #25D366; text-decoration: none; font-weight: bold;">WhatsApp</a>
                </p>
            </div>
            
            <!-- Despedida -->
            <p style="color: #374151; font-size: 16px; margin-top: 30px; text-align: center;">
                Nos vemos pronto,<br>
                <strong>El equipo de CEUTA</strong>
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
</html>
    `.trim();
}
