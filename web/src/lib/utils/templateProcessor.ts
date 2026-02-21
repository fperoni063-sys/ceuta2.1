import { generateMagicLink } from './tokens';

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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
        precio?: number | string;
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
    let cursoPrecio = 'Consultar';
    if (curso.precio !== undefined && curso.precio !== null) {
        if (typeof curso.precio === 'number') {
            cursoPrecio = `$${curso.precio.toLocaleString('es-UY')}`;
        } else {
            cursoPrecio = curso.precio;
        }
    }

    // Formatear fecha
    const fechaInicio = curso.fecha_inicio || 'A confirmar';

    // Mapa de reemplazos (sanitizados para prevenir XSS)
    const replacements: Record<string, string> = {
        '{{nombre}}': escapeHtml(inscripto.nombre),
        '{{nombre_corto}}': escapeHtml(nombreCorto),
        '{{email}}': escapeHtml(inscripto.email),
        '{{telefono}}': escapeHtml(inscripto.telefono),
        '{{curso_nombre}}': escapeHtml(curso.nombre),
        '{{curso_precio}}': cursoPrecio,
        '{{fecha_inicio}}': fechaInicio,
        '{{link_inscripcion}}': linkInscripcion,
    };

    // Aplicar reemplazos
    let result = template;
    for (const [variable, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return result;
}
